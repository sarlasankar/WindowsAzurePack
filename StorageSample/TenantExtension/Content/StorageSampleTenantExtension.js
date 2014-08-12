﻿/// <reference path="scripts/storageSampleTenant.createwizard.js" />
/// <reference path="scripts/storageSampleTenant.controller.js" />
/*globals window,jQuery,Shell, StorageSampleTenantExtension, Exp*/

(function ($, global, undefined) {
    "use strict";

    var resources = [],
        StorageSampleTenantExtensionActivationInit,
        navigation,
        serviceName = "storageSample";

    function onNavigateAway() {
        Exp.UI.Commands.Contextual.clear();
        Exp.UI.Commands.Global.clear();
        Exp.UI.Commands.update();
    }

    function loadSettingsTab(extension, renderArea, renderData) {
        global.StorageSampleTenantExtension.SettingsTab.loadTab(renderData, renderArea);
    }

    function containersTab(extension, renderArea, renderData) {
        global.StorageSampleTenantExtension.ContainersTab.loadTab(renderData, renderArea);
    }

    global.StorageSampleTenantExtension = global.StorageSampleTenantExtension || {};

    navigation = {
        tabs: [
            {
                id: "containers",
                displayName: "File Shares",
                template: "containersTab",
                activated: containersTab
            }            
        ],
        types: [
        ]
    };

    StorageSampleTenantExtensionActivationInit = function () {
        var subs = Exp.Rdfe.getSubscriptionList(),
            subscriptionRegisteredToService = global.Exp.Rdfe.getSubscriptionsRegisteredToService("storagesample"),
            storageSampleExtension = $.extend(this, global.StorageSampleTenantExtension);

        // Don't activate the extension if user doesn't have a plan that includes the service.
        if (subscriptionRegisteredToService.length === 0) {
            return false; // Don't want to activate? Just bail
        }

        $.extend(storageSampleExtension, {
            viewModelUris: [storageSampleExtension.Controller.userInfoUrl],
            displayName: "Storage Sample",
            navigationalViewModelUri: {
                uri: storageSampleExtension.Controller.listContainersUrl,
                ajaxData: function () {
                    return global.Exp.Rdfe.getSubscriptionIdsRegisteredToService(serviceName);
                }
            },
            displayStatus: global.waz.interaction.statusIconHelper(global.StorageSampleTenantExtension.ContainersTab.statusIcons, "Status"),
            menuItems: [
                {
                    name: "Containers",
                    displayName: "Storage Sample",
                    url: "#Workspaces/StorageSampleTenantExtension",
                    preview: "createPreview",
                    isEnabled: function () {
                        return {
                            enabled: true,
                            description: "Create data services like Blob Storage Container, Hadoop etc."
                        }
                    },
                    subMenu: [
                        getQuickCreateContainerMenuItem()
                    ]
                }
            ],
            getResources: function () {
                return resources;
            }
        });

        storageSampleExtension.onNavigateAway = onNavigateAway;
        storageSampleExtension.navigation = navigation;

        Shell.UI.Pivots.registerExtension(storageSampleExtension, function () {
            Exp.Navigation.initializePivots(this, this.navigation);
        });

        // Finally activate and give "the" storageSampleExtension the activated extension since a good bit of code depends on it
        $.extend(global.StorageSampleTenantExtension, Shell.Extensions.activate(storageSampleExtension));
    };

    function getQuickCreateContainerMenuItem() {
        return {
            name: "QuickCreate",
            displayName: "Create Container",
            description: "Create new container",
            template: "quickCreateContainer",
            label: "CREATE",

            opening: function () {
                var promise = Shell.Net.ajaxPost({
                    url: global.StorageSampleTenantExtension.Controller.listLocationsUrl,
                    data: {}
                });
                promise.done(function (response) {
                    var listOfLocations = response.data;
                    var locationDropDown = $('#hw-qc-share-server');
                    var options = $.templates("<option value=\"{{>LocationId}}\">{{>LocationName}}</option>").render(listOfLocations);
                    locationDropDown.append(options);
                });
            },

            open: function () {
            },

            ok: function (object) {
                var name = 'd0c86023-1500-44a7-bb57-757295dacdea';
                var data = {};
                data.subscriptionId = name;
                data.container = {};
                data.container.ContainerName = object.fields['containerName'];
                data.container.SubscriptionId = name;
                data.container.LocationId = object.fields['selectedLocation'];
                
                var promise = Shell.Net.ajaxPost({
                    url: global.StorageSampleTenantExtension.Controller.createContainerUrl,
                    data: data
                });

                global.waz.interaction.showProgress(
                    promise,
                    {
                        initialText: "Creating container '" + name + "'.",
                        successText: "Successfully created container '" + name + "'.",
                        failureText: "Failed to create container '" + name + "'."
                    }
                );

                promise.done(function () {
                    return true;
                });
                promise.fail(function () {
                    return false;
                });
            },

            cancel: function (dialogFields) {
                // you can return false to cancel the closing
            }
        };
    }

    Shell.Namespace.define("StorageSampleTenantExtension", {
        serviceName: serviceName,
        init: StorageSampleTenantExtensionActivationInit,
        getQuickCreateContainerMenuItem: getQuickCreateContainerMenuItem
    });
})(jQuery, this);

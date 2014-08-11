﻿/*globals window,jQuery,Shell,Exp,waz*/

(function (global, $, shell, exp, resources, constants, undefined) {
    "use strict";

    var helloWorldExtensionActivationInit,
        navigation;   

    function clearCommandBar() {
        Exp.UI.Commands.Contextual.clear();
        Exp.UI.Commands.Global.clear();
        Exp.UI.Commands.update();
    }

    function onApplicationStart() {
        Exp.UserSettings.getGlobalUserSetting("Admin-skipQuickStart").then(function (results) {
            var setting = results ? results[0] : null;
            if (setting && setting.Value) {
                global.StorageSampleAdminExtension.settings.skipQuickStart = JSON.parse(setting.Value);
            }
        });
                
        global.StorageSampleAdminExtension.settings.skipQuickStart = false;
    }

    function loadQuickStart(extension, renderArea, renderData) {
        clearCommandBar();
        global.StorageSampleAdminExtension.QuickStartTab.loadTab(renderData, renderArea);
    }

    function loadFileServersTab(extension, renderArea, renderData) {
        global.StorageSampleAdminExtension.FileServersTab.loadTab(renderData, renderArea);
    }

    function loadProductsTab(extension, renderArea, renderData) {
        global.StorageSampleAdminExtension.ProductsTab.loadTab(renderData, renderArea);
    }

    function loadSettingsTab(extension, renderArea, renderData) {
        global.StorageSampleAdminExtension.SettingsTab.loadTab(renderData, renderArea);
    }

    function loadControlsTab(extension, renderArea, renderData) {
        global.StorageSampleAdminExtension.ControlsTab.loadTab(renderData, renderArea);
    }

    function loadLocationsTab(extension, renderArea, renderData) {
        global.StorageSampleAdminExtension.LocationsTab.loadTab(renderData, renderArea);
    }

    global.helloWorldExtension = global.StorageSampleAdminExtension || {};

    navigation = {
        tabs: [
                {
                    id: "quickStart",
                    displayName: "quickStart",
                    template: "quickStartTab",
                    activated: loadQuickStart
                },
                {
                    id: "locations",
                    displayName: "locations",
                    template: "locationsTab",
                    activated: loadLocationsTab
                },
                {
                    id: "settings",
                    displayName: "settings",
                    template: "settingsTab",
                    activated: loadSettingsTab
                }
        ],
        types: [
        ]
    };

    helloWorldExtensionActivationInit = function () {
        var helloWorldExtension = $.extend(this, global.StorageSampleAdminExtension);

        $.extend(helloWorldExtension, {
            displayName: "Storage Sample",
            viewModelUris: [
                global.StorageSampleAdminExtension.Controller.adminSettingsUrl,
                global.StorageSampleAdminExtension.Controller.adminProductsUrl,
            ],
            menuItems: [
                {
                    name: constants.extensionName,
                    displayName: resources.MenuFirstStoryDisplayName,
                    url: "#Workspaces/StorageSampleAdminExtension",
                    description: resources.MenuRunbookQuickCreateDescription,
                    isEnabled: function () {
                        //var isExtensionReady = automationAdminExtension.settings.isAutomationEndpointRegistered && global.Shell.extensionIndex.AutomationAdminExtension.dataIsLoaded;
                        //return {
                        //    enabled: isExtensionReady,
                        //    description: isExtensionReady ? resources.MenuRunbookQuickCreateDescription : resources.AutomationResourceNotAvailable
                        //};
                        return {
                            enabled: true,
                            description: "Create data services like Blob Storage, Hadoop etc."
                        }
                    },
                    subMenu: [
                        StorageSampleAdminExtension.Menu.getQuickCreateLocationMenuItem()
                    ]
                }
            ],
            settings: {
                skipQuickStart: true
            },
            getResources: function () {
                return resources;
            }
        });

        helloWorldExtension.onApplicationStart = onApplicationStart;        
        helloWorldExtension.setCommands = clearCommandBar();

        Shell.UI.Pivots.registerExtension(helloWorldExtension, function () {
            Exp.Navigation.initializePivots(this, navigation);
        });

        // Finally activate helloWorldExtension 
        $.extend(global.StorageSampleAdminExtension, Shell.Extensions.activate(helloWorldExtension));
    };

    Shell.Namespace.define("StorageSampleAdminExtension", {
        init: helloWorldExtensionActivationInit
    });

})(this, jQuery, Shell, Exp, StorageSampleAdminExtension.Resources, StorageSampleAdminExtension.Constants);
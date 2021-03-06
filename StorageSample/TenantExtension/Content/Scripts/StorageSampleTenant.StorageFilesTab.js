﻿/// <reference path="StorageSampletenant.createwizard.js" />
/// <reference path="StorageSampletenant.controller.js" />
/*globals window,jQuery,StorageSampleTenantExtension,Exp,waz,cdm*/
(function ($, global, undefined) {
    "use strict";

    var controller = global.StorageSampleTenantExtension.Controller,
        constants = global.StorageSampleTenantExtension.Constants,
        tabInitData,
        tabRenderArea,
        observableGrid,
        selectedRow,
        statusIcons = {
            Registered: {
                text: "Registered",
                iconName: "complete"
            },
            Default: {
                iconName: "spinner"
            }
        };

    function onRowSelected(row) {
        selectedRow = row;
        updateContextualCommands(row);
    }

    function onUploadCommandInvoke() {
        var _deferred = $.Deferred(),
            formSelector = "#storageFileUploadForm";

        global.Shell.UI.DialogPresenter.show({
            extension: "StorageSampleTenantExtension",
            name: "StorageFileUpload",
            template: "FileUploadWizard",
            data: {
                data: tabInitData
            },

            init: function () {
                global.Shell.UI.Validation.setValidationContainer(formSelector);
            },

            ok: function () {
                if (!global.Shell.UI.Validation.validateContainer(formSelector)) {
                    return false;
                } else {
                    var promise = controller.uploadFileAsync(formSelector);
                    global.waz.interaction.showProgress(
                        promise,
                        {
                            initialText: "Uploading image file.",
                            successText: "Successfully uploaded image file to storage folder.",
                            failureText: "Failed to upload file to storage folder."
                        }
                    );
                    promise.done(function (result) {
                        loadGrid(tabInitData.subscriptionId, tabInitData.folderId);
                        _deferred.resolve(result);
                    })
                    .fail(function (result) {
                        _deferred.fail(result);
                    });
                    $(formSelector).submit();
                    return true;
                }
            }
        });
    }

    function onDeleteCommandInvoke() {
    }

    function updateContextualCommands(row) {
        var isOperable = global.waz.dataWrapper.isRowOperable(row);
        Exp.UI.Commands.Global.clear();
        Exp.UI.Commands.Contextual.clear();
        Exp.UI.Commands.Contextual.add(new Exp.UI.Command("Upload", "Upload", Exp.UI.CommandIconDescriptor.getWellKnown("upload"), true, null, onUploadCommandInvoke));
        //Exp.UI.Commands.Contextual.add(new Exp.UI.Command("Delete", "Delete", Exp.UI.CommandIconDescriptor.getWellKnown("delete"), isOperable, null, onDeleteCommandInvoke));
        Exp.UI.Commands.update();
    }

    function loadGrid() {
        var columns = [
                { name: "Name", field: "StorageFileName", sortable: false },
                { name: "Size (Bytes)", field: "TotalSize", filterable: false, sortable: false },
        ];
        var promise = controller.getStorageFilesAsync(tabInitData.subscriptionId, tabInitData.folderId);
        promise.done(function (response) {
            if (response && response.data) {
                observableGrid = tabRenderArea.find(".gridFolder")
                                    .wazObservableGrid("destroy")
                                    .wazObservableGrid({
                                        lastSelectedRow: null,
                                        data: response.data,
                                        keyField: "StorageFileName",
                                        columns: columns,
                                        gridOptions: {
                                            rowSelect: onRowSelected
                                        },
                                        emptyListOptions: {
                                            extensionName: "StorageSampleTenantExtension",
                                            templateName: "StorageFilesTabEmpty",
                                        }
                                    });
            }
        });
    }

    // Public
    function loadTab(extension, renderArea, initData) {
        tabRenderArea = renderArea;
        tabInitData = initData;
        loadGrid();
    }

    function forceRefreshGridData() {
        try {
            // When we navigate to the tab, sometimes this method is called before observableGrid is not intialized, which will throw exception.
            observableGrid.wazObservableGrid("refreshData");
        } catch (e) {
            // When the grid fails to refresh, we still need to refresh the underlying dataset to make sure it has latest data; otherwise will cause data inconsistent.
            // TODO: When we send request to tenant, we need to provide subscription id as well.
            // Exp.Data.forceRefresh(StorageSampleTenantExtension.Controller.getSharesDataSetInfo().dataSetName);
        }
    }

    function cleanUp() {
        if (observableGrid) {
            observableGrid.wazObservableGrid("destroy");
            observableGrid = null;
        }
    }

    global.StorageSampleTenantExtension = global.StorageSampleTenantExtension || {};
    global.StorageSampleTenantExtension.StorageFilesTab = {
        loadTab: loadTab,
        cleanUp: cleanUp,
        forceRefreshGridData: forceRefreshGridData,
        statusIcons: statusIcons
    };
})(jQuery, this);

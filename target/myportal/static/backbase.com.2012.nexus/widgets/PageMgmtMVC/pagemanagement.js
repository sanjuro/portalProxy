/**
 * Copyright © 2011 Backbase B.V.
 */

b$.module("bd.widgets.PageMgmtMVC", function () {
    bd.pm.observer = {
        init : "pageMgntInit",
        updateView   : "updatePMView",
        pageDetails  : "getPageDetails",
        linkDetails  : "getlinkDetails",
        validator    : "validator",
        errorMsg     : "showErrorMsg",
        addLink      : "addLink",
        addJstreeNode: "addJstreeNode",
        deleteLink   : "deleteLink",
        setAsDefaultLandingPage : 'setDefaultLandingPage',
        updateLink   : "updateLink",
        checkMPFeature : "checkMPFeature",
        panelToView  : "panelToView",
        revertTree   : "revertTree",
        updateJstree : "updateJstree",
        search       : "search",
        searchResult : "searchResult",
        cancelSearch : "cancelSearch",
        updateOrder  : "updateOrder",
        updateLinkDetail : "updateLinkDetail",
        highlightLink : "highlightLink",
        loadingChildren : "loadingChildren",

        contentLocked: "contentLocked",

        initFirstLevel : 'initFirstLevel',
        selectFirstPage: "selectFirstPage",
        updateVisibleLink: "updateVisibleLink",
        updatePermissions: "updatePermissions",
        getSelectedLinkTree : "getSelectedLinkTree",

        /* action dropdown */
        actionBtnReady : "actionBtnReady",
        actionBtnBeforeOpen : "actionBtnBeforeOpen",
        actionBtnOptionsData : "actionBtnOptionsData",

        /* tab container */
        //getOrderForInitTabs : "getOrderForInitTabs",
        refreshTab : "refreshTab",

        /* jsTree */
        jsTreeStartDrag: "jsTreeStartDrag",
        jsTreeStopDrag: "jsTreeStopDrag",
        jsTreeDropCheck: "JSTREE_DROP_CHECK",
        jsTreeDropFinish: "JSTREE_DROP_FINISH",
        jsTreeLoadNode: "jsTreeLoadNode",
        openJstreeNode: "openJstreeNode",
        openCorrectAccordion: "openCorrectAccordion",

        restoreMenu: "restoreMenu",
        openCurrentLinkSettings: "openCurrentLinkSettings",
        renderSEO: "renderSEO",

        /* action drop down */
        openActionDropdown : 'openActionDropdown',
        closeActionDropdown : 'closeActionDropdown',
        initActionDropdown : 'initActionDropdown',

        /* nav widget */
        navPrefShow : "navPrefShow",

        /* master pages */
        masterPageDeleted: "masterPageDeleted"

    };

    var Publishing = b$.require('bd.publishing.Publishing');
    var publishing = new Publishing(true);


    var startPageManagement = function (oGadgetBody, sGadgetUrl) {
        if(!this.started){
            this.started = true;
            bd.observer.notifyObserver(bd.notifications.pageMgmt.START, {
                oGadgetBody: oGadgetBody
            });
        }
    };

    var stopPageManagement = function(){
        var key,value;
        this.started = null;
        for(key in bd.pm.observer){
            value = bd.pm.observer[key];
            bd.observer.removeObserver(value);
        }

        bd.observer.notifyObserver(bd.notifications.pageMgmt.STOP, this);

    };

    this.Maximized = startPageManagement;
    this.Dashboard = stopPageManagement;
});

/* globals jQuery, $, be, bd, bc */

/*
 *  ----------------------------------------------------------------
 *  Copyright Backbase b.v. 2003/2013
 *  All rights reserved.
 *  ----------------------------------------------------------------
 *  Version 5.5
 *  Author : Backbase R&D - Amsterdam - New York
 *  Filename : PageMgmt.Model.js
 *  Description:
 *  This class only contain the link json object on the local memory
 *  ----------------------------------------------------------------
 */

window.bd.pm = window.bd.pm || {};

/*----------------------------------------------------------------*/
/*
/*----------------------------------------------------------------*/
be.utils.define('bd.pm.model', ['jQuery'], function($) {
    var getCurrentPageModel = function() {
        var iframes = document.getElementsByTagName('iframe'),
            This;

        for (var n = iframes.length; n--; ) {
            This = iframes[n] ? (iframes[n].contentWindow || iframes[n].window) : window;
            if (This.b$ && This.b$.portal) {
                return This.b$.portal.portalModel.getElementsByTagName('Page')[0];
            }
        }
        return null;
    };

    var initStorage = function() {
        bd.pm.model.storage = new bd.Storage({
            driver: 'LocalStorage',
            options: {
                namespace: bd.selectedPortalName
            }
        });
    };

    return {
        init: function () {
            this.reset();
            bd.pm.model.getCurrentPageModel = getCurrentPageModel;
            initStorage();
        },
        reset: function () {
            bd.pm.model.links = {};
            bd.pm.model.rootLinks = {};
            bd.pm.model.pageTemplates= [];
            bd.pm.model.cachedTemplateData = {};
            bd.pm.model.storage = null;
        },

        /**
         * Sometimes publishing tries to fetch link model before it's being populated in bd.pm.model.links.
         * This method returns model if it's there, otherwise tries to fetch it later. After third try it rejects promise with "link ... not found" message
         * @param  {String} uuid - Link UUID
         * @return {Object}      jQuery Promise
         */
        getLink: function(uuid){
            var deferred = new $.Deferred();
            var counter = 3;

            if (bd.pm.model.links[uuid]) {
                deferred.resolve(bd.pm.model.links[uuid]);
            } else {
                var wait = setInterval(function(){
                    counter--;
                    if (bd.pm.model.links[uuid]){
                        clearInterval(wait);
                        deferred.resolve(bd.pm.model.links[uuid]);
                    }
                    if (counter === 0) {
                        clearInterval(wait);
                        deferred.reject('Link ' + uuid + ' not found');
                    }
                }, 100);
            }

            return deferred.promise();
        }
    };
});

/*----------------------------------------------------------------*/
/*
/*----------------------------------------------------------------*/
be.utils.define('bd.pm.pService', ['bd.pm.model'], function( Model ) {
    //var MSG_ADD_LINKS = "No Link(s) Found.";
    var hasMasterPageFeature = false, tJson, treeJson;

    var createLinksModel = function(data, params){
        if(data.documentElement){
            tJson = bd.xmlToJson({xml: data}).links || {link: []};
        }else{
            tJson = data;
        }
        if(!tJson.link){
            bd.observer.notifyObserver(bd.pm.observer.updateJstree, params);
            return;
        }
        if(tJson.link.length){
            if(tJson.link.length > params.maxItem){
                params.loadmore = true;
                params.skipCount += params.maxItem;
                tJson.link.pop();
            }else{
                params.loadmore = false;
            }
        }
        if(params.isSelectedTree){
            params.openTarget = tJson.link.uuid;
            tJson = tJson.link.children;
        }
        if(params.openTarget){
            treeJson = generateJStreeJson(tJson, false, params.isSelectedTree, params.depth || 1);
            params.data = treeJson;
            bd.observer.notifyObserver(bd.pm.observer.updateJstree, params);
        }else{
            if(tJson.link.constructor === Array){
                tJson.link.sort(function (a, b){
                    if(a.name === "masterpage_root"){
                        return 1;
                    }else if(b.name === "masterpage_root"){
                        return -1;
                    }else{
                        return parseFloat(getProperty(a, "order")) - parseFloat(getProperty(b, "order"));
                    }
                });
            }
            treeJson = generateJStreeJson(tJson, true);
            bd.observer.notifyObserver(!params.event ? bd.pm.observer.init : params.event, {jsonData: treeJson, xmlData: data, params: params});
        }
    };

    var getProperty = function(jsonNode, propName, defaultValue){
        var value;
        if (jsonNode && jsonNode.properties && !jsonNode.properties.type && jsonNode.properties[propName]) {
            value = jsonNode.properties[propName].value;
        }
        return value ? value: defaultValue;
    };

    var refLink = function(){};

    var generateJStreeJson = function(jsonData, init, skipSave, depth){
        if (depth === undefined){
            depth = 0;
        }
        if (!jsonData.link) {
            jsonData = [];
        }
        else if (!jsonData.link.length) {
            jsonData = [jsonData.link];
        }
        else {
            jsonData = jsonData.link;
        }
        for(var i = jsonData.length - 1; i > -1 ; i--){
            var el = jsonData[i];
            if(init)el.isRoot = init;
            if (el.isRoot){
                bd.pm.model.rootLinks[el.uuid] = true;
            }
            if(el.parentItemName == "masterpage_root" || el.name == 'masterpage_root'){
                el.isMasterPage = true;
                if(el.securityProfile == "None" || el.securityProfile == "CONSUMER" ){
                    jsonData.splice(i, 1);
                    continue;
                }
            }
            var linkTitle = getProperty(el, "title", "");
            el.attr = {
                'id': el.uuid,
                'data-uuid': el.uuid
            };

            el.linkname = el.name;
            el.title = linkTitle;
            el.itemRef = getProperty(el, 'ItemRef', '');
            el.Url = getProperty(el, 'Url');
            el.linkTitle = getProperty(el, "title", "");
            el.sectionName = getProperty(el, 'sectionName', '');
            el.generatedUrl = getProperty(el, 'generatedUrl', '');
            el.order = getProperty(el, 'order', '0');
            el.depth = depth;

            //menu item type, page|externalLink|divider|menuHeader|alias|state
            el.itemtype = getProperty(el, 'itemType', '');
            el.parentPageRef = getProperty(el, 'parentPageRef', '');

            //Publishing
            el.nextPublishAction = el.nextPublishAction ? el.nextPublishAction : null;
            el.refLink = refLink;

            el.data = {title: linkTitle};

            if(el.children) {
                el.children = generateJStreeJson(el.children, false, skipSave, depth + 1);
            }
            if(!skipSave) bd.pm.model.links[el.uuid] = el;
        }
        return jsonData;
    };

    var mPageDataTransfer = function(link, page){

        var pageTemplate = page.properties.TemplateName && page.properties.TemplateName.value.toString();
        var pageTemplateTitle = null;


        var tags = page.tags,
            defaultTagsManageable = '',
            defaultTags = [],
            cusTag = {}, // [{key:'type'; value: 'aa, bb, cc', manageable: 'true'}] // why key???
            cusTags = [];

        for (var n = 0, m = tags.length; n < m; n++) { // tags[n] ==> Object {type: "regular", manageable: "true", value: "someTag"}
            if (tags[n].type === '' || tags[n].type === 'regular') {
                defaultTags.push(tags[n].value);
                if (!defaultTagsManageable || !tags[n].manageable) defaultTagsManageable = tags[n].manageable;
            } else {
                if (!cusTag[tags[n].type]) {
                    cusTag[tags[n].type] = {
                        key: tags[n].type,
                        manageable: tags[n].manageable,
                        value: tags[n].value
                    };
                } else {
                    cusTag[tags[n].type].value +=  ', ' + tags[n].value;
                    if (!tags[n].manageable) cusTag[tags[n].type].manageable = false;
                }
            }
        }

        defaultTags = defaultTags.join(', ');
        if (defaultTagsManageable === undefined || defaultTagsManageable === '') defaultTagsManageable = true;
        // we still have to make fake tags to display input fields... wtf ??????
        for (var n = 0, m = bd.typeOfTags.length; n < m; n++) {
            var type = bd.typeOfTags[n];
            if (!cusTag[type]) {
                cusTag[type] = {
                        key: type,
                        value: '',
                        manageable: true
                    };
            }
        }
        for (n in cusTag) cusTags.push(cusTag[n]);


        //Mustache template object
        var templateData = {
            // Link
            linkTitle           : link.properties.title.value,
            Url                 : link.properties.Url? link.properties.Url.value:null,
            uuid                : link.uuid,
            itemType            : link.properties.itemType.value,
            generatedUrl        : link.properties.generatedUrl.value,
            linkParentName      : link.parentItemName,
            sectionName         : link.properties.sectionName? link.properties.sectionName.value:null,
            masterPage          : link.isMasterPage ? null: "None",
            isMasterPage        : link.isMasterPage,
            securityProfile     : link.securityProfile,
            exposedLinkProperties: getExpProperties(link),
            hasMasterPageFeature: hasMasterPageFeature,
            contextRoot         : bd.contextRoot,
            portalName          : bd.selectedPortalName,
            urlRoot             : be.utils.getURLRoot(),

            //page
            pageName            : page.name,
            createdBy           : page.createdBy.toString(),
            createdDate         : bd.date.formatDateTime(page.createdTimestamp.toString()),
            modifiedBy          : page.lastModifiedItem.lastModifiedBy.toString(),
            modifiedDate        : bd.date.formatDateTime(page.lastModifiedItem.lastModifiedTimestamp.toString()),
            pageTitle           : page.properties.title.value.toString(),
            pageTemplate        : pageTemplateTitle,
            extendedMasterPage  : page.extendedItemName? page.extendedItemName : null,
            pageTemplateType    : bd.selectedPortalOptimizedFor,
            tagsUnmodified      : page.tags,
            tags                : defaultTags,
            tagsManageable      : defaultTagsManageable,
            cusTags             : cusTags,
            publishState        : page.publishState,
            lockState           : page.lockState,
            linkLockState       : link.lockState,
            nextPublishAction   : page.nextPublishAction,
            // buttonsClass        : publishing ? publishing.getButtonsClass(page, oParams) : '',   // add this attribute on the viewer
            // publishButtonClass  : publishing ? publishing.getPublishButtonClass(page, oParams) : '', // add this attribute on the viewer
            exposedPageProperties   : getExpProperties(page),
            hideEditButtons     : false,
            canEdit             : true,
            enableSEO           : page.properties.enableSEO && page.properties.enableSEO.value ? page.properties.enableSEO.value.toString() : null,
            canonicalLink       : (function(){
                var entries = page.referencedLinks && page.referencedLinks.linkEntry, entry;
                if(entries){
                    entry = $(entries).filter(function(){
                        if(this.key === 'bd_seo_canonical'){
                            return true;
                        }
                    })[0];
                    return entry ? entry.link : null;
                }
                return null;
            })()
        };

        templateData.linkUrl = templateData.Url ? templateData.Url : templateData.uuid;
        if(templateData.Url){
            templateData.hasFriUrl = true;
        }
        bd.pm.model.cachedTemplateData = templateData;

        templateData.pageTemplate = getPageTemplateName(pageTemplate) || null;
        templateData.pageTemplateValue = pageTemplate;

        if(page.extendedItemName && templateData.isMasterPage !== true){
            bd.masterpage.getMasterPageItem(templateData.portalName, page.extendedItemName, function(pageJson){
                templateData.masterPage = pageJson.properties.title.value;
                bd.observer.notifyObserver(bd.pm.observer.pageDetails, templateData);
            });
        }else if(templateData.isMasterPage){
            templateData.masterPage = page.extendedItemName;
            bd.observer.notifyObserver(bd.pm.observer.pageDetails, templateData);
        }else{
            bd.observer.notifyObserver(bd.pm.observer.pageDetails, templateData);
        }
    };

    var mLinkDataTransfer = function(link){
        var templateData = {
            // Link
            linkTitle: link.properties.title.value,
            Url: link.properties.Url ? link.properties.Url.value : null,
            uuid: link.uuid,
            itemType: link.properties.itemType.value,
            generatedUrl: link.properties.generatedUrl.value,
            linkParentName: link.parentItemName,
            sectionName: link.properties.sectionName ? link.properties.sectionName.value : null,
            isMasterPage: link.isMasterPage,
            securityProfile: link.securityProfile,
            hasMasterPageFeature: hasMasterPageFeature,
            contextRoot: bd.contextRoot,
            portalName: bd.selectedPortalName,
            urlRoot: be.utils.getURLRoot(),
            createdBy: link.createdBy.toString(),
            createdDate: bd.date.formatDateTime(link.createdTimestamp.toString()),
            modifiedBy: link.lastModifiedBy.toString(),
            modifiedDate: bd.date.formatDateTime(link.lastModifiedTimestamp.toString()),
            publishState: link.publishState,
            lockState: link.lockState,
            exposedLinkProperties: getExpProperties(link),
            hideEditButtons: false,
            canEdit: true
        };
        templateData.linkUrl = templateData.Url ? templateData.Url : templateData.uuid;
        if(templateData.Url){
            templateData.hasFriUrl = true;
        }

        if(link.properties.menuAccessibilityTitle && link.properties.menuAccessibilityTitle.value && !link.properties.menuAccessibilityTitle.value.type){
            templateData.menuAccessibilityTitle = link.properties.menuAccessibilityTitle.value;
        }
        bd.pm.model.cachedTemplateData = templateData;
        bd.observer.notifyObserver(bd.pm.observer.linkDetails, templateData);
    };

    var getExpProperties = function(item){
        var userRoles = ['sys2sys', 'admin', 'manager', 'user', 'anonymous'];
        var prop,
            exposedProperties = {
                inheritedPro: [],
                regularPro: [],
                seoPro: []
            },
            props = item.propertiesArray.concat([]);

        for (i=0; i<props.length; i++) {
            prop = props[i];
            if(prop['name'].indexOf('bd_seo') > -1){
                exposedProperties.seoPro.push(prop);
            }
            if (prop['viewHint'] !== undefined && $.inArray(prop['viewHint'], userRoles) !== -1 && userRoles.indexOf(b$.portal.loggedInUserRole) <= userRoles.indexOf(prop['viewHint'])) {
                prop['manageable'] = (prop['manageable'] !== 'false');
                if(prop['itemName'] !== item.name){
                    exposedProperties.inheritedPro.push(prop);
                }else{
                    exposedProperties.regularPro.push(prop);
                }
            }
        }

        return exposedProperties;
    };

    var addLinkObj = function(nJson, isMasterPage, isTargetingPage, pageName, customEvent){
        nJson.isMasterPage = isMasterPage;
        nJson.isTargetingPage = isTargetingPage;
        nJson.pageName = pageName;
        nJson.depth = 1;
        nJson.itemRef = nJson.referencedItem ? nJson.referencedItem.uuid : null;
        nJson.linkname = nJson.name;
        nJson.generatedUrl = getProperty(nJson, 'generatedUrl', '');
        nJson.linkTitle = getProperty(nJson, 'title', '');
        nJson.sectionName = getProperty(nJson, 'sectionName', '');
        nJson.customEvent = customEvent;
        bd.pm.model.links[nJson.uuid] = nJson;
        bd.observer.notifyObserver(bd.notifications.pageMgmt.LINK_ADDED, nJson);
		if(nJson.customEvent){
            bd.observer.notifyObserver(nJson.customEvent, nJson);
        }
    };

    var removeLinkObj = function(link){
        delete bd.pm.model.links[link.uuid];
        bd.observer.notifyObserver(bd.pm.observer.deleteLink, link);
    };

    var updateLinkObj = function(link, event, isClean, forceRefresh){
        var tempMap = {};
        var linkId = [];
        var updateChildrenLink = function(link){
            if(bd.pm.model.links[link.uuid]){
                if (!isClean || forceRefresh){
                    delete bd.pm.model.links[link.uuid].nextPublishAction; // force updating nextPublishAction
                    delete bd.pm.model.links[link.uuid].pageLockState; // force updating pageLockState
                    delete bd.pm.model.links[link.uuid].referencedItem; // force updating referencedItem
                    if (!isClean){
                        delete bd.pm.model.links[link.uuid].extendedItemName; // force updating extendedItemName
                    }
                }
                bd.pm.model.links[link.uuid] = be.utils.mergeJsonObj(bd.pm.model.links[link.uuid], link);
                if(!getProperty(link, 'Url') && getProperty(bd.pm.model.links[link.uuid], 'Url')){
                    delete bd.pm.model.links[link.uuid].properties.Url;
                }
            } else {
                generateJStreeJson({'link':link}, false, false, link.depth !== undefined ? link.depth : 1);
            }
            if(isClean){
                tempMap[link.uuid] = bd.pm.model.links[link.uuid];
            }
            var children = link.children? link.children.link : null;
            if(children){
                if (children.length === undefined){
                    children = [children];
                }
                for(var i=0; i<children.length; i++){
                    updateChildrenLink(children[i]);
                }
            }
            linkId.push(link.uuid);
        };
        if(link instanceof Array){
            for(i=0; i<link.length; i++){
                updateChildrenLink(link[i]);
            }
        }else{
            updateChildrenLink(link);
        }
        //ToDo bd.pm.view.start_drag boolean doesn't set back false once it set to true. Need to fix it.
        if(isClean && !bd.pm.view.start_drag){
        //if(isClean){
            for (i in bd.pm.model.rootLinks){
                if (bd.pm.model.rootLinks.hasOwnProperty(i)){
                    tempMap[i] = bd.pm.model.links[i];
                }
            }
            bd.pm.model.links = tempMap;
        }
        if(event === bd.pm.observer.updateLinkDetail){
            bd.pm.controller.getDetails(linkId);
            bd.observer.notifyObserver(event, link);
        }
        else if(event){
            bd.observer.notifyObserver(event, {data: link, linkId: linkId});
        }
    };

    var setMasterPageFeature = function(b){
        hasMasterPageFeature = b;
        bd.observer.notifyObserver(bd.pm.observer.checkMPFeature, b);
    };

    var setPageTemplates = function(data){
        var templates = data.templates;
        if(templates && parseInt(templates.totalSize, 10) > 0) {
            bd.pm.model.pageTemplates = templates.template;
        }else{
            //TODO: temp fix for 0 templates
            //bd.pm.model.pageTemplates = [{name: 'defaultTemplate', properties : { title : {value : 'Templates Not Found'}}}];
            bd.pm.model.pageTemplates = [];
        }
    };

    var getPageTemplateName = function(name){
        var pageTemplateName = 'Page Template Not Found';
        for(var i=0; i < bd.pm.model.pageTemplates.length; i++){
            if(name === bd.pm.model.pageTemplates[i].name){
                pageTemplateName = bd.pm.model.pageTemplates[i].properties.title.value;
                break;
            }
        }
        return pageTemplateName;
    };

    var searchLinksModel = function(data){
        var sJson = {
            attr : {},
            children : [],
            data : { title : "Search Results" },
            isRoot : true,
            name : "Search Results",
            uuid : ""
        };

        var sTree = generateJStreeJson(data, false, false, 1);
        sJson.children = sTree;
        bd.observer.notifyObserver(bd.pm.observer.searchResult, sJson);
    };

    return {
        createLinksModel    :   createLinksModel,
        setMasterPageFeature:   setMasterPageFeature,
        setPageTemplates    :   setPageTemplates,
        getProperty         :   getProperty,
        mLinkDataTransfer   :   mLinkDataTransfer,
        mPageDataTransfer   :   mPageDataTransfer,
        addLinkObj          :   addLinkObj,
        removeLinkObj       :   removeLinkObj,
        updateLinkObj       :   updateLinkObj,
        getExpProperties    :   getExpProperties,
        searchLinksModel    :   searchLinksModel
    };
});

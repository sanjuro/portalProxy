/* globals jQuery, be, bd, bc */
/**
 * Copyright © 2011 Backbase B.V.
 */
bd.masterpage = (function() {

    var MASTER_PAGE_ROOT_LINK_NAME = 'masterpage_root';

    var USER_ROLES = ["anonymous", "user", "manager", "admin", "sys2sys"];

    var setMPPermission = function(templateData, groupRoleMap, pageName, portalName){
        var promise;
        var permissionData = {rightData: templateData};
        var pName = portalName || bd.selectedPortalName;
        var contextRoot = bd.contextRoot + '/portals/' + pName + '/pages/' + pageName+'/rights.xml';
        var MPRights = be.utils.processXMLTemplate('portalRights', permissionData);
        try{
            promise = be.utils.ajax({
                url: contextRoot,
                data: MPRights,
                type: 'PUT',
                success: function() {}
            });
        } catch (exception) {
           console.log(exception);
        }
        return promise;
    };

    var setMPLinkPermissionInheritedOnCreation = function(contextRootParam, portalName){
        //only work on creation because at that time all the rights are same as the master page root
        var pName = portalName || bd.selectedPortalName;
        var url = bd.contextRoot + '/portals/' + pName + '/links/' + MASTER_PAGE_ROOT_LINK_NAME + '/rights.xml';
        be.utils.ajax({
            url: url,
            type: 'GET',
            dataType: 'xml',
            success: function(data) {
                var jsonRights = bd.xmlToJson({xml: data}), itemRights, i, l, current, rightData = [];
                if(!jsonRights || !jsonRights.rights || !jsonRights.rights.itemRight) return;
                itemRights = jsonRights.rights.itemRight;

                if(!itemRights.length) itemRights = [ itemRights ];

                for(i=0, l=itemRights.length; i<l; i++){
                    current = itemRights[i];
                    rightData.push({securityProfile: 'NONE', sid: current.sid});
                }
                //console.log(rightData,contextRootParam)
                bd.Permission.setPermission({rightData: rightData}, false, contextRootParam);
            }
        });
    };

    var getMasterPageItem = function(portalName, masterPage, callback){
        return be.utils.ajax({
            url: bd.contextRoot + '/portals/' + portalName + '/catalog/' + masterPage + '.xml',
            dataType: 'xml',
            success: function(responseData){
                var pageJson = bd.xmlToJson({xml: responseData});
                callback(pageJson.page || pageJson.catalog && pageJson.catalog.page || {});
            },
            type: 'GET',
            error: function(){
                try{
                    //Temp solution, need to fix this in serverside
                    callback({properties: { title: {value: bd.pm.msg.MSG_NO_PERMISSION_ON_MASTER_PAGE}}});
                }catch(e){
                    console.log(e);
                }
            }
        });
    };

    // TODO: do we need to call that every time we open settings panel? Cache it in memory.
    // ...of course cache it...
    // cache will be deleted in bd.observer.addObserver(bd.pm.observer.addLink / .deleteLink / .updateLinkDetail
    var getMasterPageCatalog = function(portalName, parameters, callback){
        var url = '/portals/' + portalName;
        var isMasterPage = parameters.isMasterPage === true;
        var params = [
            'ps=100',
            'f=type(eq)PAGE',
            'f=name(not)RootPage' // hide RootPage element
        ].join('&');
        if(isMasterPage) {
            url = '';
        }
            be.utils.ajax({
                url: bd.contextRoot + url + '/catalog.xml',
                data: params,
                success: function(responseData){

                    var parsedXML = responseData;
                    // serialize xml docs to string since ie have issues with xml
                    if($.isXMLDoc(responseData)) {
                      parsedXML = (new XMLSerializer()).serializeToString(responseData);
                    }

                    var pagesJson = bd.xmlToJson({xml: parsedXML}).catalog || {};
                    // cache this precious values
                    if (!bd.masterpage.model) bd.masterpage.model = {};
                    pagesJson.page = (pagesJson.page && $.isArray(pagesJson.page)) ? pagesJson.page : pagesJson.page ? [pagesJson.page] : [];
                    bd.masterpage.model[portalName ? 'pages' : 'serverPages'] = pagesJson.page;

                    callback(pagesJson);
                },
                cache: false,
                type: 'GET'
            });
    };

    var setMasterPageProperty = function(childrenArray){
        if (childrenArray.link === null) {
            childrenArray = [];
        }
        else if (childrenArray.link.length === null) {
            childrenArray = [ childrenArray.link ];
        }
        else {
            childrenArray = childrenArray.link;
        }
        for(var i=0; i<childrenArray.length; i++){
            var link = childrenArray[i];
            link.isMasterPage = true;
            if(link.children){
                setMasterPageProperty(link.children);
            }
        }
    };

    var getMasterPageHtml = function(params){
        getMasterPageCatalog(params.portalName, params, function(masterPageList){
            var toggleTemplateField = function(mpName){
                var masterPageModel = masterPageList.page.filter(function(model, idx){
                    return model.name === mpName;
                })[0];
                if (masterPageModel && masterPageModel.properties.TemplateName && masterPageModel.properties.TemplateName.viewHint) {
                    var minUserRole = masterPageModel.properties.TemplateName.viewHint;
                    if (USER_ROLES.indexOf(b$.portal.loggedInUserRole) >= USER_ROLES.indexOf(minUserRole)) {
                        $('.templateWrapper').removeClass('hidden');
                    } else {
                        $('.templateWrapper').addClass('hidden');
                    }
                } else {
                    $('.templateWrapper').addClass('hidden');
                }
            };
            var options = [], masterpage, mpMap = {}, extendedMasterPage = '', mpArray = [], date = null, index = 0, selected, val,
                modelPage = {}, isNotMP = params.isMasterPage === undefined;
            if(isNotMP) {
                if(!document.getElementById('newPageForm')){
                    modelPage = bd.pm.model.getCurrentPageModel();
                }
            }
            if(masterPageList.page && masterPageList.page.length){
                mpArray = masterPageList.page;
                for(var i=0, l = mpArray.length; i<l; i++){
                    masterpage = mpArray[i];
                    mpMap[masterpage.name] = masterpage;
                    if(date === null){
                        date = be.utils.fromISO(masterpage.lastModifiedTimestamp);
                    }else{
                        var newDate = be.utils.fromISO(masterpage.lastModifiedTimestamp);
                        if(newDate > date){
                            date = newDate;
                            index = i;
                        }
                    }
                    if(params.extendedMasterPage === masterpage.name){
                        extendedMasterPage = masterpage.properties.title.value;
                        selected = masterpage.name;
                        options.push({
                            value: masterpage.name,
                            name: extendedMasterPage,
                            sel: true
                        });
                    }else{
                        options.push({
                            value: masterpage.name,
                            name: masterpage.properties.title.value
                        });
                    }
                }

                if(params.extendedMasterPage === ""){
                    extendedMasterPage = options[options.length-1].name;
                    options[options.length-1].sel = true;
                    selected = options[options.length-1].value;
                }
                if(params.extendedMasterPage === undefined){
                    extendedMasterPage = options[index].name;
                    options[index].sel = true;
                    selected = options[index].value;
                }
                // disable dropdown for targeting pages
                if(params.isTargetingPage){
                    options = [options[options.length-1]];
                    extendedMasterPage = options[0].name;
                    options[0].sel = true;
                    selected = options[0].value;
                }
            }

            if (options.length) {
                var templateList = bc.component.dropdown({
                    target: '.masterPageList',
                    label: extendedMasterPage,
                    selected: selected,
                    forlabel: 'masterPage',
                    uid: '3125',
                    options: options,
                    minWidth: '170px'
                });
                selectedMP = templateList[0].dropdownOptions[0];
                if(isNotMP) {
                    toggleTemplateField(selected);
                    $('a', selectedMP).on('click', function() {
                        toggleTemplateField(this.dataset.value);
                    });
                }
            } else {
                $('.masterPageList').html('<div class="alert alert-danger" role="alert">No master pages found</div>');
            }
        });
    };


    var masterPageProperty = function(name, mpMap) {
        var selectedMP = mpMap[name], mpProperties, htmlContent,
            templateUrl = be.contextRoot + "/static/backbase.com.2012.nexus/widgets/PageMgmtMVC/html/pages/customProperty.html";
        if (selectedMP) {
            mpProperties = bd.pm.pService.getExpProperties(selectedMP);
            htmlContent = be.utils.processHTMLTemplateByUrl(templateUrl, mpProperties);
            htmlContent = bd.pm.settingPanel.createCusProperties(jQuery(htmlContent));
            jQuery('.bd-masterPage-Property').html(htmlContent);
        }
    };
    var getMasterPageList = function(params, callback){
        var obj = {};
        var _getMasterPageList = function(masterPageList){
            var options = [];
            var mpArray = masterPageList.page;
            for(var i=0; i<mpArray.length; i++){
                var masterpage = mpArray[i];
                if(masterpage.extendedItemName !== params.pageName) {
                    if(params.uuid === masterpage.uuid){
                        obj.currentPage = masterpage.name;
                    }else{
                        options.push({
                            value: masterpage.name,
                            name: masterpage.properties.title.value
                        });
                    }
                }
            }
            if(options.length > 0){
                options[0].sel = true;
                obj.htmlContent = bc.component.dropdown({
                    uid: '1219',
                    options: options,
                    label: options[0].name
                });
            }

            callback(obj);
        };
        getMasterPageCatalog(params.portalName, params, _getMasterPageList);
    };

    var processSwapNDelete = function(currentPage, targetPage, params){
        var xmlContent = '<page><name>' + targetPage + '</name></page>';
        return be.utils.ajax({
            url: bd.contextRoot + '/portals/' + params.portalName + '/pages/' + currentPage + '/swapextensions',
            type: 'PUT',
            data: xmlContent
        });

    };


    var swapAndDelete = function(params){
        var _swapAndDelete = function(listContent){
            var htmlContent = jQuery(
                '<div class="bd-confirmationMsg">'
                + '  <div class="bd-confirmationInner">'
                + '    <h2>Attention</h2>'
                + '    <div class="bd-swapContent">'
                + '         <p>The master page is used for other pages. Please select a new master page for those pages: </p>'
                + '         <div class = "bd-swapMasterPage"></div>'
                + '    </div>'
                + '    <div class="bd-buttons">'
                + '         <button href="javascript:" class="bd-button bd-roundcorner-3 bd-ok">Continue</button>'
                + '         <button class="bd-button bd-roundcorner-8 bd-cancel">Cancel</button>'
                + '    </div>'
                + '  </div>'
                + '</div>'
            );
            if(listContent.htmlContent){
                htmlContent.find('.bd-swapMasterPage').html(listContent.htmlContent);
            }else{
                htmlContent.find('.bd-swapContent').html('<p>The master page is used for other pages. Please create a new master page for those pages</p>');
                htmlContent.find('.bd-buttons').html('<button class="bd-button bd-roundcorner-3 bd-cancel">Close</button>');
            }

            be.openDialog({
                htmlContent: htmlContent.get(0),
                closeIcon: params.closeIcon,
                standAlone: true,
                respondToEscKey: params.respondToEscKey,
                callback: function() {
                    htmlContent.find('.bd-ok').focus();
                },
                small: true
            });

            htmlContent.find('.bd-ok').click(function(e) {
                e.preventDefault();
                be.closeCurrentDialog();

                var targetPage = htmlContent.find('.bd-swapMasterPage select').val();
                processSwapNDelete(listContent.currentPage, targetPage, params).then(function(){
                    be.promise.deleteMasterPage(params.pageName, params.portalName).then( function(){
                        params.callback(targetPage);
                    }).fail( function (error) {
                        bc.component.notify({
                            icon: 'error',
                            message: error.errorMessage
                        });
                    });
                });

            });

            htmlContent.find('.bd-cancel').click(function(e) {
                e.preventDefault();
                be.closeCurrentDialog();
            });

        };
        getMasterPageList(params, _swapAndDelete);
    };


    //publish state of all master page
    var createExtendedPageToMasterPageMap = function(oSettings, $portalPagesListViewport, isReinit){
        if(!oSettings.loadPagesAndLinks.page || !oSettings.loadPagesAndLinks.link) return;
        var linkJson = bd.xmlToJson({xml: oSettings.loadPagesAndLinks.linkData});
        var pageJson = bd.xmlToJson({xml: oSettings.loadPagesAndLinks.pageData});
        var namePrefix = oSettings.loadPagesAndLinks.namePrefix; //avoid error in the IE : name start with number will gives error

        var masterPageLinkMap = {};
        var masterPageMap = {};
        var extendedPageMap = {};

        if(linkJson.links.link) linkJson = linkJson.links.link;
        if(pageJson.pages.page) pageJson = pageJson.pages.page;

        for(var i=0, len=linkJson.length; i<len; i++){
            if(linkJson[i].name === MASTER_PAGE_ROOT_LINK_NAME && linkJson[i].children.link){
                var childrenJson = linkJson[i].children.link.length ? linkJson[i].children.link: [linkJson[i].children.link];
                for(var j=0, jlen = childrenJson.length; j<jlen; j++){
                    var currentMasterPageLink = childrenJson[j];
                    if(!currentMasterPageLink.referencedItem || !currentMasterPageLink.referencedItem.uuid) continue;
                    var uuid = currentMasterPageLink.referencedItem.uuid;
                    masterPageLinkMap[uuid] = {
                        name: currentMasterPageLink.name,
                        publishState: currentMasterPageLink.publishState,
                        referencedItem: currentMasterPageLink.referencedItem
                    };
                }
                break;
            }
        }
        for(i = 0, len = pageJson.length; i<len; i++){
            var currentPage = pageJson[i];
            if(masterPageLinkMap[currentPage.uuid]){
                var masterPageUUID = namePrefix + currentPage.uuid;
                if(!masterPageMap[masterPageUUID]){
                    masterPageMap[masterPageUUID] = {};
                    masterPageMap[masterPageUUID].length = 0;
                }
                for(j=0, jlen = pageJson.length; j < jlen; j++){
                    if(pageJson[j].extendedItemName && pageJson[j].extendedItemName === currentPage.name && pageJson[j].uuid !== currentPage.uuid){
                        var extendedPageUUID = namePrefix + pageJson[j].uuid;
                        masterPageMap[masterPageUUID][extendedPageUUID] = true;//masterPageLinkMap[currentPage.uuid].publishState;
                        extendedPageMap[extendedPageUUID] = true;//masterPageLinkMap[currentPage.uuid].publishState;
                        masterPageMap[masterPageUUID].length = masterPageMap[masterPageUUID].length + 1;
                    }
                }
            }
        }

        oSettings.loadPagesAndLinks.extendedPageMap = extendedPageMap;
        oSettings.loadPagesAndLinks.masterPageMap = masterPageMap;


        if(!oSettings.loadPagesAndLinks.isInited || isReinit){
           oSettings.loadPagesAndLinks.isInited = true;
           bd.masterpage.highLightExtendedPage(oSettings.selectedPageLink, oSettings, $portalPagesListViewport);
        }
           bd.masterpage.extendedPagesCount(oSettings, $portalPagesListViewport);
        //return masterPageMap;
        this.oSettings = oSettings;
    };

    var highLightExtendedPage = function(li, oSettings, $portalPagesListViewport){
        oSettings = oSettings || this.oSettings;
        if(!oSettings.loadPagesAndLinks.masterPageMap || !oSettings.loadPagesAndLinks.isInited || !li || li.children('a.bd-tree-root').length) return;

        var namePrefix = oSettings.loadPagesAndLinks.namePrefix; //avoid error in the IE : name start with number will gives error
        var masterPageUUID = namePrefix + li.data('itemRef');
        if(li.data('isMasterPage') === true && oSettings.loadPagesAndLinks.masterPageMap[masterPageUUID]){
            var extendedPageList = oSettings.loadPagesAndLinks.masterPageMap[masterPageUUID];
            $portalPagesListViewport.children('ul').children(':not(li.bd-tree-masterpage)').find('li').trigger('masterPageEvent', [ extendedPageList, function(extendedPages){
                var $this = jQuery(this);
                if($this.data('itemtype') !== 'page') return;
                //if($this.data('isMasterPage') == true) return;
                if(extendedPages && extendedPages[namePrefix + $this.data('itemRef')]){
                    $this.children('a').append('<span class="bd-tree-pageIcon bd-tree-extended-page-flag"></span>');
                }else{
                    $this.children('a').children('.bd-tree-extended-page-flag').remove();
                }
            } ]);
        }else{
            $portalPagesListViewport.children('ul').children(':not(li.bd-tree-masterpage)').find('li').trigger('masterPageEvent', [ null, function(){
                var $this = jQuery(this);
                //$this.children('a').append('<span class="bd-tree-pageIcon bd-tree-extended-page-flag"></span>');
                $this.children('a').children('.bd-tree-extended-page-flag').remove();
            } ]);
        }

    };

    var extendedPagesCount = function(oSettings, $portalPagesListViewport){
        if(!oSettings.loadPagesAndLinks.masterPageMap || !oSettings.loadPagesAndLinks.isInited) return;
        var namePrefix = oSettings.loadPagesAndLinks.namePrefix; //avoid error in the IE : name start with number will gives error
        var extendedPageList = oSettings.loadPagesAndLinks.masterPageMap;

        $portalPagesListViewport.children('ul').children('li.bd-tree-masterpage').find('li').trigger('masterPageEvent', [ extendedPageList, function(extendedPages){
            var $this = jQuery(this);
            var extendedPageUUID = namePrefix + $this.data('itemRef');
            if(extendedPages && extendedPages[extendedPageUUID]){
                var extendedPageListLen = extendedPages[extendedPageUUID].length;
                var $extendedPageCountSpan = $this.children('a').find('.bd-tree-extended-page-count:first');
                if(!$extendedPageCountSpan.length){
                    $this.children('a').append('<span class="bd-tree-pageIcon bd-tree-extended-page-count">'+extendedPageListLen+'</span>');
                }else{
                    $extendedPageCountSpan.html(extendedPageListLen);
                }
            }
        } ]);

    };

    return {
        setMPPermission: setMPPermission,
        swapAndDelete: swapAndDelete,
        getMasterPageItem: getMasterPageItem,
        getMasterPageHtml: getMasterPageHtml,
        setMasterPageProperty: setMasterPageProperty,
        createExtendedPageToMasterPageMap: createExtendedPageToMasterPageMap,
        highLightExtendedPage: highLightExtendedPage,
        extendedPagesCount: extendedPagesCount,
        setMPLinkPermissionInheritedOnCreation: setMPLinkPermissionInheritedOnCreation,
        getMasterPageCatalog: getMasterPageCatalog
    };
})();

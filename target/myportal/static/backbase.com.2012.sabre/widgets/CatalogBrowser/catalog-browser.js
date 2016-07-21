
new function () { // Start Closure

    // all strings should go here
    var MSG = {
        NO_RESULTS_FOR_FILTER : "No results. There is no item that matches this filter."
    };

	var scope = function(){return this}();
//    var htmlAPI = b$._private.htmlAPI;
//    var templateApi = b$._private.template;


	scope.makeCatalogWidget = function(oWidget) {
		b$.mixin(oWidget, widget);

		oWidget.initialize();
	};

    scope.onFilterByTagUpdate = function(oEvent, oWidgetView) {
        oWidgetView.setMode('widgets', true);
    };

	var widget = {
        isCatalog : true,

		initialize: function() {
			this.updateHTML();
		},

		updateHTML: function() {
            //If parent of the widget is Portal - then it's a virtual widget
            this.isVirtualWidget = this.model.node.parentNode.nodeName == 'Portal';
            this.scrollAreaVisible = false;
            this.thumbnailWidth = 120;
            this.currentPage = 0;
            var templateUrl = "";
            if(!this.isVirtualWidget && this.model.getPreference('catalogBrowserTemplate')){
            	templateUrl = this.model.getPreference('catalogBrowserTemplate').replace("$(contextRoot)",be.contextRoot);
            }else{
            	templateUrl = be.contextRoot+"/static/backbase.com.2012.sabre/widgets/CatalogBrowser/catalogTemplates/blankTemplate.html";
            }
        	//var htmlTemplate = be.utils.loadTemplateByUrl(templateUrl);
        	var htmlContent = be.utils.processHTMLTemplateByUrl(templateUrl, {isVirtualWidget: this.isVirtualWidget});
        	jQuery(".pageDesignerItemWrapper", this.body).html(htmlContent);
            this.stripViewPort = jQuery(".pm-composer-stripViewPort", this.body)[0];
            this.strip = jQuery(".pm-composer-strip", this.body)[0];
            this.previousArrow = jQuery(".pm-composer-previous", this.body)[0];
            this.nextArrow = jQuery(".pm-composer-next", this.body)[0];
            this.pagingControl = jQuery(".pm-designer-pager", this.body)[0];

            if (this.isVirtualWidget) {
                //disabling edit toolbar functionality for panel catalog
                this.enableDesignMode = function() {};
                this.disableDesignMode = function() {};

                this.currentMode = null;
            } else {
                var oRootDiv = jQuery('.pageDesignerWrapper', this.body)[0];
                jQuery(oRootDiv)
                    .removeClass('pageDesignerWrapper')
                    .addClass('bb-CatalogBrowser');

                this.setMode('widgets', true);
                this.getTags('widgets');
            }

            jQuery(window)
                .unbind('resize.catalogBrowser')
                .bind('resize.catalogBrowser', jQuery.proxy(this.handleResize, this));


            // get message from iframe parent (.postMessage)
            if (window.addEventListener){
                addEventListener("message", jQuery.proxy(this.handleMessage, this), false)
            } else {
                attachEvent("onmessage", jQuery.proxy(this.handleMessage, this))
            }


        	//if bd.iceEnable == true, append the button
/*
        	if(top && top.bd && top.bd.iceEnable && this.isVirtualWidget){
        		var repoBrowserButton = '<button class="tb-button tb-repoBrowser">'
        								+'<div style="position: relative;"><div class="tb-icon"></div>Assets</div>'
        								+'</button>';
        		var oRootDiv = jQuery('.pageDesignerWrapper', this.htmlNode)[0];
        		jQuery(oRootDiv).find(".pageDesignerToolbar > .tb-publish").before(repoBrowserButton);
        	}*/


            this.registerEventHandlers();
            //FIXME: IE 6 fixed
            this.IEFix();
        },

        handleMessage: function(e) {
            if(e.data == 'hideScrollArea'){
                this.hideScrollArea();
            }
        },

        registerEventHandlers: function() {
            var oThis = this;

            [
                {
                    selector: '.tb-openClose',
                    callback:  function() {
                        this.setMode(this.currentMode || 'containers');
                        //this.getTags(this.currentMode || 'containers');
                    }
                },
                {
                    selector: '.tb-layouts',
                    callback: function() {
                        this.setMode('containers');
                        //this.getTags('containers');
                    }
                },
                {
                    selector: '.tb-widgets',
                    callback: function() {
                        this.setMode('widgets');
                        //this.getTags('widgets');
                    }
                },
                {
                    selector: '.pm-composer-previous',
                    callback: this.handlePrevious
                },
                {
                    selector: '.pm-composer-next',
                    callback: this.handleNext
                }/*,
                {
                    selector: '.tb-repoBrowser',
                    callback: function() {
                    	this.setMode('repoBrowser');
                    }
                }*/
            ].forEach(function(oObject) {
                var oButton = jQuery(oObject.selector, oThis.htmlNode)[0];
                jQuery(oButton).unbind('click');
                jQuery(oButton).bind('click', function() {
                    oObject.callback.apply(oThis, arguments);
                });
            });

            jQuery('.pm-composer', oThis.htmlNode).off().on('mousewheel DOMMouseScroll', function(event){
                event.preventDefault();
                event.stopPropagation();
                oThis.handleScroll(event.originalEvent.wheelDelta || -event.originalEvent.detail);
            });
        },

        getCatalogRequestURL: function(sMode) {
            var sType;
            if (sMode == 'widgets')
                sType = 'WIDGET';
            else
                sType = 'CONTAINER';
            var sUrl = b$.portal.config.serverRoot +'/portals/'+ encodeURI(b$.portal.portalName) +'/catalog.xml?';
            sUrl = sUrl + 'f=type(eq)' + sType + '&ps=100';
            if(this.isFilterByTag()){
            	var tagArray = this.model.getPreference("filterByTag").split(',');
            	if(tagArray.length > 1){
            		var tagStr = tagArray.join('&f=tag.name(like)');
            	}else{
            		var tagStr = tagArray.join('');
            	}
            	sUrl = sUrl + '&f=tag.name(like)' + encodeURI(tagStr);
            }else if(this.tagFilter){
            	sUrl = sUrl + '&f=tag.name(like)' + encodeURI(this.tagFilter);
            }
            return sUrl;
        },

        setMode: function(sMode, notShowScrollArea) {
            var This = this;
            if (sMode == this.currentMode && this.isVirtualWidget && !this.isTagFilter) {
                this.toggleVisibility();
                //if(this.scrollAreaVisible == false) this.currentMode = "none";
                this.updateToolbar();
            } else {
                if (!notShowScrollArea){
					this.showScrollArea();
				}
                this.currentMode = sMode;
                if(this.isVirtualWidget) this.updateToolbar();
                if(this.tagFilter) this.tagFilter = null;
                This.getData(sMode);
            }
        },
        getData : function(sMode, isClickTags){
            var This = this;
            var portalServer = b$.portal.portalServer;
            be.utils.ajax({
                url:this.getCatalogRequestURL(sMode),
                encodeURI: false,
                cache: false,
                success:function (data){
                    if ($.browser.msie) {
                        var doc = new ActiveXObject('Microsoft.XMLDOM');
                        doc.async = 'false';
                        doc.loadXML( data );
                        data = doc;
                    }else{
                        data = jQuery.parseXML(data);
                    }
                    var item = portalServer.itemXMLDOC2JSON(data);
                    var itemList = item.children;
                    itemList = This.addTagsListToJson(data, item.children);

                    //TODO : filter out the not needed widget/container, eg. manageable area
                    for (var i = itemList.length - 1; i > -1; i--) {
                        if(top.bd && top.bd.PageMgmtTree && top.bd.PageMgmtTree.selectedLink.isMasterPage !== true) {
                            if (itemList[i].preferences.isManageableArea && //manageable area
                                itemList[i].preferences.isManageableArea.value == 'true') {
                                itemList.splice(i, 1);
                            }
                        } else { //in master page
                            if (itemList[i].preferences.parentLinkUUID || itemList[i].extendedItemName === "BreadcrumbNav") { //tab container or breadcrumb
                                itemList.splice(i, 1);
                            }
                        }
                    }
                    //if(This.isFilterByTag()){
                    if (!isClickTags)
                        This.getTags(sMode, itemList);
                    //}

                    This.jsonData = itemList;//item.children;
                    This.appendHTMLIcon(This.jsonData);
                }
            });
        },
        isFilterByTag : function(){
        	if(this.model.getPreference("filterByTag") && !this.isVirtualWidget) return true;
        	else return false;
        },
        addTagsListToJson : function(xmlData, jsonData){
        	for(var i=0, len=jsonData.length; i < len; i++){
	        	var xpathStr = '//'+jsonData[i].tag+'[name = "'+jsonData[i].name+'"]/tags';
	        	var nodes = be.utils.xpathNodes(xmlData,xpathStr);
	        	var tagsArray = [];
	        	for(var j=0; j < nodes[0].childNodes.length; j++){
		    		try{
		    			tagsArray.push(nodes[0].childNodes[j].childNodes[0].nodeValue);
		    		}catch(e){}
		    	}
	        	jsonData[i].tagsArray = tagsArray;
        	}
        	return jsonData;
        },
        appendHTMLIcon : function(jsonData){
        	var This = this;
        	This.strip.innerHTML = '';
            if(jsonData && jsonData.length){
                for(var i=0;i<jsonData.length;i++){
                    var elm = This.buildHTMLIcon(jsonData[i]);
                    This.strip.appendChild(elm);
                }
            }else{
            	This.strip.appendChild(jQuery('<div style="color:#fff;width:200px;">' + MSG.NO_RESULTS_FOR_FILTER + '</div>')[0]);
            }
            This.recalculateViewPortSize(0);
        },
        getTags: function(sMode, jsonData){
            var sType, This = this;
            if(this.isFilterByTag()){
                this.createTagsMap(jsonData);
                this.createTagsHTML({tagArray : This.tagsData.tagArray}, sMode);
                return;
            }

            if (sMode == 'widgets')
                sType = 'WIDGET';
            else
                sType = 'CONTAINER';
            var tUrl = b$.portal.config.serverRoot+'/portals/'+ encodeURI(b$.portal.portalName) +'/tags/catalog?f=type(eq)'+sType;
            be.utils.ajax({
                url: tUrl,
                dataType:"xml",
                cache: false,
                success:function(xmlData){
                    var xmlToJson = be.xmlToJson || bd.xmlToJson;
                    var tagsJson = xmlToJson({xml: xmlData});
                    This.createTagsMap(jsonData);
                    for(var i=tagsJson.tagArray.length - 1; i > -1;i--){
                        if(!This.tagsData.tagMap[tagsJson.tagArray[i].toLowerCase()]) tagsJson.tagArray.splice(i,1);
                    }
                    This.createTagsHTML(tagsJson, sMode);
                },
                encodeURI: false
            });
        },
        createTagsMap : function(jsonData){
            var tagMap = {}, tagArray = [];
            if(jsonData && jsonData.length){
                for(var i=0, len = jsonData.length; i < len; i++){
                    for(var j=0, l = jsonData[i].tagsArray.length; j < l; j++){
                        var tagName = jsonData[i].tagsArray[j].toLowerCase();
                        if(!tagMap[tagName]){
                            tagMap[tagName] = [];
                            tagArray.push(tagName);
                        }
                        tagMap[tagName].push(jsonData[i]);
                    }
                }
                tagArray.sort();
            }
            this.tagsData = {
                tagArray : tagArray,
                tagMap : tagMap
            };
        },
        createTagsHTML : function(tagsJson, sMode){
        	var This =  this;
    	    var tagsContent = This.buildTagsHTML(tagsJson);
			var oRootDiv = jQuery('.pageDesignerWrapper', This.body)[0];
			var oTagsDiv = jQuery('.pm-tags-stripViewPort', This.body)[0];
			var upButton = jQuery('.pm-tags-up', This.body)[0];
			var downButton = jQuery('.pm-tags-down', This.body)[0];
			jQuery(oTagsDiv).html(tagsContent);
			This.tagListerner(sMode);
			var paginationArea = {
					container: oTagsDiv,
					upButton: upButton,
					downButton: downButton
			}
			be.utils.varicalPagination(paginationArea);

			//FIXME: IE 6 fixed
            this.IEFix(true);
        },
        tagListerner: function(currentMode){
        	var This = this;
        	jQuery(This.body).undelegate('#tagsInput:input', 'keypress').delegate('#tagsInput:input', 'keypress', function(e){
        	    if(e.which == 13){
        	        This.tagFilter = jQuery(this).val().toLowerCase();
        	        if(This.isFilterByTag() && This.tagFilter && This.tagsData){
                        var jsonData = This.tagsData.tagMap[This.tagFilter];
                        This.appendHTMLIcon(jsonData);
                    }else{
                        This.getData(currentMode, true);
                    }
        	    }
        	});
        	jQuery(This.body).undelegate('#tagsInput:input', 'focus').delegate('#tagsInput:input', 'focus', function(e){
                if (jQuery(this).val() == jQuery(this)[0].title){
                    jQuery(this).removeClass("defaultTextActive");
                    jQuery(this).val("");
                }
            });
            jQuery(This.body).undelegate('#tagsInput:input', 'blur').delegate('#tagsInput:input', 'blur', function(e){
                if (jQuery(this).val() == ""){
                    jQuery(this).addClass("defaultTextActive");
                    jQuery(this).val(jQuery(this)[0].title);
                }
            });

        	jQuery(This.body).undelegate('.pm-tag', 'click').delegate('.pm-tag', 'click', function(e){
        		jQuery('.pm-tag', This.body).removeClass('pm-tagActive');
        		jQuery(this).addClass('pm-tagActive');
        		This.tagFilter = jQuery(this).text() == "All Tags"? "" : jQuery(this).text().toLowerCase();
        		var searchInput = jQuery('#tagsInput:input', This.body);
                if(This.tagFilter){
                    searchInput.removeClass("defaultTextActive");
                    searchInput.val(This.tagFilter);
                }else{
                    searchInput.addClass("defaultTextActive");
                    searchInput.val(searchInput.attr('title'));
                }
                var portalServer = b$.portal.portalServer;

                if(This.isFilterByTag() && This.tagFilter && This.tagsData){
                	var jsonData = This.tagsData.tagMap[This.tagFilter];
                	This.appendHTMLIcon(jsonData);
                }else{
//	                $.ajax({
//	                    url:This.getCatalogRequestURL(currentMode),
//	                    success:function (data){
//	                        var item = portalServer.itemXMLDOC2JSON(data);
//	                        This.jsonData = item.children;
//	                        This.appendHTMLIcon(This.jsonData);
//	                    }
//	                });
                	This.getData(currentMode, true);
                }
        	});
        },

        buildTagsHTML: function(data){
        	var template = '<ul class="pm-tagHolder"><li class="pm-tag pm-tagActive">All Tags</li>{{#tagArray}}<li class="pm-tag">{{.}}</li>{{/tagArray}}</ul>';
        	var htmlContent = Mustache.to_html(template, data);
        	return htmlContent;
        },

        updateToolbar: function() {
            var oActive = jQuery('.tb-active', this.htmlNode).length > 0 ?
                jQuery('.tb-active', this.htmlNode) : null;
            jQuery(oActive).removeClass('tb-active');
            switch(this.currentMode){
                case 'widgets':
//					jQuery(oRootDiv).addClass('');
                    jQuery('.tb-widgets').addClass('tb-active');
                    break;
                case 'containers':
                    jQuery('.tb-layouts').addClass('tb-active');
                    break;
                case 'repoBrowser':
                    jQuery('.tb-repoBrowser').addClass('tb-active');
                    break;
                default:
                    break;
            }
        },

        showScrollArea: function() {
            var oPageDesignWrapper = jQuery('.pageDesignerWrapper', this.htmlNode)[0];
            //if(this.currentMode == 'repoBrowser') bd.repositoryBrowser.contentRepositoryBrowser.toggleContentCatalog(oPageDesignWrapper);
            jQuery(oPageDesignWrapper).addClass('pageDesignerWrapper-open');
            jQuery('body').addClass('pageDesignerWithCatalog');
            this.scrollAreaVisible = true;
        },

        hideScrollArea: function() {
            var oPageDesignWrapper = jQuery('.pageDesignerWrapper', this.htmlNode)[0];
            jQuery(oPageDesignWrapper).removeClass('pageDesignerWrapper-open');
            //if(this.currentMode == 'repoBrowser') bd.repositoryBrowser.contentRepositoryBrowser.cleanRepoBrowser();
            jQuery('body').removeClass('pageDesignerWithCatalog');
            this.scrollAreaVisible = false;
        },

        toggleVisibility: function() {
            var oPageDesignWrapper = jQuery('.pageDesignerWrapper', this.htmlNode)[0];
        	if(this.currentMode == 'repoBrowser' && this.scrollAreaVisible && !jQuery(oPageDesignWrapper).hasClass("pageDesignerWrapper-open")){
        		this.showScrollArea();
        	}else if (this.scrollAreaVisible) {
                this.hideScrollArea();
            } else {
                this.showScrollArea();
            }
        },

        handleResize: function() {
            this.showChopped();
            clearTimeout(this.resizeTimer);
            var oThis = this;
            this.resizeTimer = setTimeout(function() {
                oThis.recalculateViewPortSize();
            }, 50);
        },

        recalculateViewPortSize: function(nPage) {
            var nViewPortWidth = jQuery(this.stripViewPort).css("width").replace("px", "");
            if (nViewPortWidth < this.thumbnailWidth || isNaN(nViewPortWidth))
                nViewPortWidth = this.thumbnailWidth;
            var nNewNumberOfItemsPerPage = Math.floor(nViewPortWidth / this.thumbnailWidth);

            var nNewPage = isNaN(nPage) ? this.getNewPage(nNewNumberOfItemsPerPage) : nPage;
            this.setNumberOfItemsPerPage(nNewNumberOfItemsPerPage);

            jQuery(this.strip).css("width", this.thumbnailWidth * this.getNumberOfItems());

            this.setCurrentPage(nNewPage);
            this.hideChopped();
        },

        getNumberOfItems: function() {
            return this.jsonData ? this.jsonData.length : 0;
        },
        getTotalNumberOfPages: function() {
            var iItems = this.getNumberOfItems();
            if (iItems)
                return Math.ceil(iItems / this.getNumberOfItemsPerPage());
            else
                return 0;
        },

        getNewPage: function(nNewNumberOfItemsPerPage) {
            var nCurrentPage = this.getCurrentPage();
            var nCurrentNumberOfitemsPerPage = this.getNumberOfItemsPerPage();
            var nPosition = nCurrentPage * nCurrentNumberOfitemsPerPage;
            var nNewPage = Math.floor(nPosition / nNewNumberOfItemsPerPage);
            return nNewPage;
        },

        setNumberOfItemsPerPage: function(nItemsPerPage) {
            this.itemsPerPage = nItemsPerPage;
        },

        setCurrentPage: function(iPage) {
            if ((iPage > 0 && iPage < this.getTotalNumberOfPages()) || iPage == 0) {
                this.currentPage = iPage;
                this.scrollPage();
            }
            this.renderPagingControl();
        },

        getCurrentPage: function() {
            return this.currentPage;
        },

        getNumberOfItemsPerPage: function() {
            return this.itemsPerPage || 0;
        },

        handleNext: function() {
            this.setCurrentPage(this.getCurrentPage() + 1);
        },

        handlePrevious: function() {
            this.setCurrentPage(this.getCurrentPage() - 1);
        },

        scrolling: false,

        handleScroll: function(delta){
            if (!this.scrolling){
                this.scrolling = true;
                if (delta < 0){
                    this.handleNext();
                } else if (delta > 0) {
                    this.handlePrevious();
                }
                var self = this;
                setTimeout(function(){
                    self.scrolling = false;
                }, 500);
            }
        },

        scrollPage: function() {
            this.showChopped();
            var nCurrentPage = this.getCurrentPage();
            var nNewLeft = nCurrentPage * this.getNumberOfItemsPerPage() * this.thumbnailWidth;
            var This = this;
            //TODO: remove jQuery dependency
            jQuery(this.strip).animate({
                left: -nNewLeft
            }, 500, 'swing', function() {
                This.updateButtonClasses();
                This.hideChopped();
            });
        },

        hideChopped: function() {
            var nCurrentPage = this.getCurrentPage();
            var nChoppedPosition = (nCurrentPage + 1) * this.getNumberOfItemsPerPage();
            var oChoppedIcon = jQuery('.pm-icon2', this.strip)[nChoppedPosition];
            jQuery(oChoppedIcon).addClass('pm-icon2-hidden');
        },

        showChopped: function() {
            var oChoppedIcon = jQuery('.pm-icon2-hidden', this.strip)[0];
            jQuery(oChoppedIcon).removeClass('pm-icon2-hidden');

        },

        updateButtonClasses: function() {
            var oPreviousButton = jQuery('.pm-composer-previous', this.htmlNode);
            var oNextButton = jQuery('.pm-composer-next', this.htmlNode);

            if(this.getCurrentPage() == 0) {
                oPreviousButton.addClass("pm-composer-previous-disabled");
            } else {
                oPreviousButton.removeClass("pm-composer-previous-disabled");
            }
            if (this.getCurrentPage() >= this.getTotalNumberOfPages() - 1) {
                oNextButton.addClass("pm-composer-next-disabled");
            } else {
                oNextButton.removeClass("pm-composer-next-disabled");
            }
        },

        renderPagingControl: function() {
            var oThis = this;
            var fnClick = function(oEvent){
                var nNewPage = jQuery(oEvent.target).data("page");
                oThis.setCurrentPage(nNewPage);
            };
            this.pagingControl.innerHTML = "";

            for (var i = 0; i < this.getTotalNumberOfPages(); i++) {
                //TODO: remove jQuery
                var oPage = jQuery('<div class="designer-pager-page"></div>')
                    .data("page", i)
                    .click(fnClick)
                    .toggleClass('designer-pager-page-current', i == this.getCurrentPage());
                this.pagingControl.appendChild(oPage[0]);
            }
        },

        buildHTMLIcon: function (json) {
            var oHtml = jQuery('<div class="pm-icon2 bp-ui-dragRoot bp-ui-dragGrip"></div>')[0];

            //because onDrag icons are extracted from their parent container and CSS hierarchy won't work
            if (this.isVirtualWidget) {
                jQuery(oHtml).addClass("pm-panelCatalogIcon");
            } else {
                jQuery(oHtml).addClass("pm-widgetCatalogIcon");
            }
            var thumbnailVar = json.preferences['thumbnailUrl'].value;
//					this.model.getPreference();

//					if(bd.oPortalClient != null && bd.oPortalClient.params != null)
//						thumbnailVar = be.utils.replaceParams(thumbnailVar, bd.oPortalClient.params);
//

//            var params = {
//                contextRoot: b$.portal.config.serverRoot
//           };
//            thumbnailVar = templateApi.replaceParams(thumbnailVar, params);
            thumbnailVar = thumbnailVar.replace("$(contextRoot)",b$.portal.config.serverRoot);


            var oImage = jQuery('<div class="pm-icon2-img"></div>')[0];
            if(jQuery('html').hasClass('ie-6')){
                jQuery(oImage).css('filter', 'progid:DXImageTransform.Microsoft.AlphaImageLoader(src="' + thumbnailVar + '",sizingMethod="scale")');
            }else{
                jQuery(oImage).css('background-image', 'url(' + thumbnailVar + ')');
            }
            var oLabel = jQuery('<div class="pm-icon2-label"></div>')[0];
            var title = be.utils.truncateText(json.preferences['title'].value, 25);
            jQuery(oLabel).text(title);
//            htmlAPI.appendChild(oHtml, oImage);
//            htmlAPI.appendChild(oHtml, oLabel);
            oHtml.appendChild(oImage);
            oHtml.appendChild(oLabel);

            oHtml.catalogItemJson = json; // reference
            return oHtml;
        },
        readyDOMIcon : function () {
            var This = this;
            jQuery(this.htmlNode).bind('click', function (ev){
                This.model.setPreference('test','border:3px solid green;');
            })
            This.model.addEventListener('PrefModified', function (ev) {
//					console.log(ev.target,This.model)
                if(ev.target == This.model) {
                    if (ev.attrName == 'test') {
                        This.htmlNode.style.cssText = ev.newValue;
                    }
                }
            }, This);

        },
        IEFix : function(isForTag){
            if(jQuery('html').hasClass('ie7minus')){
                var This = this,
                    thisName = this.model.name,
                    $pageDesignCatelog = jQuery('.pageDesignerCatalog', This.body),
                    $pmTags = jQuery('.pm-tag', This.body),
                    $viewPort = jQuery(This.stripViewPort),
                    timerTags, timerViewPort,
                    tagResizeFn = function(){
                        var parentWidth = $pageDesignCatelog.width() * 0.2;
                        $pmTags.css('width', parentWidth-32);
                        This.showChopped();
                        This.recalculateViewPortSize();
                    },
                    viewPortResizeFn = function(){
                        var parentWidth = $pageDesignCatelog.width() * 0.8;
                        $viewPort.css('width', parentWidth-102);
                        This.showChopped();
                        This.recalculateViewPortSize();
                    };

                if(isForTag){
                    jQuery(window).unbind('resize.tag'+thisName).bind('resize.tag'+thisName, function(){
                        clearTimeout(timerTags);
                        timerTags = setTimeout(function(){ tagResizeFn(); }, 200);
                    }).trigger('resize.tag'+thisName);
                }else{
                    jQuery(window).unbind('resize.vp'+thisName).bind('resize.vp'+thisName, function(){
                        clearTimeout(timerViewPort);
                        timerViewPort = setTimeout(function(){ viewPortResizeFn(); }, 200);
                    }).trigger('resize.vp'+thisName);
                }
            }
        }
	};
};





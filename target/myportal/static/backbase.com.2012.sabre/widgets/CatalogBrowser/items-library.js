/**
 * Copyright (c) 2013 Backbase B.V.
 */

define(function(require, exports, module){
    'use strict';

    var utils = require('zenith/utils'),
        contextRoot = be.contextRoot || bd.contextRoot;

    // all strings should go here
    var MSG = {
        NO_RESULTS_FOR_FILTER: "No results. There is no item that matches this filter."
    };
    var TXT = {
        CATALOG_FILTER_ALL: 'All Items',
		CATALOG_FILTER_WIDGETS: 'Widgets',
		CATALOG_FILTER_MASTER_PAGES: 'Master pages',
		CATALOG_FILTER_CONTAINERS: 'Layouts',
		CATALOG_FILTER_CONTENTTYPES: 'Content types',
		CATALOG_FILTER_ACTIVE: 'Active',
		CATALOG_FILTER_INACTIVE: 'Inactive'
    };

    var defaultIcon = 'bi-pm-nav-page',
        iconMap = {
            page: 'bi-pm-nav-master-page',
            widget: 'bi-pm-diamond',
            contenttype: 'bi-pm-structuredcontent-type',
            container: 'bi-pm-layout',
            feature: 'bi-pm-sharedfeatures',
            template: 'bi-pm-stamp',
            templatepage: 'bi-pm-page-stamp',
            templatelink: 'bi-pm-link-stamp',
            templatewidget: 'bi-pm-diamond-stamp',
            templatecontainer: 'bi-pm-layout-stamp'
        };

    var scope = function() {
        return this;
    }();

    var _isServerCatalog;
    var itemData;

    var makeLibraryWidget = function(oWidget, isServerCatalog) {
        _isServerCatalog = isServerCatalog;
        $('body').toggleClass('bd-has-server-catalog', _isServerCatalog);
        b$.mixin(oWidget, widget);
        oWidget.updateHTML();

        oWidget.ownerDocument.addEventListener('RTCToggleRow', function(event) {
            var widgetState = oWidget.getPreference('widgetState');
            var state = widgetState ? JSON.parse(widgetState) : {};

            if (state.scrollAreaVisible !== (event.detail.row3 == 'true')) {
                if (state.scrollAreaVisible) {
                    oWidget.setDrawerState(state.selectedSection);
                } else {
                    oWidget.setDrawerState('all');
                }
            }
        }, false);

        var htmlAPI = b$._private.htmlAPI;
        var iFrame = $('.bd-iframeContainer')[0],
            iFrameDoc,
            loaded = false,
            iFrameCover = document.body.appendChild(document.createElement('div')),
            dragMem = {}, // memory for drag involved elements and states
            speedUpRendering = 4, // set to 1 to do elementFromPoint only every 6th time as it's heavy (rendering is faster)
            mouseOver = false;

        // prepare the iFrame cover
        // It prevents mouse getting caught in the iFrame and not returning onMouseMoveEvents any more
        iFrameCover.className = 'iframe-cover';

        // init mouse handling for current document and iFrame document
        $(document).on('mousedown', onMouseDown);
        $(document).on('iframeloaded', function() {
            iFrameDoc = (iFrame.contentDocument || iFrame.contentWindow.document);
            loaded = true;
        });

        function onMouseDown(event) {
            if (!loaded) {return}

            var target = htmlAPI.hasClassUpwards(event.target, 'pm-panelCatalogIcon'),
                isIframe = (this == iFrameDoc),
                mouseOver = false;

            // drop the item if first mose click was released.
            if (target && event.which == 1) {
                // get current coords of the iframe and store them
                dragMem.iFrame = iFrame;
                dragMem.iFrame.coords = getOrigin(iFrame);
                // prepare iFrame cover
                iFrameCover.style.cssText =
                    'left:' + dragMem.iFrame.coords[0] + 'px;' +
                    'top:'  + dragMem.iFrame.coords[1] + 'px;' +
                    'width:'  + iFrame.offsetWidth  + 'px;' +
                    'height:' + iFrame.offsetHeight + 'px; position: absolute; display: block;';

                // prepare clone
                var coords = getOrigin(target);
                var clone = target.cloneNode(true);
                clone.catalogItemJson = target.catalogItemJson;
                clone.className = target.className + ' clone';
                document.body.appendChild(clone);

                clone.offsetX = event.offsetX || event.pageX - coords[0]; // store this for mouse position correction in doDrag
                clone.offsetY = event.offsetY || event.pageY - coords[1]; // second attempt (event.pageY - coords[1]) due to FF
                dragMem.target = clone;

                clone.style.cssText = 'left:' + (coords[0] + (isIframe ? dragMem.iFrame.coords[0] : 0)) + 'px;' +
                                       'top:' + (coords[1] + (isIframe ? dragMem.iFrame.coords[1] : 0)) + 'px; position: absolute; z-index: 2147483638;'; // higest possible cross-browser z-index

                $(document).on('mousemove', doDrag);
                $(document).on('mouseup', onMouseUp);
                var keydownHandler = (function (iFrameDoc){
                    return function (evt) {
                        if (evt.keyCode == 27) {
                            cancelDrag();
                            iFrameDoc.defaultView.b$.portal.portalView.dragManager.stopDrag(evt, false);
                        }
                    };
                }(iFrameDoc));
                $(document).on('keydown', keydownHandler);

                document.removeEventListener('cancelDrag', cancelDrag);
                document.addEventListener('cancelDrag', cancelDrag);

                event.preventDefault();
            }
        }

        function cancelDrag(){
            var dragHandler = dragMem.target,
                framedm,
                backupCancelDropTargets,
                isCancelable = dragHandler && dragHandler.parentNode;
            if(isCancelable){
                dragHandler.parentNode.removeChild(dragHandler);
                iFrameCover.style.cssText = '';

                $(document).off('mousemove', doDrag);
                $(document).off('mouseup', onMouseUp);

                dragMem.over = null;

                framedm = iFrameDoc.defaultView.b$.portal.portalView.dragManager;
                // Set targets that are not allowed to drag widgets from CatalogBrowser
                backupCancelDropTargets = framedm.cancelDropTargets;
                framedm.cancelDropTargets =  $.makeArray($('[data-pid="PageManagementApp"], [data-pid="SideNav_page_management"], [data-pid="PageManagementCatalogBrowser"], .z-rowWithSlide--topNavArea'));

                // Reset targets to its original state
                framedm.cancelDropTargets = backupCancelDropTargets;
                $(iFrameDoc).find('body').removeClass('hovered');
                $('.clone').remove(); // Clean the view from clones.
            }
            return isCancelable;
        }

        function onMouseUp(event) {
            var framedm = iFrameDoc.defaultView.b$.portal.portalView.dragManager;
            if(cancelDrag()){
                if (framedm.isDragging) {
                    if (typeof document.elementFromPoint === 'function' && $(document.elementFromPoint(event.clientX, event.clientY)).hasClass('bd-iframeContainer')){
                        framedm.handle_dragMouseUp(event);
                    } else {
                        framedm.stopDrag(event, false);
                    }
                }
            }
        }

        function doDrag(event) {
            var target = dragMem.target,
                targetStyle = target.style,
                iFrameCoverStyle = iFrameCover.style,
                over, overTMP,
                inIframe = (event.target.ownerDocument != window.document); // for Opera only
            // hide the iFrameCover and clone to calculate the actual target the mouse is over, and then show them again on its right positions...
            // due to a smart rendering buffer you'll never see then flicker or anything else
            if (!mouseOver) {
                iFrameCoverStyle.display = 'none';
                targetStyle.display = 'none';
                if (!((speedUpRendering++)%4)) {
                    over = document.elementFromPoint(event.pageX + (inIframe ? dragMem.iFrame.coords[0] : 0), event.pageY + (inIframe ? dragMem.iFrame.coords[1] : 0));
                }
            }
            if (over && over.original) {
                over = over.original;
            }// in case of drop-zone helper (IE issue)

            targetStyle.cssText = 'left:' + ((event.pageX - target.offsetX) + (inIframe ? dragMem.iFrame.coords[0] : 0)) + 'px; '+
                'top:'  + ((event.pageY - target.offsetY) + (inIframe ? dragMem.iFrame.coords[1] : 0)) + 'px; ' +
                'position: absolute; ; z-index: 2147483638;'; // higest possible cross-browser z-index';

            if (!mouseOver) {
                iFrameCoverStyle.display = 'block';
            }

            if (mouseOver) {
                return;
            }
            // this is quick and dirty (and slow); but it makes the result visible for now
            if (over == iFrame) { // recalculate the target if over iFrame (IE issue...) //  instanceof HTMLIFrameElement
                var framedm = iFrameDoc.defaultView.b$.portal.portalView.dragManager;
                $(iFrameDoc).find('body').addClass('hovered');
                framedm.dragOptions = framedm.initializeDrag({
                    pageX: event.pageX,
                    pageY: event.pageY,
                    screenX: event.screenX,
                    screenY: event.screenY,
                    htmlNode: dragMem.target
                });

                var dt = new b$.view.bdom.dd.DataTransfer();
                dt.setData('x-bb-nodelist', [oWidget]);
                framedm.dataTransfer = dt;

                var root = iFrameDoc.defaultView.b$.portal.portalView.getElementsByTagName('application')[0];
                framedm.dragOptions.dragTargets = framedm.getDragTargetsFilter([], root, function(bdom) {
                    if (bdom.dragIsTarget) {
                        return bdom.dragIsTarget();
                    }
                });

                // instead of calling doDrag do the same but set the timeout to 0. With a delay the portal catalog will be inserted into this EL20150218
                if (!framedm.isDragging) {
                    framedm.isDragging = true;

                    b$._private.html.addEventListener(framedm.oDocument, 'mouseup',   framedm.handle_initialMouseUp,  false);
                    b$._private.html.addEventListener(framedm.oDocument, 'mousemove', framedm.handle_initialMouseMove,  false);

                    // timeout needs to be 0
                    framedm.initialDragTimeout = setTimeout(
                        function(){
                            framedm.startDrag2();
                        }, 0);
                    framedm.startDrag2();
                }

                event.clientX = event.clientX - dragMem.iFrame.coords[0];
                event.clientY = event.clientY - dragMem.iFrame.coords[1];

                framedm.handle_dragMouseMove(event);

                overTMP = iFrameDoc.elementFromPoint(event.pageX - dragMem.iFrame.coords[0], event.pageY - dragMem.iFrame.coords[1]);
                if (overTMP) over = overTMP;

                dragMem.over = over;
            } else if (over === null && dragMem.over) { // dragging out of window
                dragMem.over = null;
            }
        }

        function getOrigin (obj) {
            var box = htmlAPI.getBoxObject(obj);
            return [box.left, box.top];
        }

    };

    var widget = {
        /**
         * Mandatory flag to allow dragging items from widget
         * @type {Boolean}
         */
        isCatalog: true,
        /**
         * Currently active section
         * @type {String}
         */
        selectedSection: null,
        /**
         * Current widget state (open/closed)
         * @type {Boolean}
         */
        scrollAreaVisible: false,
        /**
         * Used for paging calculations
         * @type {Number}
         */
        thumbnailWidth: 120,
        /**
         * Current pager state
         * @type {Number}
         */
        currentPage: 0,
        /**
         * List of available tags in selected section
         * @type {Array}
         */
        tagsArray: [],
        /**
         * Selected tag
         * @type {String}
         */
        tagsFilter: '',
        /**
         * Selected type
         * @type {String}
         */
        typeFilter: '',

        /**
         * Various jQuery objects to access elements of widget
         * @type {jqObject}
         */
        $tagsHolder: null,
        $searchBox: null,
        $widgetWrapper: null,
        $toolbarWrapper: null,

        /**
         * Override functions to prevent design tools showup
         * @return {[type]} [description]
         */
        enableDesignMode: function(){},
        disableDesignMode: function(){},

        /**
         * Render widget body
         * @return {Void}
         */
        updateHTML: function() {
            var self = this;

            this.$widgetWrapper = $('.pageDesignerItemWrapper', this.body);
            this.$tagsHolder = $('.tb-tags-list', this.body);
            this.$toolbarWrapper = $('.pageDesignerToolbarWrapper', this.body);
            this.$toolbarWrapper.toggleClass('bd-server-catalog', _isServerCatalog);

            /* Render body */
            var templateUrl = contextRoot + '/static/backbase.com.2012.sabre/widgets/CatalogBrowser/catalogTemplates/blankTemplate.html';
            this.$widgetWrapper.html(be.utils.processHTMLTemplateByUrl(templateUrl, {
                isVirtualWidget: true,
                noItemsMessage: MSG.NO_RESULTS_FOR_FILTER
            }));

            this.$stripViewPort = $('.pm-composer-stripViewPort', this.body);
            this.$strip = $('.pm-composer-strip', this.body);
            this.pagingControl = $('.pm-designer-pager', this.body)[0];

            /* Build toolbar */
            be.utils.ajax({
                url: (_isServerCatalog ? contextRoot + '/tags/catalog?ps=-1' : contextRoot + '/portals/' + this.getPreference('portalName') + '/tags/catalog?ps=-1&f=name(not)Manageable_Area_Closure'),
                encodeURI: false,
                cache: false,
                success: function(data) {
                    var $data = $(data).eq(-1);
                    var sections = [];
                    if(!_isServerCatalog){
                        var aSectionTags = $('> tag[type=section]', $data);
                        if (aSectionTags.length) {
                            aSectionTags.each(function(idx, item){
                                var label = $(item).text();
                                if (label !== 'hide-in-catalog') {
                                    sections.push({
                                        name: label,
                                        escapeLabel: label.replace(/ /g,"_").toLowerCase()
                                    });
                                }
                            });
                        } else {
                            if (!_isServerCatalog) {
                                sections.push({
                                    empty: true
                                });
                            }
                        }
                    }

                    if (sections[0] && !sections[0].empty) {
                        sections.unshift({name: 'all', escapeLabel: 'all'});
                    }

                    self.$toolbarWrapper.html(be.utils.processHTMLTemplateByUrl(contextRoot + "/static/backbase.com.2012.sabre/widgets/CatalogBrowser/catalogTemplates/catalogToolbar.html", {
                        sections: sections.sort(function(a, b){
                            return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : b.name.toLowerCase() > a.name.toLowerCase() ? -1 : 0;
                        }),
                        searchFilter: self.searchFilter ? self.searchFilter : ''
                    }));

                    /* item type filter */
                    var txtCatalogFilter = {
                        container:TXT.CATALOG_FILTER_CONTAINERS,
                        page:TXT.CATALOG_FILTER_MASTER_PAGES,
                        contenttype:TXT.CATALOG_FILTER_CONTENTTYPES,
                        widget:TXT.CATALOG_FILTER_WIDGETS,
                        all:TXT.CATALOG_FILTER_ALL
                    };
                    var options = [
                        'container',
                        'page',
                        'contenttype',
                        'widget'
                    ].map(function(id){
                        return {
                            name: txtCatalogFilter[id],
                            handler: function() {
                                self.typeFilter = id;
                                self.applyFilters();
                            }
                        }
                    });
                    options.push({
                        name: TXT.CATALOG_FILTER_ALL,
                        value: 'all',
                        handler: function() {
                            self.typeFilter = '';
                            self.applyFilters();
                        }
                    });
                    bc.component.dropdown({
                        target: $('.tb-item-types', self.$toolbarWrapper),
                        label: TXT.CATALOG_FILTER_ALL,
                        uid: '04001',
                        customHandlers: true,
                        options: options
                    });
                    /* end item type filter */


                    if (self.selectedSection){
                        self.$toolbarWrapper.find('.tb-button[data-section="' + self.selectedSection + '"]').addClass('tb-active');
                    }

                    self.initSearch();
                }
            });

            this.initToolbar();

            /* Apply widget state (if exists) */
            this.loadWidgetState();
            this.$toolbarWrapper.parents('.pageDesignerWrapper').toggleClass('tb-tags-active', this.tagsOpen || false);

            /* Register interface handlers */
            this.registerEventHandlers();
        },

        /**
         * Initialize widget toolbar
         * @return {Void}
         */
        initToolbar: function(){
            var self = this;

            self.loadCatalog('all');

            this.$toolbarWrapper.on('click', '.tb-button', function(event){
                self.setDrawerState($(this).data('section'));
            });

            this.$toolbarWrapper.on('click', '.tb-filter-tags', function(event){
                var $this = $(this);
                $this.parents('.pageDesignerWrapper').toggleClass('tb-tags-active');
                if (!$this.parents('.pageDesignerWrapper').hasClass('tb-tags-active')){
                    self.$tagsHolder.find('.tb-tag-name').removeClass('tb-tag-selected');
                    self.tagsFilter = '';
                    self.applyFilters();
                }
                self.tagsOpen = $this.parents('.pageDesignerWrapper').hasClass('tb-tags-active');
                self.saveWidgetState();
            });

            // reload the catalog to switch from masterpage to normal page (for manageable area mostly)
            bd.observer.addObserver(bd.notifications.pageMgmt.JSTREE_SELECT, function(data) {
                self.loadCatalog(self.selectedSection, true);
            });

        },
        setDrawerState: function(section) {
            var self = this;

            section = section || 'all';
            self.tagsFilter = '';
            self.applyFilters();

            var aSectionButtons = this.$toolbarWrapper.find('.tb-section');
            for (var i = 0; i < aSectionButtons.length; i++) {
                $(aSectionButtons[i]).removeClass('tb-active');
            }
            if (section == 'search') {
                self.selectedSection = 'all';
                self.loadCatalog(self.selectedSection);
                self.showScrollArea();
                this.$toolbarWrapper.find('.tb-all').addClass('tb-active');
            } else if (self.selectedSection === section) {
                if (self.scrollAreaVisible) {
                    self.selectedSection = null;
                    self.hideScrollArea();
                    self.$toolbarWrapper.parents('.pageDesignerWrapper').removeClass('tb-tags-active');
                } else {
                    self.selectedSection = section;
                    self.showScrollArea();
                    this.$toolbarWrapper.find('.tb-'+ section.replace(/ /g,"_").toLowerCase()).addClass('tb-active');
                }
            } else {
                self.selectedSection = section;
                self.showScrollArea();
                self.loadCatalog(section);
                this.$toolbarWrapper.find('.tb-'+ section.replace(/ /g,"_").toLowerCase()).addClass('tb-active');
            }

            self.saveWidgetState();
        },

        /**
         * Initialize search feature
         * @return {Void}
         */
        initSearch: function(){
            var self = this;
            this.$searchBox = $('.tb-search', this.body);
            this.$searchBox.off().on('keyup', 'input[type="text"]', function(event){
                if (event.keyCode === 27){
                    self.searchFilter = null;
                    $(this).val('');
                    self.applyFilters(true);
                } else {
                    self.setDrawerState('search');
                    self.searchFilter = this.value;
                    self.applyFilters(true);
                }
            }).on('click', '.bi-pm-x', function(){
                self.searchFilter = null;
                $('input[type="text"]', self.$searchBox).val('');
                self.applyFilters(true);
            });
        },

        /**
         * Toggle cancel and magnifier icons on Search Filter input
         * @return {Void}
         */
        toggleCancelButtonOnSearchFilter: function(){
            var $searchBtn = $('.tb-search button', this.body);
            if(this.searchFilter){
                $searchBtn.removeClass('bi-pm-magnifier').addClass('bi-pm-x');
            }else{
                $searchBtn.removeClass('bi-pm-x').addClass('bi-pm-magnifier');
            }
        },

        /**
         * Apply tags filter and search condition to list of items in library
         * @param  {Boolean} forceTagsReload
         * @return {Void}
         */
        applyFilters: function(forceTagsReload){
            var self = this;
            this.$widgetWrapper.find('.pm-panelCatalogIcon, .pm-widgetCatalogIcon').each(function(idx, item){

                var $item = $(item);
                $item.removeClass('tb-filtered');

                // Filter by type
                if(self.typeFilter && itemData[$item.data('id')].type !== self.typeFilter){
                    $item.addClass('tb-filtered');
                }
                // Filter by tag
                if (
                    self.tagsFilter &&
                    item.catalogItemJson.tagsArray.filter(function(tag){
                        return tag.name == self.tagsFilter;
                    }).length == 0
                ){
                    $item.addClass('tb-filtered');
                }
                self.toggleCancelButtonOnSearchFilter();
                // Filter by title
                if (self.searchFilter){
                    var titleRe = self.getSearchFilterAsRegex();
                    if (!$item.find('.pm-icon2-label').text().match(titleRe)){
                        $item.addClass('tb-filtered');
                    }
                } 

                if (self.searchFilter || forceTagsReload){
                    self.updateTags();
                }
            });

            this.highlightSearchResult();
            if (this.pagingControl){
                this.recalculateViewPortSize(0);
            }

            this.saveWidgetState();
        },

        /**
         * Returns the search filter as a regular expression
         * @return {RegExp}
         */
        getSearchFilterAsRegex: function () {
            // These characters need to be escaped for the RegExp: \ ^ $ * + ? . ( ) | { } [ ]
            var escapedSearchFilter = this.searchFilter.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
            return new RegExp('(' + escapedSearchFilter + ')', 'i');
        },

        /**
         * Highlight found text substring in item titles
         * @return {Void}
         */
        highlightSearchResult: function() {
            var self = this;
            $('.pm-panelCatalogIcon, .pm-widgetCatalogIcon', this.$widgetWrapper).each(function(idx, item) {
                var $item = $(item),
                    itemName = String(item.catalogItemJson.preferences.title.value),
                    itemModel = item.catalogItemJson,
                    re;

                if (self.searchFilter) { re = self.getSearchFilterAsRegex(); }
                if (!itemModel || !itemName.match(re) && !itemModel.preferences.title.value.match(re) || !self.searchFilter) {
                    if ($item.data('originalTitle') !== undefined) {
                        $item.find('.pm-icon2-label p').text(Mustache.to_html('{{text}}', {
                            text: be.utils.truncateText($item.data('originalTitle'), 25)
                        }));
                    }
                } else {
                    $item.data('originalTitle', itemModel.preferences.title.value);
                    $item.find('.pm-icon2-label p').html(Mustache.to_html('{{text}}', {
                        text: be.utils.truncateText(itemModel.preferences.title.value, 25)
                    }).replace(re, "<span class='tb-search-highlight'>$1</span>"));
                }
            });
        },

        /**
         * Listen to global page event messages
         * @param  {Object} e - Event object
         * @return {Void}
         */
        handleMessage: function(e) {
            if (e.data == 'hideScrollArea') {
                this.hideScrollArea();
            }
        },

        /**
         * Assign various event listeners to UI elements
         * @return {Void}
         */
        registerEventHandlers: function() {
            var self = this;

            /* Paging handlers */
            $('.pm-composer', self.htmlNode).off().on('mousewheel DOMMouseScroll', function(event) {
                event.preventDefault();
                event.stopPropagation();
                self.handleScroll(event.originalEvent.wheelDelta || -event.originalEvent.detail);
            });
            $('.pm-composer-previous', self.htmlNode).off().on('click', function(event) {
                self.handlePrevious();
            });
            $('.pm-composer-next', self.htmlNode).off().on('click', function(event) {
                self.handleNext();
            });

            /* Tags handlers (filtering and scroll) */
            this.$tagsHolder.off().on('click', '.tb-tag-name', function(event){
                var $this = $(this);
                var tag = $this.data('tag');
                if (self.tagsFilter === tag){
                    $this.removeClass('tb-tag-selected');
                    self.tagsFilter = '';
                } else {
                    $this.addClass('tb-tag-selected').siblings().removeClass('tb-tag-selected');
                    self.tagsFilter = tag;
                }
                self.applyFilters();
            }).on('click', '.tb-tag-next', function(event){
                self.scrollTags(-1);
            }).on('click', '.tb-tag-prev', function(event){
                self.scrollTags(1);
            }).on('mousewheel DOMMouseScroll', function(event) {
                event.preventDefault();
                event.stopPropagation();
                self.scrollTags(event.originalEvent.wheelDelta || -event.originalEvent.detail);
            });

            /* Listen to global messages */
            if (window.addEventListener){
                addEventListener("message", jQuery.proxy(this.handleMessage, this), false);
            } else {
                attachEvent("onmessage", jQuery.proxy(this.handleMessage, this));
            }
        },

        /**
         * Make a call to REST API to load items in current section
         * @param  {String} section
         * @return {Void}
         */
        loadCatalog: function(section, force) {
            var self = this;
            if (section == self.loadedSection && !force) {
                return;
            }
            var portalServer = b$.portal.portalServer;
            var baseURL = b$.portal.config.serverRoot;
            var portalName = (bd.designMode === 'true')? 'dashboard' : this.getPreference('portalName');

            baseURL = baseURL + (_isServerCatalog ? '/catalog.xml?f=type(eq)WIDGET|CONTAINER|PAGE|CONTENTTYPE' : '/portals/' + portalName + '/catalog.xml?f=type(eq)WIDGET|CONTAINER');
            baseURL = baseURL + '&s=createdTimestamp(asc)';
            be.utils.ajax({
                url: baseURL + '&ps=-1' + (section !== 'all' ? '&f=tag.section(eq)' + encodeURI(section) : ''),
                encodeURI: false,
                cache: false,
                success: function(data) {
                    self.loadedSection = section;
                    var currentTbButton = self.$toolbarWrapper.find('.tb-active').data('section');
                    //if the loaded items are not belong to the selected catalog, ignore it
                    if(currentTbButton && section != currentTbButton) return;

                    var $catalog = $(data).eq(-1);
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
                    itemList = self.addTagsListToJson(data, item.children);
                    itemData = {};
                    $(itemList).each(function(){
                        var item = this;
                        var tpl = {
                            type: item.tag,
                            extendedItemName: item.name
                        };
                        var uuid = item.uuid;

                        itemData[uuid] = tpl;
                    });

                    for (var i = itemList.length - 1; i > -1; i--) {
                        if (!_isServerCatalog && bd && bd.PageMgmtTree && bd.PageMgmtTree.selectedLink.isMasterPage !== true && itemList[i].preferences.isManageableArea && itemList[i].preferences.isManageableArea.value == 'true') {
                            itemList.splice(i, 1);
                        } else if (!_isServerCatalog && itemList[i].tags) {
                            var bHide = false;
                            for (var h = 0; h < itemList[i].tags.length; h++) {
                                if (itemList[i].tags[h].value == 'hide-in-catalog') {
                                    bHide = true;
                                }
                            }
                            if (bHide) {
                                itemList.splice(i, 1);
                            }
                        }
                    }

                    if (itemList.length === 0) {
                        if (section == 'all') {
                            $('.tb-section-wrapper').html('<li class="tb-title tb-button tb-openClose" data-section="all">Catalog</li>');
                        } else {
                            $('.tb-'+section).hide();
                            self.setDrawerState('all');
                        }
                    };
                    self.jsonData = itemList; //item.children;
                    setTimeout(function() {
                        self.appendHTMLIcons(self.jsonData);
                        self.updateTags();
                        self.applyFilters();
                    }, 50);

                    if (self.origCurrentPage){
                        self.setCurrentPage(self.origCurrentPage);
                        delete self.origCurrentPage;
                    }
                }
            });
        },

        /**
         * Update list of tags
         * @return {Void}
         */
        updateTags: function(){
            var self = this;
            this.tagsArray = [];
            $('.pm-panelCatalogIcon:visible, .pm-widgetCatalogIcon:visible', this.$widgetWrapper).each(function(idx, item){
                self.tagsArray = self.tagsArray.concat(item.catalogItemJson.tagsArray);
            });

            var tmpArray = [],
                tagsArray = this.tagsArray;
            for (var i = 0, l = this.tagsArray.length; i < l; i++){
                if (
                    !tmpArray.some(function(tag){
                        return tag.name == tagsArray[i].name;
                    })
                ){
                    tmpArray.push(this.tagsArray[i]);
                }
            }
            this.tagsArray = tmpArray;
            function compare(a,b) {
                return (a.name < b.name) ? -1 : (a.name > b.name) ? 1 : 0;
            }
            var tplData = {
                tags: this.tagsArray.sort(compare)
            };
            this.$tagsHolder.html($(be.utils.processHTMLTemplateByUrl(contextRoot + "/static/backbase.com.2012.sabre/widgets/CatalogBrowser/catalogTemplates/tagsTemplate.html", tplData)));

            this.$tagsHolder.find('.tb-tag-name[data-tag="' + this.tagsFilter + '"]').addClass('tb-tag-selected');
            this.$tagsStripViewport = this.$tagsHolder.find('.tb-tags-strip-viewport');
            this.$tagsHolder.removeClass('has_next has_prev');

            var totalWidth = 0, maxWidth = this.$tagsHolder.width();
            this.$tagsHolder.find('.tb-tag-name').each(function(idx, item){
                totalWidth += item.offsetWidth + 16;
            });

            this.$tagsStripViewport.width(totalWidth);

            if (totalWidth > maxWidth){
                this.$tagsHolder.addClass('has_next');
            }
        },

        /**
         * Scroll tags list
         * @param  {Number} dir - negative or positive for different scroll directions
         * @return {Void}
         */
        scrollTags: function(dir){
            if (this.$tagsStripViewport.width() < this.$tagsHolder.width()){
                return null;
            }
            var curLeft = parseInt(this.$tagsStripViewport.css('left'), 10), newLeft;
            if (dir > 0){
                newLeft = curLeft + 200;
            } else {
                newLeft = curLeft - 200;
            }
            newLeft = Math.min(25, newLeft);
            newLeft = Math.max(newLeft, -(this.$tagsStripViewport.width() - this.$tagsHolder.width()));
            this.$tagsStripViewport.css('left', newLeft);
            this.$tagsHolder.toggleClass('has_prev', newLeft < 25);
            this.$tagsHolder.toggleClass('has_next', newLeft > -(this.$tagsStripViewport.width() - this.$tagsHolder.width()));
        },

        /**
         * Add tags list to item json
         * @param {Object} xmlData
         * @param {Object} jsonData
         */
        addTagsListToJson: function(xmlData, jsonData) {
            var $data = $(xmlData);
            this.tagsArray = [];

            for (var i = 0, len = jsonData.length; i < len; i++) {
                var xpathStr = '//' + jsonData[i].tag + '[name = "' + jsonData[i].name + '"]/tags',
                    nodes = be.utils.xpathNodes(xmlData, xpathStr),
                    tagsArray = [],
                    tags = nodes[0].childNodes,
                    $tag;
                for (var j = 0; j < tags.length; j++) {
                    try {
                        $tag = $(tags[j]);
                        if (
                            $tag.attr('type') === 'regular' ||
                            $tag.attr('type') === 'section'
                        ){
                            tagsArray.push({
                                name: $tag.text(),
                                type: $tag.attr('type')
                            });
                        }
                    } catch (e) {}
                }
                jsonData[i].icon = iconMap[jsonData[i].tag] || defaultIcon;
                jsonData[i].tagsArray = tagsArray;
            }
            return jsonData;
        },

        /**
         * Generate HTML for list of items
         * @param  {Object} jsonData
         * @return {Void}
         */
        appendHTMLIcons: function(jsonData) {
            var self = this;
            self.$strip.html('');
            if (jsonData && jsonData.length) {
                for (var i = 0; i < jsonData.length; i++) {
                    var elm = self.buildHTMLIcon(jsonData[i]);
                    self.$strip.append(elm);
                }
            }
            if(_isServerCatalog){
                self.$strip.off('click').on('click', function(e){
                    var id = $(e.target).data('id'),
                        data = itemData[id];
                    data['guid'] = utils.guid();
                    bd.CatalogManager.addServerCatalogItem(data);
                });
            }
            self.recalculateViewPortSize(0);
        },

        /**
         * Expand widget
         * @return {Void}
         */
        showScrollArea: function() {
            var oPageDesignWrapper = $('.pageDesignerWrapper', this.htmlNode)[0];
            $(oPageDesignWrapper).addClass('pageDesignerWrapper-open');
            $('body').addClass('pageDesignerWithCatalog');

            $(oPageDesignWrapper).find('.tb-button.tb-openClose > .bi').removeClass('bi-pm-arrow-up').addClass('bi-pm-arrow-down');

            if (!this.scrollAreaVisible && !_isServerCatalog) {
                var oEvent = this.ownerDocument.createEvent('CustomEvent');
                oEvent.initCustomEvent('WToggleRow', true, true, {'open': true});
                this.dispatchEvent(oEvent);
            }
            this.scrollAreaVisible = true;
            $('.tb-search > input').focus();
        },

        /**
         * Collapse widget
         * @return {Void}
         */
        hideScrollArea: function() {
            var oPageDesignWrapper = $('.pageDesignerWrapper', this.htmlNode)[0];
            $(oPageDesignWrapper).removeClass('pageDesignerWrapper-open');
            $('body').removeClass('pageDesignerWithCatalog');

            $(oPageDesignWrapper).find('.tb-button.tb-openClose > .bi').removeClass('bi-pm-arrow-down').addClass('bi-pm-arrow-up');

            if (!_isServerCatalog) {
                var oEvent = this.ownerDocument.createEvent('CustomEvent');
                oEvent.initCustomEvent('WToggleRow', true, true, {'open': false});
                this.dispatchEvent(oEvent);
            };
            this.scrollAreaVisible = false;
        },

        /**
         * Recalulate width of viewport
         * @param  {Number} pageNumber
         * @return {Void}
         */
        recalculateViewPortSize: function(pageNumber) {
            var viewPortWidth = parseInt(this.$stripViewPort.css("width"), 10);
            if (viewPortWidth < this.thumbnailWidth || isNaN(viewPortWidth))
                viewPortWidth = this.thumbnailWidth;
            var itemsPerPage = Math.floor(viewPortWidth / this.thumbnailWidth);

            var newPagenumber = isNaN(pageNumber) ? this.getNewPage(itemsPerPage) : pageNumber;
            this.setNumberOfItemsPerPage(itemsPerPage);

            this.$strip.css("width", this.thumbnailWidth * this.getNumberOfItems());
            this.$widgetWrapper.toggleClass('empty-set', this.getNumberOfItems() === 0);

            this.setCurrentPage(newPagenumber);
        },

        /**
         * Returns number of items in current set (taking into account filters)
         * @return {Number}
         */
        getNumberOfItems: function() {
            return $('.pm-panelCatalogIcon:visible, .pm-widgetCatalogIcon:visible', this.$widgetWrapper).length;
        },
        getTotalNumberOfPages: function() {
            var iItems = this.getNumberOfItems();
            if (iItems)
                return Math.ceil(iItems / this.getNumberOfItemsPerPage());
            else
                return 0;
        },

        getNewPage: function(itemsPerPage) {
            var currentPage = this.getCurrentPage();
            var currentItemsPerPage = this.getNumberOfItemsPerPage();
            var nPosition = currentPage * currentItemsPerPage;
            return Math.floor(nPosition / itemsPerPage);
        },

        setNumberOfItemsPerPage: function(itemsPerPage) {
            this.itemsPerPage = itemsPerPage;
        },

        setCurrentPage: function(pageNumber) {
            if ((pageNumber > 0 && pageNumber < this.getTotalNumberOfPages()) || pageNumber === 0) {
                this.currentPage = pageNumber;
                this.scrollPage();
            }
            this.renderPagingControl();
            this.saveWidgetState();
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

        handleScroll: function(delta) {
            if (!this.scrolling) {
                this.scrolling = true;
                if (delta < 0) {
                    this.handleNext();
                } else if (delta > 0) {
                    this.handlePrevious();
                }
                var self = this;
                setTimeout(function() {
                    self.scrolling = false;
                }, 500);
            }
        },

        scrollPage: function() {
            var nCurrentPage = this.getCurrentPage();
            var nNewLeft = nCurrentPage * this.getNumberOfItemsPerPage() * this.thumbnailWidth;
            var self = this;

            if (self.origCurrentPage){
                this.$strip.css({
                    left: -nNewLeft
                });
                this.updateButtonClasses();
            } else {
                this.$strip.animate({
                    left: -nNewLeft
                }, 500, 'swing', function() {
                    self.updateButtonClasses();
                });
            }
        },

        updateButtonClasses: function() {
            var oPreviousButton = $('.pm-composer-previous', this.htmlNode);
            var oNextButton = $('.pm-composer-next', this.htmlNode);

            if (this.getCurrentPage() === 0) {
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
            var fnClick = function(oEvent) {
                var nNewPage = $(oEvent.target).data("page");
                oThis.setCurrentPage(nNewPage);
            };
            this.pagingControl.innerHTML = "";

            for (var i = 0; i < this.getTotalNumberOfPages(); i++) {
                var oPage = $('<div class="designer-pager-page"></div>')
                    .data("page", i)
                    .click(fnClick)
                    .toggleClass('designer-pager-page-current', i == this.getCurrentPage());
                this.pagingControl.appendChild(oPage[0]);
            }
        },

        buildHTMLIcon: function(json) {
            var thumbnailVar = '';
            if(json.preferences['thumbnailUrl']){
                thumbnailVar = json.preferences['thumbnailUrl'].value;
                thumbnailVar = thumbnailVar.replace("$(contextRoot)", b$.portal.config.serverRoot);
            }
            var isDeprecated = false;
            for (var i = 0; i < json.tags.length; i++) {
                if (json.tags[i].value.toLowerCase() === 'deprecated') {
                    isDeprecated = true;
                }
                if(json.tags[i].value.toLowerCase() === 'cxpmanager') {
                    json.hasCXPTag = true;
                }
                if(json.tags[i].value.toLowerCase() === 'hide-in-catalog' || json.tags[i].value.toLowerCase() === 'hideincatalog') {
                    json.hasHiddenTag = true;
                }
            }


            var tplData = {
                isVirtualWidget: true,
                iconCss: $('html').hasClass('ie-6') ? 'filter: progid:DXImageTransform.Microsoft.AlphaImageLoader(src="'+ thumbnailVar + '",sizingMethod="scale")' : 'background-image: url(' + thumbnailVar + ')',
                iconPath: thumbnailVar,
                icon: json.icon,
                title: be.utils.truncateText(json.preferences['title'].value, 25),
                description: json.preferences.Description ? json.preferences.Description.value : null,
                itemType: json.tag,
                deprecated: isDeprecated,
                hasCXPTag: json.hasCXPTag,
                hasHiddenTag: json.hasHiddenTag,
                isServerCatalog:_isServerCatalog,
                uuid: json.uuid
            };

            var html = $(be.utils.processHTMLTemplateByUrl(contextRoot + "/static/backbase.com.2012.sabre/widgets/CatalogBrowser/catalogTemplates/tileTemplate.html", tplData))[0];
            html.catalogItemJson = json; // reference
            return html;
        },

        /**
         * Save widget state outside the scope to make it available after iframe refresh
         * @return {Void}
         */
        saveWidgetState: function(){
            var state = {
                scrollAreaVisible: this.scrollAreaVisible,
                selectedSection: this.selectedSection,
                tagsOpen: this.tagsOpen,
                tagsFilter: this.tagsFilter,
                searchFilter: this.searchFilter,
                currentPage: this.currentPage
            };
            var stateString = JSON.stringify(state);
            if (this.getPreference('widgetState') !== stateString) {
                this.setPreference('widgetState', stateString);
                this.model.save();
            };
        },

        /**
         * Take widget state from outside the scope and apply
         * @return {Void}
         */
        loadWidgetState: function(){
            var widgetState = this.getPreference('widgetState');
            var state = widgetState ? JSON.parse(widgetState) : {};
            if (b$.ua.queryAncestor(this.htmlNode, '.bp-resizeable-two-column-open') || _isServerCatalog) {
                this.scrollAreaVisible = true;
            } else {
                this.scrollAreaVisible = false;
            }
            this.selectedSection = state.selectedSection || 'all';
            if (this.scrollAreaVisible){
                var $activeSection = $(this.body).find('.tb-button[data-section="' + (this.selectedSection || 'all') + '"]');
                this.showScrollArea();
                this.loadCatalog(this.selectedSection);
                $activeSection.addClass('tb-active');
            }
            this.tagsOpen = state.tagsOpen || false;
            this.searchFilter = state.searchFilter;
            this.tagsFilter = state.tagsFilter;
            this.origCurrentPage = state.currentPage;
        }
    };
    widget.makeLibraryWidget = makeLibraryWidget;
    window.onImageError = function(img){
        $(img).parent().addClass('bd-library-default-icon');
    };
    return widget;
});

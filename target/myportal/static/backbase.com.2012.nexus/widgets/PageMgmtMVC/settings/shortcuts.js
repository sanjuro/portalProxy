/*
 *  ----------------------------------------------------------------
 *  Copyright Backbase b.v. 2003/2013
 *  All rights reserved.
 *  ----------------------------------------------------------------
 *  Version 5.5
 *  Author : Backbase R&D - Amsterdam - New York
 *  Filename : shortcuts.js
 *  Description: Key strokes used in the PageManagement View
 *
 *  ----------------------------------------------------------------
 */


/*-----------------------------------------------------------------------------
/* KEYBOARD SHORTCUTS FOR PAGES 

key         function        description

TREE
⇒ (arrow right)     Expand          Open tree folder
⇐ (arrow left)      Collapse        Close tree folder / select parent
(arrow up)     Up          Move to previous item in tree
 (arrow down)      Down            Move to next item in tree
d           Duplicate       Duplicate tree item
alt-⌫ (Alt+backspace)   Delete          Delete currently selected menu item
m           Master page     Create master page
n           New page item       Create page
N (Shift+n)     New item        Create new menu item (any item)
p           Mark for Publish    Mark/unmark for Publish
p           Mark for Unpublish  Mark/unmark for Unpublish
P (Shift+p)     Publish         Publish items marked for Publication

PANELS
a           Access          Show/hide Permissions tab
i           Info            Show/hide Content Info tab
s           Settings        Show/hide Settings tab
t           Targeting       Show/hide Targeting tab
v           Versions        Show/hide Versions tab
w           Close           Hide tabs

PAGE DESIGN
alt-⌫ (Alt+backspace)   Delete          Delete currently selected page item
a           Access          Show/hide Permissions
s           Settings        Show/hide Settings
t           Targeting       Show/hide Targeting tab
d           Duplicate       Duplicate widget / layout

GENERAL
?           Help            Open shortcuts panel
1           1               Go to first tab in tabbed interface
2           2               Go to second tab in tabbed interface
3           3               Go to third tab in tabbed interface
4           4               Go to fourth tab in tabbed interface
5           5               Go to fifth tab in tabbed interface
7           7               Show/hide Device Panel
8           8               Show/hide Component Library Panel
9           9               Show/hide Tree Panel
0           0               Show/hide all Panels (tree/assets, Library, Preview)
f           Find            Search pages / assets
q           Toggle          Toggle Page tree / Assets
alt+g       togglegridview  Toggle an exploded grid view for easier drag and drop for arranging layouts
esc         Escape          close or cancel
----------------------------------------------------------------------------- */

window.bd.pm = window.bd.pm || {};

be.utils.define('bd.pm.shortcuts', ['jQuery', 'bd.hotkeys','bd.observer','be.utils'], function($, Hotkeys, Observer,Utils) {

    'use strict';

    var $Widget , $selectedPage, view, settingState, bindings;

    /**
     * TODO CleanUP the help function
     */
    var enabled = true;
    var showHelp = function showHelp(ev) {
        enabled = false;
         var keys = {
            39: {'char':'&#8594;', id:'right', hint:'arrow right', desc:'Open tree folder'},
            37: {'char':'&#8592', id:'left', hint:'arrow left', desc:'Close tree folder'},
            38: {'char':'&#8593;', id:'up', hint:'arrow up', desc:'Move to previous item in tree'},
            40: {'char':'&#8595;', id:'down', hint:'arrow down', desc:'Move to next item in tree'},

            65: {'char':'a', id:'permissions', hint:'', desc:'Open permissions tab'},
            // 68: {'char':'d', id:'duplicate', hint:'', desc:'Duplicate tree item'},
            // 69: {'char':'e', id:'open', hint:'', desc:'Open settings'},
            70: {'char':'f', id:'find', hint:'', desc:'Show search box'},
            73: {'char':'i', id:'info', hint:'', desc:'Show info tab'},
            77: {'char':'m', id:'m', hint:'', desc:'Create master page'},
            78: {'char':'n', id:'n', hint:'new page', desc:'Create page'},
            80: {'char':'p', id:'publish', hint:'', desc:'Publish/ unpublish page'},
            81: {'char':'q', id:'toggle', hint:'', desc:'Switch between pages and content view in tree'},
            83: {'char':'s', id:'settings', hint:'', desc:'Open settings tab'},
            84: {'char':'t', id:'targeting', hint:'', desc:'Open targeting tab'},
            // 85: {char:'u', id:'unpublish', hint:', desc:'},
            86: {'char':'v', id:'versions', hint:'', desc:'Open versions tab'},
            87: {'char':'w', id:'close', hint:'', desc:'Close settings'},
            // 187: {char:'+', id:'+', hint:', desc:'Add page'},
            191: {'char':'?', id:'help', hint:'', desc:'Open shortcuts panel'},
            alt:{
                8: {'char':'alt+&#8656;', id:'delete', hint:'Alt+backspace', desc:'Delete currently selected item'},
                71: {'char': 'alt+g', id: 'togglegridview', hint: 'Alt+G', desc: 'Toggle an exploded grid view for easier drag and drop for arranging layouts'},
            },
            shift:{
                78: {'char':'N', id:'N', hint:'Shift+n', desc:'Create new item (any item)'},
                80: {'char':'P', id:'publishpackage', hint:'Shift+p', desc:'Publish workpackage'}
                /*,
                84: {char:'T', id:'T', hint:', desc:'},                // T (convert to targeting)
                187: {char:'<', id:'++', hint:', desc:'}               // + (new item)*/
            }
        };

        var url = be.contextRoot + '/static/dashboard/templates/html/shortcuts.html';
        var keyData = [], k;
        var addKey = function(key){
            key = $.extend({}, key);
            key.hint = key.hint && ( key.hint !== ''  ? ' (' + key.hint + ')' : '' );
            keyData.push(key);
        };
        for(k in keys){
            addKey(keys[k]);
        }
        for(k in keys.alt){
            addKey(keys.alt[k]);
        }
        for(k in keys.shift){
            addKey(keys.shift[k]);
        }

        var htmlContent = Utils.processHTMLTemplateByUrl(url, {keys:keyData});
        bc.component.modalform({
            width: '650px',
            ok: false,
            title: 'Keyboard shortcuts for pages',
            uid: 'keyboard-shortcuts for pages',
            content: htmlContent,
            cancelCallback: function(){
                enabled = true;
            }
        });
    };

    var getDataToScroll = function ($selectedPage){
        var container = $selectedPage.parents('ul')[0];
        var item = $selectedPage.parents('li')[0];
        var heightPage = $(item).height();
        var topPage = $(item).offset().top;
        var bottomPage = topPage + heightPage;
        var topContainer = $(container).offset().top;
        var bottomContainer = topContainer + $(container).height();
        return {
            container: container,
            heightPage: heightPage,
            topPage: $(item).offset().top,
            bottomPage: bottomPage,
            topContainer: topContainer,
            bottomContainer: bottomContainer
        }
    };
    var scrollUp = function ($selectedPage){
        var data = getDataToScroll($selectedPage);
        var heightPage = data.heightPage;
        var container = data.container;

        if((data.topPage - heightPage) < data.topContainer){
            container.scrollTop -= heightPage;
        }
    };

    var scrollDown = function ($selectedPage){
        var data = getDataToScroll($selectedPage);
        var heightPage = data.heightPage;
        var container = data.container;

        if((data.topPage + heightPage) > data.bottomContainer){
            container.scrollTop += heightPage;
        }
    };

    var generalBindings = {
        //Find Pages / Assets
        'f': function() {
            $('.bc-search-button', $Widget).trigger('click');
        },
         //Toggle Pages / Assets
        'q': function() {
            view.toggleView();
        },
         //On Escape
        'esc': function() {
            //'Esc was triggered'
        },
         // Show Help
        // '?': showHelp,
        'shift+?': showHelp,
        // Toggle grid view
        'alt+g': function() {
            $('.bd-show-grid-wrapper').find('div:not(.bc-view-active)').trigger('click');
        }
    };
    var treeBindings = {
        // Duplicate page
        // 'd': function() {
        //     if(view.state.currentView  === 'page' ) {
        //         view.duplicateLink();
        //     }
        // },
        // Delete currently selected menu item
        'alt+backspace': function() {
            if(view.state.currentView  === 'page' ) {
                view.deleteLink();
            }
        },
        // Create master page
        'm': function() {
            if(view.state.currentView  === 'page' ) {
                view.toggleSettingsAdd('page', { isMasterPage: true });
            }
        },
        // Create new page
        'n': function() {
            if(view.state.currentView  === 'page' ) {
                view.toggleSettingsAdd('page');
            }
        },
        // Create new menu item (any item)
        'shift+n': function() {
            if(view.state.currentView  === 'page' ) {
                $('.bc-action-select', $('.bd-addPageButtons', $Widget) ).trigger('click');
            }
        },
        // Trigger up the scroll if needed to get the links
        'up': function (){
            scrollUp($selectedPage);
        },
        // Trigger down the scroll if needed to get the links
        'down': function (){
            scrollDown($selectedPage);
        },

        'right': function (){
            scrollDown($selectedPage);
        },

        'left': function (){
            scrollUp($selectedPage);
        },

        // Toggle publish
        'p': function() {
            if(view.state.currentView  === 'page' ) {
                view.togglePublish($selectedPage);
            }
        },
        // Toggle unpublish
        'u': function() {
            if(view.state.currentView  === 'page' ) {
                view.toggleUnPublish($selectedPage);
            }
        },
        // Publish items marked for Publication
        'shift+p': function() {
            if(view.state.currentView  === 'page' ) {
                var $publishButton = $('.bd-pageMntPublishBtn:visible');
                if($publishButton.length > 0) { $publishButton.trigger('click'); }
            }
        },
        // convert to targeting
        // DISABLED
        'shift+t': function() {
            //view.convertToTarget();
        }
    };

    var panelBindings = {
         //Close Settings panel
        'w': function() {
            if(settingState.isOpen  !== false) {
                view.closeSettingsContainer();
            }
            //Close the assets picker
            // TODO add another state object for the Assetpicker
            if( $('.bd-AP-itemInfo').length ) {
                $('.jstree-clicked','.bd-assetsPicker-viewport').find('.bd-ap-preview').trigger('click');
            }
        },
        //Settings tab
        's': function() {
            if(settingState.isOpen  === false || settingState.currentTabName !== 'settings') {
                view.toggleSettingsEdit(false, 'settings');
            }
        },
         // Permissions tab
        'a': function() {
            if(settingState.isOpen  === false || settingState.currentTabName !== 'permissions') {
                view.toggleSettingsEdit(false, 'permissions');
            }
        },
         // Info tab
        'i': function() {
            if(settingState.isOpen  === false || settingState.currentTabName !== 'info') {
                view.toggleSettingsEdit(false, 'info');
            }
        },
         // Versions tab
        'v': function() {
            if(settingState.isOpen  === false || settingState.currentTabName !== 'versions') {
                view.toggleSettingsEdit(false, 'versions');
            }
        },
         // Targeting tab
        't': function() {
            if(settingState.isOpen  === false || settingState.currentTabName !== 'targeting') {
                view.toggleSettingsEdit(false, 'targeting');
            }
        }
    };


    bindings = $.extend(treeBindings,panelBindings, generalBindings);

    function attach(widgetEl, PageMgmtView) {

        //Big Widget
        $Widget = $(widgetEl);
        // PAge Management View
        view    = PageMgmtView;

        Hotkeys.start(bindings);

        Observer.subscribe('hotkey',function( ev, hotkey ) {

            var $hoveredPage = $('.jstree-hovered', $Widget);
            $selectedPage = $('.bd-tree-pageCurrent', $Widget);
            $selectedPage = ( $hoveredPage.length > 0 ) ? $hoveredPage : $selectedPage;
            view.restorePageList(true);
            settingState = view.SettingsState;
        });

    }

    function detach() {
        Hotkeys.stop();
    }


    return {
        attach: attach,
        bindings: bindings,
        detach: detach
    };
});

/***
 * Default ckEditor docking plugin implementation for all ice widgets.
 * Copyright © 2011 Backbase B.V.
 */
(function (window, $, CKEDITOR, bd, _undef) {

    'use strict';
    if (!CKEDITOR) {
        return;
    }
    var $body = jQuery('body'),
        $ckEditorDock = null,
        ckEditorDockCloseButtonDiv = '<div class="bd-ckeditor-dock-close-btn-div"><div class="bd-dock-close-btn" title="Close the editor"></div></div>',
        isInit = false,
        resizeTimer,
        PREVIEW_BAR_HEIGHT = {
            CLOSED: 33,
            OPENED: 108//33+75
        },
        getCurrentEditor = function (editorName) {
            return editorName ? $ckEditorDock.children('#cke_' + editorName) : $ckEditorDock.children('.bd-active-cke');
        },
        setCssTop = function ($currentEditor) {
            if (!$body.hasClass('bd-ckeditor-docked')) {
                $body.children('.bd-mainContainer').css('top', '');
                return;
            }
            var top = $currentEditor.height(),
                mobileToolBarHeight = $body.hasClass('bd-preview-open') ? PREVIEW_BAR_HEIGHT.OPENED : PREVIEW_BAR_HEIGHT.CLOSED;

            if (top > -1) {
                top += mobileToolBarHeight;
            }
            $body.children('.bd-mainContainer').css('top', top);
        },
        resizeHeight = function () {
            if ($body.hasClass('bd-ckeditor-docked')) {
                var $currentEditor = getCurrentEditor();
                if ($currentEditor.length) {
                    setCssTop($currentEditor);
                }
            }
        },
        getCloseDockHandler = function (editor) {
            return function (model) {
                var $currentEditor = getCurrentEditor(editor.name),
                    $widgetElement = $(editor.container.$).closest('.bp-widget'),
                    active,
                    attrValues = [];
                if (model && (model.uuid && $widgetElement[0].viewController.model.uuid === model.uuid) || !model.uuid) {
                    active = editor.focusManager && editor.focusManager.currentActive && editor.focusManager.currentActive.$;
                    if (active) {
                        jQuery(active).blur();
                    }

                    $body.removeClass('bd-ckeditor-docked');

                    $currentEditor.addClass('bd-dock-closed');


                    // Store the current status of editable elements to put them back when the users clicks in the content widget
                    $('[contenteditable]', $widgetElement).each(function (index, item){
                        attrValues.push($(item).attr('contenteditable'));
                    });

                    resizeHeight();



                    if(typeof CKEDITOR.__animateDock__ === 'function'){
                        CKEDITOR.__animateDock__(function () {
                            // We need to let CKEDITOR breath to save the snapshot, but after that we should deactivate all
                            // the fields so that they not capture the keystrokes until the user really wants to be captured
                            // this is done adding a listener that will be executed just one time and that sets the properties back
                            // to its original state.
                            $('[contenteditable]', $widgetElement).attr('contenteditable', false);
                            $widgetElement.one('mousedown', '.be-ice-widget-enabled', function (){
                                $('[contenteditable]', $widgetElement).each(function (index, item){
                                    $(item).attr('contenteditable', attrValues[index]);
                                });
                            });
                        });
                    }
                }
            };
        },
        setDocking = function ($currentEditor) {
            if (!$body.hasClass('bd-ckeditor-docked')) {
                $body.addClass('bd-ckeditor-docked');
            }
            this.setState(CKEDITOR.TRISTATE_ON);
            getCurrentEditor().removeClass('bd-active-cke');
            $currentEditor.addClass('bd-active-cke');
        },
        freezeEditor = function ($currentEditor, isReadOnly) {
            if (isReadOnly) {
                $currentEditor.addClass('bd-ckeditor-freeze').append('<div class="bd-ckeditor-freeze-cover"></div>');
            } else {
                $currentEditor.removeClass('bd-ckeditor-freeze').children('.bd-ckeditor-freeze-cover').remove();
            }
        },
        initFunction = function () {
            //TODO: this function run many time, find a new way to do it
            $ckEditorDock = $body.find('.bd-ckeditor-container');

            if (!isInit && $ckEditorDock.length) {
                isInit = true;
                jQuery('html').addClass('bd-cke-dock-enabled');

                $body.on('click.bbDocking', '.bd-mobile-close-wrapper', function () {
                    resizeHeight();
                });
                jQuery(window).on('resize.bbDocking', function () {
                    if (resizeTimer !== _undef) {
                        clearTimeout(resizeTimer);
                    }
                    resizeTimer = setTimeout(function () {
                        resizeHeight();
                    }, 50);
                });

            }
        };

    //inject the css when this plugin is loaded
    jQuery("<link/>", {
        rel: "stylesheet",
        type: "text/css",
        href: bd.contextRoot + '/static/backbase.com.2011.ice/js/ckeditor-plugins/dock/plugin.css'
    }).appendTo("head");


    CKEDITOR.plugins.add('bbDocking', {

        init: function (editor) {
            initFunction();

            //create the command
            editor.addCommand('dockCkEditor', {
                exec: function (editor) {
                    var editorName = editor.name,
                        $currentEditor = getCurrentEditor(editorName);

                    setDocking.call(this, $currentEditor);

                    setCssTop($currentEditor);

                },
                modes: {wysiwyg: 1, source: 1},//enable it while content editable false
                readOnly: 1
            });


            editor.on('instanceReady', function () {
                //init the variable and some event
                var $currentEditor = getCurrentEditor(editor.name),
                    $ckEditorDockCloseButtonDiv = jQuery(ckEditorDockCloseButtonDiv),
                    handlerCloseDock = getCloseDockHandler(editor);
                $currentEditor.children().append($ckEditorDockCloseButtonDiv);

                bd.observer.removeObserver('closeEditBar', handlerCloseDock);
                bd.observer.addObserver('closeEditBar', handlerCloseDock);

                $ckEditorDockCloseButtonDiv
                    .off('click', '.bd-dock-close-btn', handlerCloseDock)
                    .on('click', '.bd-dock-close-btn', handlerCloseDock);
            });

            editor.on('focus', function () {
                var $currentEditor = getCurrentEditor(editor.name);
                $currentEditor.removeClass('bd-dock-closed');

                editor.execCommand('dockCkEditor');

                freezeEditor($currentEditor, false);
                resizeHeight();
            });

            editor.on('blur', function () {
                if ($body.hasClass('bd-ckeditor-docked')) {
                    var $currentEditor = getCurrentEditor(editor.name);
                    freezeEditor($currentEditor, true);
                }
            });

            editor.on('destroy', function () {
                if ($body.hasClass('bd-ckeditor-docked')) {
                    var $currentDisplayedEditor = $ckEditorDock.children('.bd-active-cke');
                    if ($currentDisplayedEditor.length) {
                        if ($currentDisplayedEditor.attr('id').replace('cke_', '') === editor.name) {
                            if ($body.hasClass('bd-preview-open')) {
                                $body.children('.bd-mainContainer').css('top', PREVIEW_BAR_HEIGHT.OPENED + 'px');
                            } else {
                                $body.children('.bd-mainContainer').css('top', PREVIEW_BAR_HEIGHT.CLOSED + 'px');
                            }
                        }
                    }
                }
            });

        }
    });


    //add the bb Docking plugin
    CKEDITOR.config.extraPlugins = 'bbDocking' + (CKEDITOR.config.extraPlugins.length > 1 ? ',' + CKEDITOR.config.extraPlugins : '');

}(window, jQuery, CKEDITOR, bd));

/**
 * Default ckEditor extension implementation for all ice widgets.
 * Copyright © 2011 Backbase B.V.
 */
 (function(window, document, jQuery, CKEDITOR, bd){
    'use strict';

    var $body = jQuery('body'),
        ckEditorConfigs = bd.uiEditingOptions.ckEditorConfigs || [], //for safety
        configStylesSet = bd.uiEditingOptions.configStylesSet || {}, //for safety
        initSetupICE = false,
        $ckEditorContainer = jQuery('<div class="bd-ckeditor-container"></div>'),
        defaultToolbar = [
            { name: 'clipboard', groups: [ 'clipboard', 'undo' ], items: [ 'Cut', 'Copy', 'Paste', '-', 'Undo', 'Redo' ] }
        ],
        createEditorContainer = function () {
           //append the container div
            if(!$body.children('.bd-ckeditor-container').length){
                $body.prepend($ckEditorContainer);
                bd.observer.addObserver(top.bd.notifications.publishing.TOGGLE_LOCK, function(data){
                    if(data.locked){
                        if(document.activeElement) document.activeElement.blur();
                        if(CKEDITOR.dialog && CKEDITOR.dialog.getCurrent()) CKEDITOR.dialog.getCurrent().hide();
                    }
                });
            }
        };
    //IE needs this line for getting all the files from a correct path
    CKEDITOR.basePath = bd.contextRoot + '/static/backbase.com.2011.ice/js/ext-libs/ckeditor/';



    CKEDITOR.on('instanceCreated', function(event){
        var editor = event.editor,
            $element = jQuery(editor.element.$),
            //$pageContainer = jQuery('body').find('.pageContainer'),
            customStyles = bd.customStylesSelector && configStylesSet[bd.customStylesSelector] ? configStylesSet[bd.customStylesSelector] : '';
        //set up the custom contents Css for the instance
        editor.config.contentsCss = customStyles === '' ? CKEDITOR.basePath + 'contents.css' : customStyles.contentCss;
        //set up the custom style set for the instance
        editor.config.stylesSet = customStyles === '' ? 'default' : customStyles.styleSet;

        editor.config.menu_groups = 'clipboard,' +
                                    'tablecell,tablecellproperties,tablerow,tablecolumn,table,'+
                                    'image,'+
                                    'iceMLink';
        //set up the button/toolbar for the instance
        editor.on('configLoaded',function (evt) {
            var parentList = '', i,l,c, hasToolbarConfig = false;
            for (i = 0, l = ckEditorConfigs.length; i < l; i++) {
                hasToolbarConfig = false;
                c = ckEditorConfigs[i];
                parentList = '.' + c.parentList.join(', .');
                if($element.is(parentList)){
                    evt.editor.config.toolbar = c.toolbar;
                    hasToolbarConfig = true;
                    break;
                }
            }
            if(!hasToolbarConfig){//redefine the default toolbar
                evt.editor.config.toolbar = defaultToolbar;
            }
        });

        editor.on('instanceReady', function(){
            var $currentEditor = $body.children('#cke_'+editor.name);
            $currentEditor.removeClass('cke_hc');
            $ckEditorContainer.append($currentEditor);
            //save the editor name in the element
            $element.data('ckEditorName', editor.name);
            editor.setReadOnly(false);
        });

        var triggerEventsOnBlur =  function (){
            editor.fire( 'saveSnapshot' ); // save the undo/redo states when blur

            if($element.attr('data-ice-plaintext') !== undefined) {
                //On Blur on Plain text Widget
                $element.text($element.text());
            }
            $element.trigger('ice.change');

            //focus out event for the in context nav
            $element.trigger('iceFocusOut');
        };
        var triggerEventsOnFocus = function (){
            editor.fire('iceImageFocus'); //custom event for the ice image plugin
        };

        var handleFocusEvent = function (evt, triggerEvents) {
            var el = $element[0];
            var elHtml = $element.html();
            if (elHtml.charCodeAt(0) === 8203) {
                $element.html(elHtml.substring(1));
            }
            if($('.pm-icon2:visible', el.ownerDocument).length === 0) {
                if (typeof triggerEvents === 'function') {
                    triggerEvents();
                }
            }else{
                evt.cancel();
            }
        }

        editor.on('blur', function(evt){
            handleFocusEvent(evt, triggerEventsOnBlur);
        });


        editor.on('focus', function(evt){
            handleFocusEvent(evt, triggerEventsOnFocus);
        });

    });


    CKEDITOR.on('createInstance.ice', function(event){
        CKEDITOR.inline(event.data.editArea, event.data.config);
    });

    CKEDITOR.on( 'dialogDefinition', function( ev )
    {
        var dialogName = ev.data.name;
        var dialogDefinition = ev.data.definition;
        if ( dialogName == 'image' ){
            dialogDefinition.minHeight = 200;
            dialogDefinition.removeContents( 'advanced' );
            dialogDefinition.removeContents( 'Link' );
            var infoTab = dialogDefinition.getContents( 'info' );
            infoTab.remove( 'ratioLock' );
            infoTab.remove( 'txtBorder');
            infoTab.remove( 'txtHSpace');
            infoTab.remove( 'txtVSpace');
            infoTab.remove( 'cmbAlign' );
            infoTab.remove( 'txtWidth' );
            infoTab.remove( 'txtHeight' );
            //ckeditor will have an error if we remove these two fields.
            infoTab.get( 'htmlPreview' ).hidden = true;
            infoTab.get( 'txtUrl' ).hidden = true;
        }
    });

    CKEDITOR.on('initSetup.ice', function(){
        //only run the setup once
        if(initSetupICE){ return; }
        initSetupICE = true;

        createEditorContainer();
        CKEDITOR.disableAutoInline = true;
        CKEDITOR.dtd.$editable.span = 1;
        CKEDITOR.dtd.$editable.a = 1;
        CKEDITOR.dtd.$editable.li = 1;
        CKEDITOR.dtd.$editable.img = 1;

        /* disable image plugin in order to remove alt text setup
         * on image double click 
         */
        CKEDITOR.config.removePlugins = 'image';

        /*
         * workaround for IE8 innerHTML can not work on the read only element, eg. img, table, tr, ol
         * overwrite the setHTML() from the ckeditor
         */
        if(CKEDITOR.env.ie&&CKEDITOR.env.version<9){
            CKEDITOR.dom.element.prototype.setHtml = function () {
                //compressed code from ckeditor.js line 75~76
                var a = function (a) {
                    return this.$.innerHTML = a;
                };
                return CKEDITOR.env.ie && CKEDITOR.env.version < 9 ? function (a) {
                    try {
                        return this.$.innerHTML = a;
                    } catch (b) {
                        /* // move the following codes into try-catch block
                         *
                         * this.$.innerHTML = "";
                         * var c = new CKEDITOR.dom.element("body", this.getDocument());
                         * c.$.innerHTML = a;
                         * for (c = c.getChildren(); c.count();) this.append(c.getItem(0));
                         * return a;
                         *
                         * // try the {this.$.innerHTML = "";} again, and return the string html if it fail
                         */
                        try{
                            this.$.innerHTML = '';
                            var c = new CKEDITOR.dom.element('body', this.getDocument());
                            c.$.innerHTML = a;
                            for (c = c.getChildren(); c.count();) this.append(c.getItem(0));
                            return a;
                        }catch(excep){
                            return a;
                        }
                    }
                } : a;
            }();
        }
    });




})(window, document, jQuery, CKEDITOR, bd);

/***
 * Default ckEditor image plugin implementation for all ice widgets.
 * Copyright © 2011 Backbase B.V.
 */
(function(window, document, jQuery, CKEDITOR, bd){

    'use strict';
    if(!CKEDITOR) return;
    var setButtonState = function (imgElm, editor) {
            var removeImgCmd = editor.getCommand('removeImage');
            if(imgElm){
                if(imgElm.getAttribute('data-parentid') && imgElm.getAttribute('src').indexOf('/blank.gif') === -1){//backward compatibility for old ice widget
                    removeImgCmd.enable();
                }else if(imgElm.getAttribute('data-ice-ref')){//for new content widget
                    removeImgCmd.enable();
                }else{
                    removeImgCmd.disable();
                }
            }else{
                removeImgCmd.disable();
            }
        },
        getImageElement = function (editor) {
            var selection = editor.getSelection(),
                startElm = selection ? selection.getStartElement() : null,
                editorElm = editor.element,
                el = null;
            if(startElm && startElm.is('img') && startElm.hasClass('bd-imgArea')){
                el = startElm;
            }else if(editorElm && editorElm.is('img') && editorElm.hasClass('bd-imgArea')){
                el = editorElm;
            }
            return el;
        },
        onImgDrop = function () { //set button state on drop
            if(CKEDITOR.currentInstance){
                //enable/disable the image button
                var imgElm = getImageElement(CKEDITOR.currentInstance);
                setButtonState(imgElm, CKEDITOR.currentInstance);
            }
        };

    CKEDITOR.plugins.add( 'iceImage', {
        init: function( editor ) {
            var delIcon = bd.contextRoot + '/static/backbase.com.2011.ice/js/ckeditor-plugins/ice-image/icons/image-delete.png';

            //create the button command
            var openAssetPicker = new CKEDITOR.command( editor, {
                exec: function( editor ) {
                    bd.observer.notifyObserver('nicEditOpenAssetPicker.assetPicker');
                }
            } );
            var removeImage = new CKEDITOR.command( editor, {
                exec: function( editor ) {
                    var imgElm = getImageElement(editor);
                    if(imgElm){
                        if(imgElm.getAttribute('data-parentid')){//backward compatibility for old ice widget
                            if(bd.iceEvents && bd.iceEvents.deleteImageCK){
                                bd.iceEvents.deleteImageCK(imgElm.$, editor);
                            }
                        }else if(imgElm.getAttribute('data-ice-ref')){//for new content widget
                            jQuery(imgElm.$).trigger('removeImage.iceImage');
                        }
                    }

                    setButtonState(imgElm, editor);//disable/enable the button when image is removed
                }
            } );

            var openAssetPickerCmd = editor.addCommand( 'openAssetPicker', openAssetPicker );
            var removeImageCmd = editor.addCommand( 'removeImage', removeImage );

            openAssetPickerCmd.modes = { wysiwyg:1, source:1 }; //enable it while content editable false
            openAssetPickerCmd.readOnly=1;
            removeImageCmd.modes = { wysiwyg:1, source:1 }; //enable it while content editable false
            removeImageCmd.readOnly=1;
            //add the button and link the command
            editor.ui.addButton( 'OpenAssetPicker', {
                label: 'Open Assets Picker',
                command: 'openAssetPicker',
                icon: 'Image'
            });

            editor.ui.addButton( 'RemoveImage', {
                label: 'Remove Image',
                command: 'removeImage',
                icon: delIcon
            });

            //detect the focus for the rest widget
            var style = new CKEDITOR.style({element: 'img'});
            editor.attachStyleStateChange(style, function(state) {
                //enable/disable the image button
                var imgElm = getImageElement(editor);
                setButtonState(imgElm, editor);
            });
            //detect the focus for the image in image widget
            editor.on('iceImageFocus', function(e){
                //enable/disable the image button
                var imgElm = getImageElement(e.editor);
                setButtonState(imgElm, e.editor);
            });
            //detect the key press for the image in image widget
            editor.on('key', function(e){
                var imgElm = getImageElement(e.editor),
                    keyCode = e.data.keyCode;
                if(imgElm){
                    var src = imgElm.getAttribute('src');
                    if(src && src.indexOf('/blank.gif') == -1 && (keyCode === 8 || keyCode === 46)){
                        editor.getCommand('removeImage').exec();
                        //enable/disable the image button
                        setButtonState(imgElm, editor);
                    }
                }
            });

            /*attach the event listener for the image drop*/
            var currentImgElm = getImageElement(editor);
            if(currentImgElm){
                //for old ice widget
                bd.observer.removeObserver('ckEditDropped.iceImage');//clear the old observer
                bd.observer.addObserver('ckEditDropped.iceImage', function(){
                    onImgDrop();
                });
                //for new ice widget
                jQuery(currentImgElm.$).on('ckEditDropped.iceImage', function () {
                    onImgDrop();
                });
            }

        }
    });

    //add the ice Image plugin
    CKEDITOR.config.extraPlugins = 'iceImage' + (CKEDITOR.config.extraPlugins.length > 1 ? ',' + CKEDITOR.config.extraPlugins : '');


})(window, document, jQuery, CKEDITOR, bd);

/**
 * Copyright © 2013 Backbase B.V.
 */
;(function($, events) {
    'use strict';

    var CONTENT_SERVICES_PROTOCOL = 'cs';
    var CONTENT_REPOSITORY_PLACEHOLDER = '${portalRepository}';

    /* drag data */

    var active = false,
        dragData = {},
        hasHighLight = false;

    events.registerEventListener('init-drop', function(domnode, widget) {


        /* drop event common function */

        var getDragData = function (info) {
            var dd = {};
            if(info && info.helper && info.helper.bdDragData){
                dd = info.helper.bdDragData;
            }

            return {
                linkData: dd && dd.link,
                fileData: dd && dd.fileDataArray && dd.fileDataArray[0]
            };
        };

        var init = function(name, sendDragData){
            return function(e, info){
                // e.preventDefault();
                $(e.originalEvent && e.originalEvent.target || e.target )
                    .trigger('ice_' + name + '.iceDrop', sendDragData ? getDragData(info) : null);
            };
        };


        // Enable DND
        domnode.bdDrop({
            activate  : init('activate', true),
            deactivate: init('deactivate'),
            enter     : init('enter', true),
            leave     : init('leave'),
            over      : init('over', true),
            out       : init('out'),
            drop      : init('drop', true)
            //move: move
        });

        events.attach('updatelink', domnode);
    });

    events.registerEventCleaner('init-drop', function($domnode) {
        $domnode.bdDrop('destroy');
    });

    var getType = function(domnode){
        var nodeName = domnode.nodeName;
        return {
            link: nodeName === 'A',
            image: nodeName === 'IMG',
            richtext: nodeName !== 'IMG' && nodeName !== 'A'
        };
    };


    /* Register dropable element */

    events.registerEventListener('drop', function(domnode, data) {
        // console.log('drop', domnode, widgets);

        var type = getType(domnode),
            dropArea = $(domnode),


        /* Link specific*/

        isDrop = function(dragData){
            return (
                dragData.linkData && isDropable(dragData.linkData) ||
                dragData.fileData &&
                // do not allow to drop folders
                dragData.fileData.metaData &&

                // TODO make it configurable
                // do not allow to drop richtext
                dragData.fileData.metaData['cmis:objectTypeId'].property !== 'bb:richtext');
        },


        isAcceptLinkDrop = function(target, dragData){
            var $target = $(target),
                $targetElement = $target.hasClass('bd-ice-wrapper') ? $target.find('img') : $target,
                tagName = $targetElement.prop("tagName").toLowerCase(),
                editable = $targetElement.closest('[contenteditable="true"]').length > 0;

            if(
                (tagName == 'a' || tagName == 'img') &&
                editable && isDrop(dragData)
            ){
                return true;
            }
            return false;
        },

        isDropable = function(linkData){
            var itemType = getDataProperty(linkData, 'itemType'),
                notalink = ['menuHeader', 'divider'],
                result = linkData && (
                    !linkData.isMasterPage &&
                    notalink.indexOf(itemType) == -1
                );
            //console.log(linkData, itemType, result);
            return result;
        },

        removeHighLightFiled = function(container){
            if(hasHighLight) {
                hasHighLight = false;
                $(container)
                    .removeClass('bd-ice-link-target')
                    .find('.bd-ice-link-target').removeClass('bd-ice-link-target');
            }
        },

        isICEWidget = function(el){
            var $el = $(el);
            // TODO: better way to detect
            return $el.hasClass('bd-contentEditor-container') || $el.hasClass('bd-textContent-dropArea');
        },

        getDataProperty = function(linkData, name){
            var properties = linkData && linkData.properties;
            if(properties && properties[name]){
                return properties[name].value;
            }
        },

        /* image specific */


        wrapImage = function(image) {
            if($(image).parent('.bd-ice-wrapper').length === 0){
                $(image).wrap('<div class="bd-ice-wrapper"></div>');
            }

            return toggleDroparea(image);
        },

        unwrapImages = function(dom) {
            $('.bd-ice-wrapper img', dom).unwrap();
        },

        toggleDroparea = function(image) {
            var wrapper = $(image).parent('.bd-ice-wrapper');
            return wrapper.toggleClass('bd-ice-wrapper-empty', !image.getAttribute('src') || image.getAttribute('src') === '[broken]');
        },


        toggleHighLight = function(image, isShow){
            var wrapper = $(image).parent('.bd-ice-wrapper');

            wrapper.removeClass('bd-ice-wrapper-replace bd-ice-wrapper-hightlight');

            if(isShow && wrapper.length){
                wrapper.addClass('bd-ice-wrapper-hightlight');
                if (!wrapper.hasClass('bd-ice-wrapper-empty')) {
                    wrapper.addClass('bd-ice-wrapper-replace');
                }
            }
        },


        /* drag and drop functions */

        // clean dragging data
        deactivate = function (e) {
            if(type.image){
                toggleHighLight(domnode, false);
            }
            else {
                removeHighLightFiled(domnode);
            }
        },


        over = function(e, dragData) {
            var target;
            if($('.pm-icon2:visible', e.target.ownerDocument).length > 0){
                return false;
            }
            if(!isAcceptLinkDrop(e.target, dragData)){
                return false;
            }
            if(type.image && dragData.fileData &&
                dragData.fileData.type.indexOf('image') > -1)
            {
                toggleHighLight(domnode, true);
            }
            else {
                // console.log('over', e.target);
                removeHighLightFiled(domnode);

                target = $(e.target);
                if(!target.hasClass('bd-ice-link-target')){
                    hasHighLight = true;
                    target.addClass('bd-ice-link-target');
                }
            }
        },



        drop = function(e, dragData){

            var target = $(e.target),
                fileData = dragData.fileData,
                isImage = fileData && fileData.type.indexOf('image') > -1;

            // console.log('drop', dragData);


            // drop on template image
            if(type.image){
                if(isImage) {
                    $(domnode).attr({
                        // 'data-ice-ref': fileData.path,
                        'data-ice-ref': [CONTENT_SERVICES_PROTOCOL, fileData.repository === 'contentRepository' ? fileData.repository : '@portalRepository', fileData.contentUId].join(':'),
                        'src': fileData.url
                    });

                    toggleDroparea(domnode);
                    toggleHighLight(domnode, false);
                    //fireEvent to notify the image is dropped
                    $(domnode).trigger('ckEditDropped.iceImage');
                }

            }

            // drop on richtext
            else {
                if(isDrop(dragData) || isImage){
                    target.trigger('ice.updatelink', dragData);
                }
                removeHighLightFiled(target);
            }

            // Save after drop
            target.trigger('ice.change');
        };


        if(type.image){
            var $image = $(domnode);

            // event from ckeditor ice image plugin
            $image.on('removeImage.iceImage', function(){
                // set to transparent and then empty src: in Safari 6 image remains
                this.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
                this.src = '';
                this.setAttribute('data-ice-ref', '');

                toggleDroparea(domnode);
                $image.trigger('ice.change');
            });

            dropArea = wrapImage(domnode);
        }

        dropArea
            .on('ice_deactivate.iceDrop', deactivate)
            .on('ice_leave.iceDrop', deactivate)
            .on('ice_over.iceDrop', over)
            .on('ice_out.iceDrop', deactivate)
            .on('ice_drop.iceDrop', drop);

    });

    // Cleanup drop event
    events.registerEventCleaner('drop', function(domnode) {

        var type = getType(domnode),
            dropArea = $(domnode);

        if(type.image){
            var wrapper = dropArea.parent('.bd-ice-wrapper');

            if(wrapper.length){
                wrapper.off('.iceDrop');
                dropArea.unwrap();
            }
        } else {
            dropArea.off('.iceDrop');
        }

        // remove ie8 attr
        dropArea.removeAttr('onice_deactivate onice_leave onice_over onice_out onice_drop');

    });




})(jQuery, be.ice.events);

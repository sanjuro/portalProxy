/**
 * Copyright © 2013 Backbase B.V.
 */
;(function($, events) {
    'use strict';


    events.registerEventListener('updatelink', function(domnode, data) {

        $(domnode).on('ice.updatelink', function(e, eventData){
            var target = $(e.target),
                isImage = eventData.fileData && eventData.fileData.type.indexOf('image') > -1;

            eventData.link = eventData.link || (target.is('a') ? e.target : target.closest('a')[0]);
            if(target.is('img')){
                eventData.image = e.target;
            }

            // console.log('ice.updatelink', eventData, eventData.link, eventData.image);

            if(!eventData.link && isImage){
                addImage(eventData);
            } else {
                updateLink(eventData);
            }

        });
    });



    var getDataProperty = function(linkData, name){
        var properties = linkData && linkData.properties;
        if(properties && properties[name]){
            return properties[name].value;
        }
    },

    getItemType = function(linkData){
        var itemType, defaultType = 'page';
        if(linkData){
            itemType = getDataProperty(linkData, 'itemType');
            if(itemType === 'page' && getDataProperty(linkData, 'isDefaultLandingPage') === 'true'){
                itemType = 'landingPage';
            }
            if(itemType === 'page' && linkData.isMasterPage){
                itemType = 'masterpage';
            }
        }
        return itemType || defaultType;
    },


    getLinkData = function(uuid){
        return top.bd.pm.controller.onLinkByUUID(uuid);
    },

    updateLink = function(data){

        if(data.linkData || data.fileData){
            updateManagedLink(data);
        }

        else {
            if(data.uuid){
                getLinkData(data.uuid).done(function(linkData){
                    data.linkData = linkData;
                    updateManagedLink(data);
                });
            }
            else {
                // unmanaged
                updateUnmanagedLink(data);
            }
        }
    },



    extendLinkAttr = function(data){
        var attr = {}, itemType,
            newAttr = data.attr || {},
            linkData = data.linkData,
            fileData = data.fileData,
            resetLink = data.resetLink;

        // remove ckedior attribute
        attr['data-cke-saved-href'] = null;

        if(resetLink) {
            attr['data-ice-content-path'] = '';
            attr['data-ice-link-ref'] = '';
            attr['data-ice-link-name'] = '';
            attr['href'] = '';
        } else {
            if(linkData){
                itemType = getItemType(linkData);
                attr['data-ice-content-path'] = '';
                attr['data-ice-link-ref'] = linkData.uuid;
                attr['data-ice-link-name'] = linkData.name;

                if(data.link && data.link.attributes['title']){
                    attr['title'] = getDataProperty(linkData, 'menuAccessibilityTitle') || data.link.attributes['title'].value;
                }

                if (linkData.referencedItem) {
                    attr['href'] = bd.contextRoot + '/' + linkData.finalUrl;
                } else {
                    if(itemType == 'externalLink') {
                        attr['href'] = linkData.finalUrl;
                    } else if(itemType == 'menuHeader'){
                        attr['href'] = null;
                    }
                }
            }

            if(fileData){
                attr['data-ice-content-path'] = fileData.path;
                attr['data-ice-link-ref'] = '';
                attr['data-ice-link-name'] = '_' + fileData.contentUId;
                attr['href'] = fileData.url;
            }
        }


        return $.extend(attr, newAttr);
    },



    updateManagedLink = function(data){
        //console.log('updateManagedLink', data);

        data.attr = extendLinkAttr(data);
        if(data.resetLink && data.link){
            $(data.link).attr(data.attr);
        } else {
            if(data.attr.href){
                // drop on existing link
                if(data.link){
                    $(data.link).attr(data.attr);
                } else {

                    // drop link on image -> wrap image with link
                    if (data.image) {
                        $(data.image).wrap($('<a>').attr(data.attr));
                    }

                    // drop on selection
                    else {
                        data.label = data.linkData ? getDataProperty(data.linkData, 'title') : data.fileData.name;
                        addLink(data);
                    }
                }
            }
        }
    },


    updateUnmanagedLink = function(data){
        var link = data.link,
            attr = data.attr || {};

        // update existing link
        if(link){
            $(link).attr(attr);
            link.removeAttribute('data-ice-link-ref');
            link.removeAttribute('data-cke-saved-href');
        }

        // Add new unmanaged link
        else {
            data.label = data.attr.title || data.attr.href;
            addLink(data);
        }
    },


    addLink = function(data){
        // console.log('addLink', data);

        var ci = window.CKEDITOR && window.CKEDITOR.currentInstance, sel,
            text, label, htmlContent = '', link, el;


        // drop link on selection
        if(ci){
            sel = ci.getSelection();
            text = sel.getSelectedText();
            el = sel.getSelectedElement();
            label = text || data.label;
            //console.log('text', text, 'label', data.label);

            link = $('<a>').attr(data.attr);
            if (el && el.is('img')) {
                $(el.$).wrap(link);
            } else {
                link.text(label);
                htmlContent = link.get(0).outerHTML;
                ci.insertHtml(htmlContent);
            }

        }

        // drop link on widget
        else {
            // nothing selected
        }
    },



    /* image in richtext */

    addImage = function (eventData, target) {
        var fileData = eventData.fileData,
            url = fileData.url.replace('?id=', fileData.path+'?id='),
            imgAttrs = {
                //do we need the following attr?
                // 'title' : fileData.meta['bb:title'],
                // 'subtitle' : fileData.meta['bb:subTitle'],
                // 'alt' : fileData.meta['bb:altText'],

                //required
                'data-ice-content-path' : ['cs', fileData.repository === 'contentRepository' ? fileData.repository : '@portalRepository', fileData.contentUId].join(':'),
                'data-ice-content-preview' : url,
                'data-ice-refname' : 'rtimage_' + fileData.contentUId,
                'src' : url
            };

        var ci = window.CKEDITOR && window.CKEDITOR.currentInstance, sel,
            htmlContent = '',  el;

        // drop image on selection
        if(ci){
            sel = ci.getSelection();
            el = sel.getSelectedElement();

            if (el && el.is('img')) {
                $(el.$).attr(imgAttrs);
            } else {
                htmlContent = $('<img />').attr(imgAttrs).get(0).outerHTML;
                // console.log(htmlContent);
                ci.insertHtml(htmlContent);
            }
        }

        // drop image on widget
        else {
            // console.log('addImage', eventData);
            if(eventData.image){
                $(eventData.image).attr(imgAttrs);
            }
        }

    };




})(jQuery, be.ice.events);

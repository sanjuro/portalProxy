/**
 * Copyright © 2013 Backbase B.V.
 */
;(function($, events, ckeditor) {
    'use strict';

    // init ckeditor
    events.registerEventListener('init-ckeditor', function(domnode, widget) {

       // TODO: call it once?
        ckeditor.fire('initSetup.ice');

    });

    // create ckeditor instance from mapper
    events.registerEventListener('ckeditor', function(domnode, data) {

        var config = {},
            $target = $(domnode),
            toggleEmpty = function(el){
                var $el = $(el);
                if($('.pm-icon2:visible', el.ownerDocument).length > 0){
                    return false;
                }
                var isEmpty = ($el.text() === '' || ($el.html().charCodeAt(0) === 8203 && $el.html().lenght === 1)) && $el.is('[contenteditable="true"]');
                $el.toggleClass('bd-ice-content-empty', isEmpty);
                return true;
            };

        toggleEmpty(domnode);

        $target
            .on('mouseover', function (){
                var self = this;
                $(self).one('mouseout', function elementOutCallback(){
                    var $el = $(self);
                    if ($el.is('[contenteditable="true"]')) {
                        var elHtml = $el.html();
                        if (elHtml.charCodeAt(0) === 8203) {
                            $el.html(elHtml.substring(1));
                        }
                        if($el.text() === ''){
                            $el.html('');
                        }
                    }
                    
                });
            })
            .on('blur.ice_cke', function(evt){
                if(!toggleEmpty(this)){
                    return false;
                }
            })
            .on('focus', function(evt){
                if(!toggleEmpty(this)){
                    return false;
                }
            });

        if (
            data && data.config &&
            events.config && events.config.editor &&
            events.config.editor[data.config] )
        {
            config = events.config.editor[data.config] ;
        }
        ckeditor.inline(domnode, config);
    });


    //util function for clean the <br> for firefox browser
    var cleanBR = function ($nodes) {
        if(!$('html').hasClass('mozilla')) return;
        $nodes.children('br:last-child').remove();
    };


   // cleanup ckeditor stuff
    events.registerEventCleaner('ckeditor', function(domnode) {
        var $target = $(domnode);

        $target
            .off('.ice_cke')
            .removeClass('cke_editable cke_editable_inline cke_contents_ltr cke_contents_rtl cke_focus cke_show_borders bd-dm-clicked bd-contentEditor-div-editable bd-ice-content-empty')
            .removeAttr('tabindex spellcheck role style aria-label aria-describedby ' +
                        // ie8 attr
                        'data-cke-expando')
            // jQuery doesn't remove the class attribute once removeClass makes it empty...
            .filter('[class=""]').removeAttr('class');

        $target.closest('[sizset]').removeAttr('sizset');
    });


})(jQuery, be.ice.events, CKEDITOR);

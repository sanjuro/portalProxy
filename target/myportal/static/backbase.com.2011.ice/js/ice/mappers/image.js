/**
 * Copyright © 2013 Backbase B.V.
 */
;(function($, mapper, events, util) {
    'use strict';

    // 1. annotate view:
    mapper.registerViewAnnotator('image', function(view) {
        var annotated = view.replace(
            // src="{{([^}]*)}}"/g,
            / src="{{(([^}]*)\.[^}\.]+)}}"/g,
            ' data-ice-src="$1" data-ice-ref="{{$2.browserRef}}" src="{{$1}}"'
        );

        return annotated;
    });

    // 5. cleanup view before saving content
    mapper.registerViewCleaner('image', function(view) {
        return view.replace(
            / data-ice-src="([^"]+)" data-ice-ref="[^"]*" src="[^"]*"/g,
            ' src="{{$1}}"'
        );
    });

    // 4. view to model:
    mapper.registerModelExtractor('image', function(view) {

        var result = {};
        $(mapper.toDom(view)).find('[data-ice-src][data-ice-ref]').each(function(){
            var el = $(this),
                val = el.attr('_src'),
                ref = el.attr('data-ice-src'),
                browserRef = el.attr('data-ice-ref'),
                name = ref.split('.').slice(0, -1).join('.');

            util.setPathOnObj(result, ref, val);
            util.setPathOnObj(result, name + '.browserRef', browserRef);
        });

        return result;
    });


    // 2. dom handlers
    mapper.registerDomHandler('image', function(domnode) {
        $(domnode)
            .find('[data-ice-src]')
            .addClass('bd-imgArea')
            .attr('contenteditable', 'false')
            .each(function() {
                events.attach('ckeditor', this);
                events.attach('drop', this);
                if ($(this).attr('data-ice-ref') === '[broken]') {
                    $(this).parent().addClass('broken');
                    $(this).attr('data-ice-ref', '').attr('src', '');
                }
            });
    });


    // 3. cleanup dom
    mapper.registerDomCleaner('image', function(domnode) {
        var $img = $(domnode)
            .find('[data-ice-src]')
            .removeClass('bd-imgArea')
            .removeClass('bd-ice-link-target')
            .removeAttr('contenteditable')
            .each(function() {
                events.detach('drop', this);
                events.detach('ckeditor', this);
                $(this).parent().removeClass('broken');
            });

    });
})(
    jQuery,
    be.ice.mapper,
    be.ice.events,
    be.ice.util
);

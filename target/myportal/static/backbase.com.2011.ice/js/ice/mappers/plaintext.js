;(function(mapper, events, util) {

    'use strict';
    // This plaintext mapper assumes you put your mustaches in the content
    // part of a tag (html or xml). It looks for tag endings and inserts
    // an extra attribute in the tag.

    // This mapper will not work when you're not working with html / xml, or
    // when you try to map html / xml attributes to plaintext.

    // view mangling
    mapper.registerViewAnnotator('plaintext', function(view) {
        return view.replace(
            />{{([^#\/{&^][^}]*)}}/g,
            ' data-ice-plaintext="$1" contenteditable="true">{{$1}}'
        );
    });
    mapper.registerViewCleaner('plaintext', function(view) {
        return view.replace(
            / data-ice-plaintext="([^"]+)" contenteditable="true">[^<]*/g,
            '>{{$1}}'
        );
    });
    mapper.registerModelExtractor('plaintext', function(view) {
        // console.log('plaintext extractor', view);

        var result = {};
        $(mapper.toDom(view)).find('[data-ice-plaintext][contenteditable="true"]').each(function(){

            var el = $(this),
                text = el.text(),
                ref = el.attr('data-ice-plaintext'),
                name = ref.split('.')[0],
                val = text && text.replace(/{{/g,'{\uFEFF{');

            util.setPathOnObj(result, ref, val);
            // util.setPathOnObj(result, name + '.contentRef', '/' + name);
        });

        return result;
    });


    // dom mangling
    mapper.registerDomHandler('plaintext', function(domnode) {
        $(domnode)

            // moved to ice-ckeditor.js
            // .on('blur.ice_plaintext', '[data-ice-plaintext]', function() {
            //     $(this).text($(this).text());
            //     $(domnode).trigger('ice.change');
            // })

            .find('[data-ice-plaintext]').filter(':not(a)').each(function(i, el) {

                events.attach('ckeditor', el, {
                    config: 'plaintext'
                });

            });
    });

    mapper.registerDomCleaner('plaintext', function(domnode) {

        $(domnode)
            .off('.ice_plaintext')
            .find('[data-ice-plaintext]').filter(':not(a)').each(function(i, el) {
                events.detach('ckeditor', el, {
                    config: 'plaintext'
                });

            });

    });
})(
    be.ice.mapper,
    be.ice.events,
    be.ice.util
);

/**
 * Copyright © 2013 Backbase B.V.
 */
;(function(mapper, events, util) {
    // This richtext mapper assumes you put your mustaches in the content
    // part of a tag (html or xml). It looks for tag endings and inserts
    // an extra attribute in the tag.

    // This mapper will not work when you're not working with html / xml, or
    // when you try to map html / xml attributes to richtext.

    'use strict';


    // 1. annotate view:
    mapper.registerViewAnnotator('richtext', function(view) {
        return view.replace(
            />{{{([^}]*)}}}/g,
            ' data-icerichtext="$1" contenteditable="true">{{{$1}}}'
        );
    });

    // 5. cleanup view before saving content
    mapper.registerViewCleaner('richtext', function(view) {
        //TODO: need a better regex in here
        // this only cover <div> <img> </div>, it didnt cover <div> <img> <a></a> </div>
        return view.replace(
            / data-icerichtext="([^"]+)" contenteditable="true">(.*)<\//g,
            '>{{{$1}}}<\/'
        );
    });

    // 4. view to model:
    mapper.registerModelExtractor('richtext', function(view) {
        return mapper
            .toDom(view)
            .find('[data-icerichtext]')
            .toArray()
            .reduce(function(result, el) {
                var key = $(el).attr('data-icerichtext'),
                    keyval = key.split('.');

                // expecting keyval: ["article", "content"]
                util.setPathOnObj(result, key, $(el).html());
                // util.setPathOnObj(result, keyval[0] + '.contentRef', '/' + keyval[0]);

                return result;
            }, {});
    });

    // 2. dom handlers
    mapper.registerDomHandler('richtext', function(domnode) {

        $(domnode)

            // moved to ice-ckeditoer.js
            // .on('blur.ice_richtext', '[data-icerichtext]', function() {
            //     $(domnode).trigger('ice.change');
            // })

            .find('[data-icerichtext]').each(function(i, el){

                //console.log(i, el);
                var ref = el.getAttribute('data-icerichtext'),
                    propertyName = ref && ref.split('.')[1];

                events.attach('ckeditor', el, {});
                events.attach('drop', el);

            })

            // this class required for UiEditingOptions to configure CKEditor
            // ?? fix it
            .addClass('bd-contentEditor-div-editable');

    });

    // 3. cleanup dom
    mapper.registerDomCleaner('richtext', function(domnode) {

        $(domnode)
            .off('.ice_richtext')
            .find('[data-icerichtext]')
            .each(function(i, el){
                events.detach('ckeditor', el);
                events.detach('drop', el);
            });


    });

})(
    be.ice.mapper,
    be.ice.events,
    be.ice.util
);

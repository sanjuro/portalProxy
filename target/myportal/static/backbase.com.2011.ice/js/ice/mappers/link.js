/**
 * Copyright © 2013 Backbase B.V.
 */
;(function(mapper, events, util) {
    // This link mapper assumes you put your mustaches in the content
    // part of a tag (html or xml). It looks for tag endings and inserts
    // an extra attribute in the tag.

    // This mapper will not work when you're not working with html / xml, or
    // when you try to map html / xml attributes to links.

    'use strict';
    // 1. annotate view:
    mapper.registerViewAnnotator('link', function(view) {

        view = view.replace(
            / href="{{(([^#\/{&^]*)\.[^}\.]*)}}"/g,
            ' data-ice-link="$1" data-ice-content-path="{{$2.browserRef}}" data-ice-link-ref="{{$2.linkRef}}" href="{{$1}}"'
        );
        view = view.replace(
            / target="{{(([^#\/{&^]*)\.[^}\.]*)}}"/g,
            ' data-ice-target="$1" target="{{$1}}"'
        );

        return view;
    });


    // 2. dom handlers
    mapper.registerDomHandler('link', function(domnode) {
        $(domnode)
            // make link selection work for anything wrapped in a link (here ya go Charlie)
            .on('click.ice_link', function(ev) {
                var link = $(ev.target).parents('a[data-ice-link]');
            })
            .find('a[data-ice-link]').each(function(i, el){
                $(el).addClass('bd-linkArea');
                events.attach('ckeditor', el);
                events.attach('drop', el);
            });
    });


    // 3. cleanup dom
    mapper.registerDomCleaner('link', function(domnode) {
        // console.log(_view);
        $(domnode)
            .off('click.ice_link')
            .find('a[data-ice-link]').each(function(i, el){
                var $el = $(el);
                $el
                    .removeClass('bd-linkArea')
                    .removeClass('bd-ice-link-target')
                    .removeAttr('data-ice-link-name');

                    if(this.attributes.title){
                        $el.attr('title', '');
                    }else{
                        $el.removeAttr('title');
                    }

                if ($el.attr('contenteditable') === 'false') {
                    $el.removeAttr('contenteditable');
                }

                events.detach('ckeditor', el);
                events.detach('drop', el);
            });
    });


    // 4. view to model:
    mapper.registerModelExtractor('link', function(view) {

        var result = {}, view = $(mapper.toDom(view));

        view.find('[data-ice-link]').each(function(){

            var el = $(this),
                ref = el.attr('data-ice-link'), key;
                if (ref) {
                    key = ref.split('.').slice(0, -1).join('.');
                    // key = ref.split('.')[0];
                }

            if(key){
                util.setPathOnObj(result, key, {
                    path: el.attr('href'),
                    //target: el.attr('target'),
                    linkRef: el.attr('data-ice-link-ref'),
                    browserRef: el.attr('data-ice-content-path')
                });
            }
        });

        view.find('[data-ice-target]').each(function(){

            var el = $(this), ref = el.attr('data-ice-target'), key;

            if (ref) {
                if(key = ref.split('.').slice(0, -1).join('.')){
                    util.setPathOnObj(result, key, {
                        target: el.attr('target')
                    });
                }
            }

        });

        console.log('link extractor', result);
        return result;
    });


    // 5. cleanup view before saving content
    mapper.registerViewCleaner('link', function(view) {
        var val = view.match(/<a[^>]*>/gi);
        if(val){
            val.map(function(match) {

                var result, result2,
                    keyval = match.match(/ data-ice-link="([^"]*)"/),
                    keyval2 = match.match(/ data-ice-target="([^"]*)"/);

                if(keyval){
                    // replace href to mustache
                    result = match
                        .replace(/ href="[^"]*"/g,' href="{{' + keyval[1] + '}}"')
                        .replace(/ data-ice-content-path="([^"]*)"/g,'')
                        .replace(/ data-ice-link-ref="([^"]*)"/g,'')
                        .replace(/ data-ice-link-name="([^"]*)"/g,'')
                        .replace(/ data-ice-link="([^"]*)"/g,'');
                    view = view.replace(match, result);
                }

                if (keyval2) {
                    // replace target to mustache
                    result2 = result
                        .replace(/ target="[^"]*"/g,' target="{{' + keyval2[1] + '}}"')
                        .replace(/ data-ice-target="([^"]*)"/g,'');
                    view = view.replace(result, result2);
                }
            });
        }

        return view;
    });

})(
    be.ice.mapper,
    be.ice.events,
    be.ice.util
);

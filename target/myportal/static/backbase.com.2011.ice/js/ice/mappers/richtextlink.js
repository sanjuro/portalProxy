;(function($, mapper, events) {
    // This richtextlink mapper bla bla TODO bla bla

    'use strict';

    // 1. annotate view:
    mapper.registerViewAnnotator('richtext-link', function(view) {
        var annotated = view.replace(
            / href="{{([^#\/{&^][^}]*)}}"/g,
            ' data-ice-rtlink="$1" href="{{$1}}"'
        );
        return annotated;
    });


    // 2. dom handlers
    mapper.registerDomHandler('richtext-link', function(domnode) {
    });


    // 3. cleanup dom
    mapper.registerDomCleaner('richtext-link', function(domnode) {

        var $dom = $(domnode);

        $dom.find('[data-cke-saved-href]')
            .removeAttr('data-cke-saved-href');

        // find new links in richtext
        $dom.find('[data-ice-link-name]').each(function(i, el){
                var link = $(el).not('[data-ice-link]'),
                    name = link.attr('data-ice-link-name');

                link.attr('data-ice-rtlink', name + '.path')
                    .removeAttr('data-ice-link-name');
            });

        $dom.find('[data-ice-rtlink][href]')
            .attr('href', '');
    });

    var getLinks = function(view, selector){
        return (view.match(/<a[^>]*>/gi) || []);
    };


    // 4. view to model
    mapper.registerModelExtractor('richtext-link', function(view) {
        var result = {};

        getLinks(view).map(function(match) {
            var link = $(match).filter('[data-ice-rtlink]');

            if(link.length){
                var key = link.attr('data-ice-rtlink').split('.')[0];

                result[key] = {
                    path: link.attr('href'),
                    linkRef: link.attr('data-ice-link-ref') || null,
                    browserRef: link.attr('data-ice-content-path') || null
                };
            }
        });

        // console.log('richtext link extractor', result);
        return result;
    });


    // 5. cleanup view before saving content
    mapper.registerViewCleaner('richtext-link', function(view) {
        getLinks(view).map(function(match) {
            var result,
                keyval = match.match(/ data-ice-rtlink="([^"]*)"/);

            if(keyval){
                // replace href to mustache
                result = match
                    .replace(/ href="[^"]*"/g,' href="{{' + keyval[1] + '}}"')
                    .replace(/ data-ice-rtlink="([^"]*)"/g,'');
                view = view.replace(match, result);
            }
        });

        return view;
    });

})(
    jQuery,
    be.ice.mapper,
    be.ice.events
);

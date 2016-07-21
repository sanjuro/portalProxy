;(function($, mapper, events, util) {
	// This richtextimage mapper bla bla TODO bla bla
    'use strict';

    // 1. annotate view:
	mapper.registerViewAnnotator('richtext-image', function(tmpl) {
		return tmpl.replace(
			/ src="{{([^#\/{&^][^}]*)}}"/g,
			' src="{{$1}}" data-ice-rtimage="$1"'
		);
	});

    // 2. dom handlers
    mapper.registerDomHandler('richtext-image', function(domnode) {
    });


    // 3. cleanup dom
    mapper.registerDomCleaner('richtext-image', function(domnode) {
        // richtextimage cruft removal
        $(domnode)
            .find('[data-cke-saved-src]')
            .removeAttr('data-cke-saved-src');

        // find new images in richtext
        $(domnode)
            .find('[data-ice-refname]')
            .each(function () {
                var refname = this.getAttribute('data-ice-refname');
                this.setAttribute('data-ice-rtimage', refname + '.path');

            })
            .removeAttr('data-ice-refname');

        // normalize src
        $(domnode)
            .find('[data-ice-rtimage]').each(function () {
                // TODO: make it better
                var $this = jQuery(this), src = $this.attr('src');
                src = src.slice(src.indexOf(bd.contextRoot));
                $this.attr('src', src);
            });

    });


    // 4. view to model:
	mapper.registerModelExtractor('richtext-image', function(view) {
        var images = $(view).find('img[data-ice-rtimage]'),
            result = {};

        images.each(function(i, el){
            var key = el.getAttribute('data-ice-rtimage').split('.')[0];

            result[key] = {
                path: el.getAttribute('src'),
                browserRef: el.getAttribute('data-ice-content-path')
            };
        });

        // console.log('rtimage extractor', result);
        return result;
	});


    // 5. cleanup view before saving content
	mapper.registerViewCleaner('richtext-image', function(view) {

        (view.match(/<img[^>]*>/gi) || []).map(function(match) {

            var result,
                keyval = match.match(/ data-ice-rtimage="([^"]*)"/);

            if(keyval){
                // replace href to mustache
                result = match
                    .replace(/ src="[^"]*"/,' src="{{' + keyval[1] + '}}"');
                view = view.replace(match, result);

            }
        });

        return view;
	});



})(jQuery, be.ice.mapper, be.ice.events, be.ice.util);

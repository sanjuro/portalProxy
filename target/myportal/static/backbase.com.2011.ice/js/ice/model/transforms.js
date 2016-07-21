/**
 *  ----------------------------------------------------------------
 *  Copyright © 2003/2013 Backbase B.V.
 *  ----------------------------------------------------------------
 *  Author : Backbase R&D - Amsterdam - New York
 *  Filename : transforms.js
 *  Description:
 *
 *  ----------------------------------------------------------------
 */


be.utils.define('be.ice.model.xforms', [
    'jQuery',
    'be.ice.util'
], function ($, util) {

	'use strict';

    var prefixes = {
        contentRef: 'cref__',
        browserRef: 'bref__',
        linkRef: 'lref__'
    };


	var prefix = function(name, obj) {
		// if (obj.contentRef !== undefined) return prefixes.contentRef + name;
		// if (obj.browserRef !== undefined) return prefixes.browserRef + name;
		// if (obj.linkRef !== undefined) return prefixes.linkRef + name;
		return name;
	};

	var unprefix = function(name) {
		return name;
		// return name.replace(/^.ref__/, '');
	};

	var preferences2model = function(preferences, name) {
		var modelFromPreferences = preferences
			.reduce(function(model, ref) {
				if (ref.name == 'templateUrl') {
					model.template = {
						ref: ref.value
					};
				} else if (ref.type == 'linkRef') {
					model[unprefix(ref.name)] = {
						linkRef: ref.value
					};
				} else if (ref.type == 'contentRef') {
                    model[unprefix(ref.name)] = {
                        contentRef: ref.value
                    };
				}

				return model;
			}, {
				widgetName: name
			});
        // console.log('preferences2model', preferences, modelFromPreferences);
        return modelFromPreferences;
	};

	var model2preferences = function(model) {
        var linkForPreferences = [];
		var modelForPreferences = Object
			.keys(model)
            .map(function(key){
                var item = model[key];
                if (typeof item === 'object' && !item.ref && !item.browserRef && !item.linkRef){
                    var nestedModel = model2preferences(item);
                    if (nestedModel.length > 0) {
                        linkForPreferences = linkForPreferences.concat(nestedModel.filter(function(pref){
                            return pref.type === 'linkRef';
                        }));
                    }
                }
                return key;
            })
			.filter(function(key) {
				var item = model[key];
				return item.ref !== undefined ||
					// not allowed to save empty contentRefs, they will break publishing
					(item.contentRef !== undefined && (item.content != '' || item.meta != undefined)) ||
					(item.browserRef !== undefined && item.browserRef != '') ||
					(item.linkRef !== undefined);
					// (item.linkRef !== undefined && item.path != '')
			})
			.map(function(key) {
				var item = model[key];
				if (item.contentRef){
					var aContentRef = item.contentRef.split(':');
					item.contentRef = ['cs', (aContentRef[0] === 'contentRepository' ? 'contentRepository' : '@portalRepository'), aContentRef[1]].join(':');
				}
				return {
					name: key == 'template' ? 'templateUrl' : prefix(key, item),
					value: item.ref ||
						item.contentRef ||
						item.browserRef ||
						item.linkRef ||
                        '',
					type: (item.linkRef && 'linkRef') ||
						((item.contentRef || item.browserRef) && 'contentRef') ||
						'string'
				};
			});
        modelForPreferences = modelForPreferences.concat(linkForPreferences);
        // console.log('model2preferences', model, modelForPreferences);
        return modelForPreferences;
	};

	var model2mustache = function(model) {
		model = $.extend(true, {}, model);
		var modelForMustache = Object
			.keys(model)
			.reduce(function(mustache, key) {
				if (key != 'widgetName') {
					var item = model[key];

                    util.setPathOnObj(mustache, key, item);
                    if (item.contentRef && item.content && item.meta && item.meta['cmis:objectTypeId'] == 'bb:structuredcontent') {
                    	var data = JSON.parse(item.content.replace(/"\\&quot;|\\&quot;"/g, '\\\"')); // Weird escaping causes exception on JSON.parse
                    	data.contentRef = item.contentRef;
                    	util.setPathOnObj(mustache, key, data);
                    } else if (item.meta && item.meta['cmis:objectTypeId'] == 'bb:richtext') {
                        $.each(item.meta, function(metaKey, value) {
                            util.setPathOnObj(mustache, key + '.' + metaKey, item.meta[metaKey]);
                        });
                    }

					// if (key === 'contentRef') {
					// 	var content = JSON.parse(item.content);
					// 	mustache = $.extend(true, mustache, content);
					// }

				}
				return mustache;
			}, {
				widgetName: model.widgetName
			});

        /* This bit is to include widget PREFERENCES into the model that mustche renders out  */
        var widget = be.ice.model.client.getWidgetByName(model.widgetName),
            preferences = be.ice.model.portal.getPreferences(widget).reduce(function(result, pref){
                result[pref.name] = pref.value;

                if (pref.type) {
                	result[pref.type] = result[pref.type] || {};
                	result[pref.type][pref.name] = pref.value;
                }

                return result;
            },{});

        /* The preference should not replace preferences originally add into modelForMustache   */
        modelForMustache = $.extend(preferences, modelForMustache);

        // console.log('model2mustache', model, modelForMustache);
        return modelForMustache;
	};

	// turning an html string into a dom makes the browser
	// load images immediatly. So replace src attr first
    // TODO: replace with mapper toDom / toView
	var html2dom = function(html) {
		return $('<p>').html(
			html.replace(
				/ src=/g,
				' _src='
			)
		);
	};

	var dom2html = function(domnode) {
		return $(domnode).html().replace(
			/ _src=/g,
			' src='
		);
	};

	var obj2contentRef = function(model){
        for (var key in model) {
            if (model.hasOwnProperty(key) && typeof model[key] === 'object' && !$.isArray(model[key])) {
                if (model[key].browserRef && !model[key].linkRef) {
                    model[key] = model[key].browserRef;
                } else {
                    model[key] = obj2contentRef(model[key]);
                }
            }
        }
        return model;
    };

    var contentRef2obj = function(model){
        for (var key in model) {
            if (model.hasOwnProperty(key)) {
                if (typeof model[key] === 'string' && model[key].match(/^cs:(contentRepository|@portalRepository):[0-9a-f\-]+$/)) {
                    var contentRef = model[key].split(':');
                    if (contentRef[1] === '@portalRepository'){
                        contentRef[1] = be.ice.model.repositoryId;
                    }
                    model[key] = {
                        browserRef: model[key],
                        path: bd.contextRoot + '/content/atom/' + contentRef[1] + '/content?id=' + contentRef[2]
                    };
                } else if (typeof model[key] === 'string' && model[key].match(/^rel:[0-9a-f\-]+$/)) {
                    model[key] = {
                        browserRef: '[broken]',
                        path: '[broken]'
                    };
                } else if (typeof model[key] === 'object' && !$.isArray(model[key])){
                    model[key] = contentRef2obj(model[key]);
                }
            }
        }
        return model;
    };

	return {
		preferences2model: preferences2model,
		model2preferences: model2preferences,
		model2mustache: model2mustache,
		html2dom: html2dom,
		dom2html: dom2html,
        prefixes: prefixes,
        obj2contentRef: obj2contentRef,
        contentRef2obj: contentRef2obj

	};
});
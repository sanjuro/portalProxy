/**
 *  ----------------------------------------------------------------
 *  Copyright © 2003/2013 Backbase B.V.
 *  ----------------------------------------------------------------
 *  Author : Backbase R&D - Amsterdam - New York
 *  Filename : unified.js
 *  Description:
 *  Unified model
 *  ----------------------------------------------------------------
 */

be.utils.define('be.ice.model.unified', [
    'be.ice.model.xforms',
    'be.ice.model.portal',
    'be.ice.model.links',
    'be.ice.model.content',
    'be.ice.util',
    'be.ice.config',
    'be.utils',
    'jQuery'
], function (xforms, portal, links, content, util, config, Utils, $) {
    'use strict';

    var _testinit = function (xf, pm, lm, cm) {
        xforms = xf;
        portalmodel = pm;
        linkmodel = lm;
        contentmodel = cm;
    };

    var get = function (widget, optionalTemplate) {

        // TODO: linkRefs and contentRefs lives in the model now
        //      => no need to request CMIS and links

        var name = portal.getName(widget);
        var prefs = portal.getPreferences(widget);

        if (optionalTemplate) {
            prefs.forEach(function (item) {
                if (item.name == 'templateUrl') {
                    item.value = optionalTemplate;
                    return item;
                }
            });
        }

        var model = xforms.preferences2model(prefs, name);

        return $.when.apply($, Object
            .keys(model)
            .map(function (key) {
                return model[key];
            })
            .filter(function (item) {
                return item.ref !== undefined ||
                    item.contentRef !== undefined ||
                    item.browserRef !== undefined ||
                    item.linkRef !== undefined;
            })
            .map(function (item) {
                if (item.ref || item.contentRef || item.browserRef) {
                    return content.readObject(item.ref || item.contentRef || item.browserRef)
                        .then(function (data) {
                            if (item.contentRef && data.content && data.meta && data.meta['cmis:objectTypeId'] == 'bb:structuredcontent') {
                                var json = JSON.parse(data.content.replace(/"\\&quot;|\\&quot;"/g, '\\\"'));
                                json = xforms.contentRef2obj(json);
                                data.content = JSON.stringify(json);
                            }

                            item = $.extend(item, data);
                            // if browserRef defined use it
                            if (item.browserRef == item.contentRef) {
                                item.contentRef = null;
                            }
                            return item;
                        });
                }
                if (item.linkRef) {
                    return links.resolveLink({
                        uuid: item.linkRef
                    }).then(function (link) {
                        item.path = link.path;
                        return item;
                    });
                }
            }))
            .then(function () {
                // console.log('model', model);
                return model;
            });
    };


    var save = function (newmodel, oldmodel/*optional*/) {
        var widget = portal.getWidgetByName(newmodel.widgetName);
        // we allow passing in the oldmodel for easier testing
        return $.when(oldmodel || get(widget))
            .then(function (oldmodel) {
                var cleanModel = {};

                return util.chain(Object
                        .keys(newmodel)
                        // filter out template
                        .filter(function (key) {
                            return key !== 'template' && key !== 'widgetName';
                        })
                        // only save contentRefs
                        .filter(function (key) {
                            return newmodel[key].contentRef !== undefined;
                        })
                        .filter(function (key) {

                            var oldRef = oldmodel[key] && oldmodel[key].contentRef;

                            newmodel[key] = xforms.obj2contentRef(newmodel[key]);

                            // content reference already set to UUID
                            if (oldRef && oldRef.indexOf(':') > -1) {
                                newmodel[key].contentRef = oldRef;
                            }


                            var modified = oldmodel[key] === undefined || newmodel[key] !== oldmodel[key];


                            if (!modified && oldmodel[key]) {
                                // check if metadata modified
                                $.each(newmodel[key].meta || [], function (i, el) {
                                    var meta = oldmodel[key].meta;
                                    if (meta && meta[i] != el) modified = true;
                                });
                            }

                            // console.log(key, modified);

                            return modified;
                        })

                        .map(function (key) {
                            cleanModel[key] = newmodel[key];
                            var item = newmodel[key],
                                adjustContentRef = function (object) {
                                    if (object && object.contentRef) {
                                        // Modify contentRef from path to "repo:uuid" format
                                        item.contentRef = object.contentRef;
                                    } else {
                                        item.contentRef = contentRef;
                                    }
                                    return newmodel;
                                };
                            
                            if (item.meta && item.meta['cmis:objectTypeId'] == 'bb:richtext') {
                                var itemContent = item.content ? item.content.replace(/ _src="/gi, ' src="') : '';
                                return function () {
                                    return content.updateContent(item.contentRef, itemContent, item.meta).then(adjustContentRef);
                                };
                            }

                            var contentRef = item.contentRef;
                            delete item.contentRef;

                            var jsonStr = JSON.stringify(item);
                            jsonStr = jsonStr.replace(/ _src=\\"/gi, ' src=\\"');

                            return function () {
                                return content.updateContent(contentRef, jsonStr).then(adjustContentRef);
                            };
                        })
                ).then(function (data) {
                        var bbModel = xforms.model2preferences(newmodel);
                        // Invalidate cache on a widget
                        widget.model.setPreference('widgetContentsUpdated', new Date().getTime());

                        // All content operations are complete
                        // we can save portal model
                        portal.saveModel(widget, bbModel).then(function(){
                            if (top.bd && top.bd.observer) {
                                top.bd.observer.notifyObserver(top.bd.pm.observer.updateVisibleLink);
                            }
                        });

                        // Clear cache on save.
                        $.ajax({
                            type: 'PUT',
                            headers: {
                                bbCSRF: be.utils.getCookie('bbCSRF') // CSRF Support
                            },
                            url: b$.portal.config.serverRoot + '/caches/all/portals/' + (b$.portal.portalName || '[BBHOST]') + '/content/' + bbModel[0].value
                        });

                        return data;
                    });
            });
    };


    return {
        _testinit: _testinit,
        get: get,
        save: save
    };
});

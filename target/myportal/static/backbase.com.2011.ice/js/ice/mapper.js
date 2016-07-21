/**
 * Copyright © 2013 Backbase B.V.
 */

if (!window.be) window.be = {};
if (!window.be.ice) window.be.ice = {};

be.ice.mapper = (function ($, mustache, util) {
    'use strict';

    var viewMappers = {
        annotators: {
            // we treat mustache as an implicit view annotator
            // even though it should be a model mapper for symmetry
            //mustache: mustache.to_html
            mustache: mustache.to_html
        },
        cleaners: {}
    };
    var modelMappers = {
        extractors: {}
    };
    var domMappers = {
        handlers: {},
        cleaners: {}
    };

    var config = {
        names: []
    };

    // various regsitration functions
    var registerViewAnnotator = function(name, fn) {
        viewMappers.annotators[name] = fn;
    };
    var registerViewCleaner = function(name, fn) {
        viewMappers.cleaners[name] = fn;
    };
    var registerModelExtractor = function(name, fn) {
        modelMappers.extractors[name] = fn;
    };
    // (the mustache.to_html function is the reverse of modelExtractor)

    var registerDomHandler = function(name, fn) {
        domMappers.handlers[name] = fn;
    };
    var registerDomCleaner = function(name, fn) {
        domMappers.cleaners[name] = fn;
    };

    /*
     *  Annotate view with editing markers and model markers
     *
     *  To make the view editable we need to do two things:
     *   * add editing markers to the view - like the contenteditable attribute
     *   * copy model information from the mustaches to some data-ice attributes
     *     (because the mustache rendering will replace the model information with
     *      actual model data, making it impossible to save modified data back to
     *      the right model names)
     *
     *  This function achieves the above by processing a list of viewMapper names
     *  in order and passing each viewMapper.annotator the current view and model.
     *  At the end of the processing, the annotated view is returned.
     *
     *  view:  a string based representation of the view
     *  model: a mustache-ready representation of the model (key-value, not unified model)
     *  names: an optional set of names of viewMappers to process in order
     *  (if names is not supplied, this function will use config.names)
     *
     *  returns a fully annotated view string
     */
    var annotate = function(view, model, optionalNames) {
        var names = optionalNames || config.names;

        return names
            .reduce(function(view, name) {
                return viewMappers.annotators[name] ?
                    viewMappers.annotators[name](view, model) :
                    view;
            }, view);
    };

    /*
     *  Cleanup view and extract model
     *
     *  To make sure the viewMappers can reliably extract the model information,
     *  we need to do two things:
     *   * extract our model information
     *   * cleanup the view by removing editing and model markers - this makes
     *     sure the next viewMappers aren't confused by the markup this viewMapper
     *     has added
     *
     *  This function achieves the above by processing a list of mapper names in
     *  reverse order, and for each mapper cleanup the view by calling the
     *  viewMapper.cleaner, and extracting the model by calling the modelMapper
     *  .extractor.
     *
     *  view:  a string based representation of the view
     *  names: an optional set of names of mappers to process in order
     *  (if names is not supplied, this function will use config.names)
     *
     *  returns a fully extracted model
     */
    var cleanupAndExtract = function(view, optionalNames) {
        var names = optionalNames || $.extend(true, [], config.names);

        var model = names
            .reverse()
            .reduce(function(obj, name) {
                return {
                    model: modelMappers.extractors[name] ? (function(model, mappers){
                        $.each(mappers, function(key, val){
                            var model = val;
                            // obj.model[key] = $.extend(obj.model[key], model);

                            util.setPathOnObj(obj.model, key, val);
                            // console.log('MAPPER', key, val, obj.model);

                        });
                        // console.log('MAPPER', obj.model);
                        return obj.model;

                    })(obj.model, modelMappers.extractors[name](obj.view)) :

                        // $.extend(
                        //     true,
                        //     obj.model,
                        //     modelMappers.extractors[name](obj.view)
                        // ):
                        obj.model,
                    view: viewMappers.cleaners[name] ?
                        viewMappers.cleaners[name](obj.view) :
                        obj.view
                };
            }, {
                model: {},
                view: view
            }).model;

        //console.log('cleanupAndExtract', model, view);
        return model;
    };

    /*
     *  Extracts meta data properties into separate meta object
     *
     *  Needed for backward compatibility with 5.5 ice widgets,
     *  where some information could be stored in meta data, like bb:title.
     *  Works only for bb:richtext content items.
     *
     *  model:   model that will be affected
     *  oldModel: will not be affected. Needed only to determine cmis:objectTypeId of each item.
     */
    var separateMetaData = function(model, oldModel){
        var reservedKeys = ['content', 'url', 'path', 'contentRef', 'browserRef', 'linkRef'];
        $.each(model || [], function(modelKey, modelVal){
            var isOldModelRichText = oldModel[modelKey] && oldModel[modelKey].meta && oldModel[modelKey].meta['cmis:objectTypeId'] === 'bb:richtext';
            if(isOldModelRichText || modelVal.hasOwnProperty('content')) {
                $.each(modelVal || [], function(itemKey, itemVal){
                    modelVal.meta = modelVal.meta || {'cmis:objectTypeId' : 'bb:richtext'};
                    if ($.inArray(itemKey, reservedKeys) === -1) {
                        modelVal.meta[itemKey] = itemVal;
                        delete modelVal[itemKey];
                    }
                });
            } 
        });
    };

    /*
     *  Attach handlers to the dom
     *
     *  Mappers sometimes need to attach event handlers to the dom. For instance
     *  for sending the ice.change event when the dom was changed.
     *
     *  dom:   the dom nodes for the ice widget
     *  names: an optional set of names of mappers to process in order
     *  (if names is not supplied, this function will use config.names)
     *
     *  returns the dom
     */
    var attachHandlers = function(dom, optionalNames) {
        var names = optionalNames || config.names;

        names.forEach(function(name) {
            domMappers.handlers[name] && domMappers.handlers[name](dom);
        });

        return dom;
    };

    /*
     *  cleanup handlers
     *
     *  Mappers attach handlers above, and those handlers can themselves add
     *  markup to the dom. Cleanup of those bits of markup happens here
     *
     *  dom:   the dom nodes for the ice widget
     *  names: an optional set of names of mappers to process in order
     *  (if names is not supplied, this function will use config.names)
     *
     *  returns the cleaned dom
     */
    var cleanupHandlers = function(dom, optionalNames) {
        var names = optionalNames || config.names;

        names.forEach(function(name) {
            domMappers.cleaners[name] && domMappers.cleaners[name](dom);
        });

        return dom;
    };

    // dom helpers
    // (set unsafe to true to do a dom conversion that will load images immediatly)
    var toDom = function(view, unsafe) {
        if (!unsafe) view = view.replace(
            / src=/g,
            ' _src='
        );

        return $(view);
    };
    var toView = function(dom, unsafe) {
        // jQuery .html returns innerHtml, we want outerHtml
        var view = dom.clone().wrap('<p>').parent().html() || '';

        if (!unsafe) view = view.replace(
            / _src=/g,
            ' src='
        );

        return view;
    };
    // TODO: sort attributes in alphabetical order
    var normalizeView = function(view) {
        return toView(toDom(view));
    };

    return {
        config: config,

        registerViewAnnotator: registerViewAnnotator,
        registerViewCleaner: registerViewCleaner,
        registerModelExtractor: registerModelExtractor,

        registerDomHandler: registerDomHandler,
        registerDomCleaner: registerDomCleaner,

        annotate: annotate,
        cleanupAndExtract: cleanupAndExtract,
        separateMetaData: separateMetaData,

        attachHandlers: attachHandlers,
        cleanupHandlers: cleanupHandlers,

        toDom: toDom,
        toView: toView,
        normalizeView: normalizeView,

        _mappers: {
            viewMappers: viewMappers,
            modelMappers: modelMappers,
            domMappers: domMappers
        }
    };
})(
    jQuery,
    Mustache,
    be.ice.util
);
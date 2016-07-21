/**
 *  ----------------------------------------------------------------
 *  Copyright © 2003/2013 Backbase B.V.
 *  ----------------------------------------------------------------
 *  Author : Backbase R&D - Amsterdam - New York
 *  Filename : controller.js
 *  Description:
 *
 *  ----------------------------------------------------------------
 */

// ice controller
be.utils.define('be.ice.controller', [
    'jQuery',
    'be.ice.model.unified',
    'be.ice.mapper',
    'be.ice.events',
    'be.ice.model.xforms',
    'be.ice.util'
], function ($, unified, mapper, events, xforms, util) {
    'use strict';

    // var controller = this;

    var config = {};

    var fixPaths = function(model) {
        var folder = config.getContentPath(model.widgetName);

        model = $.extend(true, {}, model);

        Object.keys(model)
            .filter(function(key){
                return key !== 'template' && key !== 'widgetName';
            })
            .filter(function(key) {
                return model[key].browserRef === undefined;
            })
            .map(function(key) {
                model[key].contentRef = folder + '/' + key;
            });

            // .forEach(function(item) {
            //     item.contentRef = folder + '/' + key;
            // });

        return model;
    };

    var editHandler = function(oldmodel, olddom, optionalModel) {
        // save mutex
        var saveActive = false;

        // we're using blur here to save modifications immediatly after they're made.
        // we could also add a 'save' button to the dom here or something else...
        $(olddom).on('ice.change', function() {
            // toDom is used after mustache resolves all {{}}, so we can render unsafe <img> tags
            var unsafe = true;

            if (saveActive) return;
            saveActive = true;

            var dom = mapper.cleanupHandlers($(olddom).clone(true, true));

            // detach widget events
            dom = events.detachEvents(dom);

            // generic?
            dom.find('[style="display: block;"]').removeAttr('style');
            dom.find('[style="display: none;"]').removeAttr('style');

            //When javascript injects extra tags inside side it should be mark so it is ignored
            dom.find('[ice-ignore="true"]').remove();

            var oldview = mapper.toView(dom, unsafe);
            var newmodel = mapper.cleanupAndExtract(oldview);
            mapper.separateMetaData(newmodel, oldmodel);

            // view hasn't got this info, so copy from oldmodel
            newmodel.widgetName = oldmodel.widgetName;
            newmodel.template = oldmodel.template;

            var newview = mapper.annotate(
                // scripts are loaded specially, and don't survive the toDom/toHtml anyways
                newmodel.template.content.replace(/<script[^>]+><\/script>/g, ''),
                $.extend(true, {}, xforms.model2mustache(newmodel), optionalModel)
            );

            // The new view has some spaces and lines feeds because the dom hasn't
            // removed them all from the string yet so clean up
            newview = mapper.normalizeView(newview);

            // cleanup views before comparing
            oldview = util.cleanup(oldview);
            newview = util.cleanup(newview);

            newmodel = fixPaths(newmodel);

            if (oldview !== newview) {

                util.consoleDiff(oldview, newview);
                util.log(newmodel);

                // We assume if length is the same than it could be a different order of attributes.
                if(oldview.length !== newview.length){
                    util.portalManagerMessage({message: 'Unable to save widget content! Please contact your administrator.'});
                    saveActive = false;
                    return;
                }
            }
            // console.log('save', newmodel);

            // debugger // TODO remove me
            unified.save(newmodel);

            saveActive = false;
        });

        return olddom;
    };

    // used to override passed models for easier testing
    var _testinit = function(model, map) {
        unified = model;
        mapper = map;

        return {
            config: config,
            editHandler: editHandler
        };
    };

    var render = function(widget, optionalTemplatePath, optionalModel) {

        // toDom is used after mustache resolves all {{}}, so we can render unsafe <img> tags
        var unsafe = true;

        return unified
            .get(
                widget,
                optionalTemplatePath
            )
            .then(function(model) {
                // read-only rendering
                var mappers = widget.iceConfig.mappers
                    .filter(function(name) {
                        return name == 'mustache';
                    });

                optionalModel = optionalModel || {};

                var view = mapper.annotate(
                    model.template.content,
                    $.extend(true, {}, xforms.model2mustache(model), optionalModel),
                    mappers
                );
                var dom = mapper.toDom(view, unsafe);

                return mapper.attachHandlers(dom, mappers, widget);
            });
    };

    var edit = function(widget, optionalTemplatePath, optionalModel) {
        // toDom is used after mustache resolves all {{}}, so we can render unsafe <img> tags
        var unsafe = true,
            result;

        // for image drag-and-drop
        widget.saveContent = function() {};

        $(widget.body).addClass('be-ice-widget-enabled');

        $.ajax(b$.portal.config.serverRoot + '/portals/' + b$.portal.portalName + '/catalog.xml?f=type(eq)CONTENTREPOSITORY', {async: false}).then(function(data){
            be.ice.model.repositoryId = $('contentRepository > properties > [name="repositoryId"] > value', data).text();
        });


        // TODO: cleanup unified configuration - mappers / events / ckeditor
        config = widget.iceConfig || {};
        if(config) {
            // widget.ckEditorConfig = config.ckeditor || {};
            mapper.config.names = config.mappers || [];
            events.config.names = config.events || [];
            events.config.editor = config.ckeditor || {};
            util.config = config || {};
        }

        result = unified
            .get(
                widget,
                optionalTemplatePath
            )
            .then(function(model) {
                optionalModel = optionalModel || {};
                // scripts cannot be loaded by .toDom-ming the view. Load them here and remove
                var re = /<script\b[^>]*>([\s\S]*?)<\/script>/gm;
                var match = re.exec(model.template.content);
                var src = '';
                var id = '';
                if (match) {
                    re = /\ssrc=(?:(?:'([^']*)')|(?:"([^"]*)")|([^\s]*))/i;
                    src = re.exec(match[0]);
                    if(src) {
                        src = util.getContextRoot() + src[0].replace(' src="', '').replace('"', '');
                        re = /\sid=(?:(?:'([^']*)')|(?:"([^"]*)")|([^\s]*))/i;
                        id = re.exec(match[0])[2];

                        $.getScript(src, function() {
                            // TODO: is this generic?
                            gadgets.pubsub.publish('enable:' + id, {
                                src: src,
                                widget: widget
                            });
                        });
                    }
                }

                // annotate
                var view = mapper.annotate(
                    model.template.content.replace(/<script[^>]+><\/script>/g, ''),
                    $.extend(true, {}, xforms.model2mustache(model), optionalModel)
                );

                var dom = mapper.toDom(view, unsafe);

                // attach widget events
                dom = events.attachEvents(dom, widget);

                // attach dom handlers
                dom = mapper.attachHandlers(dom);

                $(widget.body).addClass('be-ice-widget-rendered');

                return editHandler(
                    model,
                    dom,
                    optionalModel
                );
            });

        setTimeout(function(){
            $(widget.htmlNode).trigger('ice.rerendered');
        }, 0);

        return result;
    };

    return {
        render: render,
        edit: edit,
        _testinit: _testinit,
        editHandler : editHandler
    };
});


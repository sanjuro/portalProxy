/**
 *  ----------------------------------------------------------------
 *  Copyright © 2003/2014 Backbase B.V.
 *  ----------------------------------------------------------------
 *  Author : Backbase R&D - Amsterdam - New York
 *  Filename : require-tpl.js
 *  Description:
 *
 *  ----------------------------------------------------------------
 */
define(['text', 'mustache'], function(text, Mustache) {
    'use strict';

    var sourceMap = {},
        buildMap = {},
        buildTemplateSource = 'define(\'{pluginName}!{moduleName}\', [\'mustache\'], function (Mustache) { var template = \'{content}\'; Mustache.parse( template ); return function( view ) { return Mustache.render( template, view ); } });\n',
        fileExt = function(fname) {
            return fname.substr((Math.max(0, fname.lastIndexOf('.')) || Infinity) + 1);
        };
    return {
        version: '0.0.3',

        load: function(moduleName, parentRequire, onload, config) {
            if (buildMap[moduleName]) {
                onload(buildMap[moduleName]);

            } else {
                var defaultExt = (config.tpl && config.tpl.extension) || '.html',
                    allowedExt = [defaultExt, '.xml'],
                    path = (config.tpl && config.tpl.path) || '',
                    name = (path + moduleName),
                    ext = fileExt(name);

                if (allowedExt.indexOf(defaultExt) < 0) {
                    name += defaultExt;
                }

                text.load(name, parentRequire, function(source) {
                    if (config.isBuild) {
                        sourceMap[moduleName] = source;
                        onload();
                    } else {

                        switch (ext) {
                            case 'ng':
                                buildMap[moduleName] = source;
                                break;
                            default:
                                Mustache.parse(source);
                                buildMap[moduleName] = function(view) {
                                    return Mustache.render(source, view);
                                };
                        }
                        onload(buildMap[moduleName]);
                    }
                }, config);
            }
        },

        write: function(pluginName, moduleName, write, config) {
            var source = sourceMap[moduleName],
                content = source && text.jsEscape(source);
            if (content) {
                write.asModule(pluginName + '!' + moduleName,
                    buildTemplateSource
                    .replace('{pluginName}', pluginName)
                    .replace('{moduleName}', moduleName)
                    .replace('{content}', content));
            }
        }
    };
});

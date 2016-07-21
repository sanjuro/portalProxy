/**
 *  ----------------------------------------------------------------
 *  Copyright © 2003/2014 Backbase B.V.
 *  ----------------------------------------------------------------
 *  Author : Backbase R&D - Amsterdam - New York
 *  Filename : app.js
 *  Description:
 *  File uploader module
 *  ----------------------------------------------------------------
 */

define(function(require, exports, module) {

    'use strict';

    var staticPath = 'backbase.com.2014.components/modules/fileupload/';

    /*----------------------------------------------------------------*/
    /*  Import
    /*----------------------------------------------------------------*/
    var ng = require('angular'),
        config = require('zenith/core/config'),
        FileuploadSrv = require('backbase.com.2014.components/modules/fileupload/scripts/fileupload.srv'),
        FileuploadDir = require('backbase.com.2014.components/modules/fileupload/scripts/fileupload.dir');
    // require('zenith/http');

    var name = 'bbFileupload',
        deps = [
            // 'http'
        ];

    function Configure() {
        // do upfront configuration
    }


    function Runner($rootScope) {
        $rootScope.fileuploadPaths = {
            tpl : config.contextRoot + staticPath + 'templates/'
        };
    }

    return ng.module(name, deps)
        .config([ Configure ])
        .directive(FileuploadDir.directives)
        .service('FileuploadSrv', FileuploadSrv)
        .run([ '$rootScope', Runner ]);
});



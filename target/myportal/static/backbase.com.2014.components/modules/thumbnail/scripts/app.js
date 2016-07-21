/**
 *  ----------------------------------------------------------------
 *  Copyright © 2003/2014 Backbase B.V.
 *  ----------------------------------------------------------------
 *  Author : Backbase R&D - Amsterdam - New York
 *  Filename : app.js
 *  Description:
 *  Import Portal Module App
 *  ----------------------------------------------------------------
 */
define(function(require, exports, module) {

    'use strict';

    /*----------------------------------------------------------------*/
    /*  Import
    /*----------------------------------------------------------------*/
    var ng = require('angular'),
        // bus = require('zenith/bus'),
        config = require('zenith/core/config'),
        staticPath = config.contextRoot + '/static/backbase.com.2014.components/modules/thumbnail/',
        ThumbnailCtrl = require('backbase.com.2014.components/modules/thumbnail/scripts/ThumbnailCtrl'),
        ThumbnailDir = require('backbase.com.2014.components/modules/thumbnail/scripts/ThumbnailDir'),
        Fileupload = require('backbase.com.2014.components/modules/fileupload/scripts/app'),
        Components = require('backbase.com.2014.components/scripts/app');



    /*----------------------------------------------------------------*/
    /* Register Widget Events
    /*----------------------------------------------------------------*/
    // var WIDGET_EVENTS = {
    //     portalImported  : 'Widget.CreatePortal.portalImported'
    // };

    // bus.registerEvents( WIDGET_EVENTS );

    /*----------------------------------------------------------------*/
    /* Main App
    /*----------------------------------------------------------------*/

    var name = 'cxpThumbnailUpload';
    var deps = [
        'backbase.com.2014.components', // provides ui.bootstrap
        'bbModal',
        Fileupload.name
    ];

    function Configure() {
        // do upfront configuration
    }

    function Runner($rootScope) {
        $rootScope.importPortalPaths = {
            tpl : staticPath + 'templates/'
        };
    }


    module.exports =  ng.module(name, deps)
        // .constant('WIDGET_EVENTS', WIDGET_EVENTS)
        .config([ Configure ])
        .directive(ThumbnailDir.directives)
        .controller('ThumbnailCtrl', ThumbnailCtrl)
        .run([ '$rootScope', Runner ]);
});

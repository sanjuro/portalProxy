/**
 *  ----------------------------------------------------------------
 *  Copyright © 2003/2014 Backbase B.V.
 *  ----------------------------------------------------------------
 *  Author : Backbase R&D - Amsterdam - New York
 *  Filename : app.js
 *  Description: Migration of GroupsApp
 *
 *  ----------------------------------------------------------------
 */
define(function(require, exports, module) {

    'use strict';

    require('css!backbase.com.2012.sabre/widgets/CatalogBrowser/items-library.css');

    /*----------------------------------------------------------------*/
    /* Deps & Declaring vars & setting intitial states
    /*----------------------------------------------------------------*/
    var Promise = require('zenith/promise'),
        httpPortals = require('zenith/http/portals'),
        item = require('zenith/utils/item'),
        error = require('zenith/core/errors-handler'),
        angular = require('angular'),
        portalName = item.url2state('portalName'),
        itemsLibrary = require('backbase.com.2012.sabre/widgets/CatalogBrowser/items-library'),
        $ = require('jquery'),
        portalDetails;

    /*----------------------------------------------------------------*/
    /* Get data
    /*----------------------------------------------------------------*/
    if (portalName) {
        portalDetails = httpPortals.portalDetails(portalName);
    }

    /*----------------------------------------------------------------*/
    /* Start the widget
    /*----------------------------------------------------------------*/
     var Runner = function($rootScope, Widget) {
        Promise.all(portalDetails)
            .then(function(portal) {
                if(portal) {

                    // legacy
                    bd.selectedPortalName = portal.name;
                    bd.selectedPortalTitle = portal.getProperty('title');
                    bd.selectedPortalOptimizedFor = portal.getProperty('DefaultDevice');
                    bd.selectedPortalTargetDevice = portal.getProperty('TargetedDevice');

                    // if this is the combined view (portal/server catalog):
                    // load portal catalog. itemsLibrary will be server catalog
                    var isCustomCatalog = typeof bd.widgets !== 'undefined' && typeof bd.widgets.PortalCatalog !== 'undefined';
                    if(isCustomCatalog){
                        CatalogManager.renderUI(Widget.body, undefined, true);
                    }
                    $(Widget.body).find('.pageDesignerWrapper').show();
                    itemsLibrary.makeLibraryWidget(Widget, isCustomCatalog);
                }

            }, function(err) {
                error.trigger(err);
            });

        //
    };

    module.exports = angular.module('CatalogBrowser', [])
        .run(Runner);

});

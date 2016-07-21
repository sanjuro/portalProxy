/**
 *  ----------------------------------------------------------------
 *  Copyright © 2003/2014 Backbase B.V.
 *  ----------------------------------------------------------------
 *  Author : Backbase R&D - Amsterdam - New York
 *  Filename : app.js
 *  Description: Migrating PageManagement
 *
 *  ----------------------------------------------------------------
 */
define(function(require, exports, module) {

    'use strict';

    /*----------------------------------------------------------------*/
    /* Deps & Declaring vars & setting intitial states
    /*----------------------------------------------------------------*/
    var Promise = require('zenith/promise'),
        httpPortals = require('zenith/http/portals'),
        item = require('zenith/utils/item'),
        error = require('zenith/core/errors-handler'),
        portalName = item.url2state('portalName'),
        portalDetails;

    // load learnmore script for documentation urls
    require('backbase.com.2014.components/scripts/learnmore');

    /*----------------------------------------------------------------*/
    /* Get data
    /*----------------------------------------------------------------*/
    if (portalName) {
        portalDetails = httpPortals.portalDetails(portalName);
    }

    /*----------------------------------------------------------------*/
    /* Start the widget
    /*----------------------------------------------------------------*/
     exports.init = function($widget) {
        Promise.all(portalDetails)
            .then(function(portal) {

                if(portal) {
                    // legacy
                    bd.selectedPortalName = portal.name;
                    bd.selectedPortalTitle = portal.getProperty('title');
                    bd.selectedPortalOptimizedFor = portal.getProperty('DefaultDevice');
                    bd.selectedPortalTargetDevice = portal.getProperty('TargetedDevice');
                    bd.typeOfTags = portal.getProperty('TypeOfTags') ? portal.getProperty('TypeOfTags').split(',') : '';

                    var publishChains = portal.getProperty('publishChains');
                    if (publishChains){
                        bd.selectedPortalPublishChains = publishChains.split(';');
                    }

                    // portal.config.isPublishAppAvailable = true;
                    // bd.widgets.PortalMgmtGadget.Canvas();
                    bd.widgets.PageMgmtMVC.Maximized($widget);
                }

            }, function(err) {
                error.trigger(err);
            });

        //
    };

});

/**
 *  ----------------------------------------------------------------
 *  Copyright © 2003/2014 Backbase B.V.
 *  ----------------------------------------------------------------
 *  Author : Backbase R&D - Amsterdam - New York
 *  Filename : app.js
 *  Description:
 *  Search component module
 *
 *
 *
 *  Usage:


 *  ----------------------------------------------------------------
 */

define([
    'angular'
    ,'backbase.com.2014.components/modules/search/scripts/search.srv'
    ,'backbase.com.2014.components/modules/search/scripts/search.dir'
], function (ng, bbSearchSrv, bbSearchDir) {
    'use strict';

    var bbSearch = ng.module('bbSearch', [])
            .service('bbSearchSrv', bbSearchSrv)
            .directive('bbToolbarSearch', bbSearchDir);

    return bbSearch;
});

/**
 *  ----------------------------------------------------------------
 *  Copyright © 2003/2014 Backbase B.V.
 *  ----------------------------------------------------------------
 *  Author : Backbase R&D - Amsterdam - New York
 *  Filename : app.js
 *  Description:
 *
 *  ----------------------------------------------------------------
 */
/* globals define */

define([
    'angular',
    'ui-bootstrap'
], function(angular) {
    'use strict';

    var name = 'backbase.com.2014.components',
        deps = ['ui.bootstrap'];

    return angular.module(name, deps);
});

/**
 *  ----------------------------------------------------------------
 *  Copyright (c) 2003/2014 Backbase B.V.
 *  ----------------------------------------------------------------
 *  Author : Backbase R&D - Amsterdam - New York
 *  Filename : checkbox.dir.js
 *  Description: checkbox component directive.
 *
 * @example
 *  <span class="bb-checkbox" data-ng-class="{'c_on': checked, 'c_off': !checked, 'bb-checkbox-grey': color, 'bb-checkbox-white': !color}" data-cid="{{cid}}" data-ng-click="click(checked)">
 *      <input type="checkbox" data-ng-model="checked" name="{{name}}" value="{{value}}"/>
 *  </span>
 *
 *  ----------------------------------------------------------------
 */
define([
    'angular',
    'jquery'
], function(angular, $){
    'use strict';

    var bbCheckBox = function(){
        return {
            restrict: 'EA',
            scope: {
                name : '=?',
                value : '=?',
                checked: '=?',
                cid: '=?',
                color: '=?',
                onChange : '=?' //[optional] onChange tells the controller when it is being clicked
            },
            templateUrl :'static/backbase.com.2014.components/templates/input/checkbox.html',
            link: function(scope){
                scope.color = scope.color !== undefined || true;
                scope.cid = scope.cid || '';
                scope.checked = scope.checked !== undefined ? scope.checked : false;

                scope.click = function(checked) {
                    scope.checked = !checked;
                    if(scope.onChange && scope.onChange instanceof Function) scope.onChange(scope.checked);
                };

            }
        };
    };

    angular.module('bbCheckbox', [])
        .directive('bbCheckbox', bbCheckBox);
});

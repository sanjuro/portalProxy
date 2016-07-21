/**
 *  ----------------------------------------------------------------
 *  Copyright (c) 2003/2014 Backbase B.V.
 *  ----------------------------------------------------------------
 *  Author : Backbase R&D - Amsterdam - New York
 *  Filename : checkboxMultiSelect.dir.js
 *  Description: multi Select with checkbox directive.
 *
 * @example
 *  <div class="btn-group dropdown bb-checkbox-multiselect" data-cid="{{cid}}">
 *      <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" data-ng-disabled="!(options && options.length)">
 *          {{label ? label : 'Multi Select'}} <span class="caret"></span>
 *      </button>
 *      <ul class="dropdown-menu">
 *          <li data-ng-repeat="opt in options" data-ng-click="click($event, opt)">
 *              <a href="#" class="dropdown-menu-item">
 *                  <span data-bb-checkbox="" data-checked="opt.checked" data-value="opt.value" data-name="opt.name"></span>
 *                  {{opt.text}}
 *              </a>
 *          </li>
 *      </ul>
 *  </div>
 *
 *  ----------------------------------------------------------------
 */
define([
    'angular',
    'jquery',
    'zenith/core/config',
    'backbase.com.2014.components/scripts/checkbox'
], function(angular, $, config){
    'use strict';

    var bbCheckboxMultiSelect = function(){
        return {
            restrict: 'EA',
            scope: {
                cid : '=?',
                options : '=?',
                label : '=?',
                onChange : '=?' //[optional] onChange tells the controller when it is being clicked
            },
            templateUrl : config.contextRoot + '/static/backbase.com.2014.components/templates/dropdown/checkboxMultiSelect.html',
            link: function(scope, iElement){
                //use stopPropagation to stop the dropdown from closing
                iElement.find('.dropdown-menu')
                    .on('click.multiselect', function (e) {
                        e.stopPropagation();
                        return false;
                    });

                scope.click = function($event, opt) {
                    if(!angular.element($event.target).is('.bb-checkbox')){
                        opt.checked = !opt.checked;
                    }
                    if(scope.onChange && scope.onChange instanceof Function) scope.onChange(opt);
                };
            }
        };
    };

    angular.module('bbMultiSelect.checkBox', [
            'bbCheckbox' //dep on checkbox dir
        ])
        .directive('bbCheckboxMultiSelect', bbCheckboxMultiSelect);
});

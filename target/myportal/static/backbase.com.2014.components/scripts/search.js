//require config to get the css dependency and shim the bc.components and the tokenInput plugin
require.config({

    /*----------------------------------------------------------------*/
    /*
    /*----------------------------------------------------------------*/
    paths: {
        'bcComponents' : 'backbase.com.2012.components/js/components'
        ,'bcComponentsSearch' : 'backbase.com.2012.components/js/components.search'
        ,'tokeninput' : 'dashboard/js/lib/jquery.tokeninput-1.6.0.batched'
        ,'common-utils' : 'backbase.com.2014.zenith/widgets/ContentManager/scripts/__trash/common-utils'
    },
    /*----------------------------------------------------------------*/

    // ----------------------------------------------------------------
    deps: [
        'css!backbase.com.2012.components/css/components'
        ,'css!backbase.com.2012.components/css/icons'
        ,'css!dashboard/css/token-input-bb'
    ],


    /*----------------------------------------------------------------
    /*
    /*----------------------------------------------------------------*/
    shim: {
        'tokeninput' : {
            deps: ['jquery'],
            exports: 'tokeninput'
        },
        'bcComponents' : {
            //TODO: remove the common-util deps
            deps: ['jquery', 'common-utils'],
            exports: 'bcComponents'
        },
        'bcComponentsSearch' : {
            deps: ['jquery' , 'bcComponents', 'tokeninput'],
            exports: 'bcComponentsSearch'
        }
    }
});




//return the search component as an AngularJs directive
define([
    'angular'
    ,'jquery'
    ,'tokeninput'
    ,'bcComponents'
    ,'bcComponentsSearch'
], function(angular) {
    'use strict';

    var bbToolbarSearch = function($compile) {
        return {
            scope: {
                cmd : '=?'
            },
            link: function(scope, $element, attrs) {
                //console.log(scope.cmd);
                //param for searchTokenInput
                var params = {
                        tokenInputParams : {
                            idPrefix: 'token-input-CM-search'
                        },
                        cmd : scope.cmd,
                        target : $element,
                        isBootStrap : true,
                        'onSearch' : function(data){ console.log('onSearch', data); },
                        'onResult' : function(data){ console.log('onResult', data); },
                        'onCancel' : function(data){
                            console.log('onCancel', data);
                            if (attrs.bbToolbarSearch){
                                scope.$apply(function(){
                                    scope.$eval(attrs.bbToolbarSearch + "=''");
                                });
                            }
                         }
                    },

                    searchTokenInput = bc.component.searchTokenInput(params),

                    $template = searchTokenInput.$template,
                    $tokenizedInput = $template.find('.bc-tokenInput-input'),

                    changeToken = function(opts) {
                        var cmd = opts.cmd +':';

                        $template.find('.bc-search-input').tokenInput("clear");
                        $tokenizedInput.focus().val(cmd);
                    };


                if (attrs.bbToolbarSearch){
                    $tokenizedInput.attr('data-ng-model', attrs.bbToolbarSearch);
                }

                //add bootStrap css class
                $template.find('.token-input-list').addClass('form-control');
                $tokenizedInput.addClass('input-sm');

                scope.dropdownOpts = searchTokenInput.cmd;
                //setup default click action
                scope.dropdownClick = function(opts){
                    changeToken(opts);
                };

                //compile the inner template to initialize the angularjs ui dropdown
                $compile($element.contents())(scope);

            }
        };
    };

    angular.module('bbSearch', [])
        .directive('bbToolbarSearch', bbToolbarSearch);
});

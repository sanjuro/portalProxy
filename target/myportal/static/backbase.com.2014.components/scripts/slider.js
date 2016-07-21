/**
 *  ----------------------------------------------------------------
 *  Copyright (c) 2003/2014 Backbase B.V.
 *  ----------------------------------------------------------------
 *  Author : Backbase R&D - Amsterdam - New York
 *  Filename : slider.dir.js
 *  Description: Slider component directive.
 *
 * @example
 * <div data-bb-slider="myController.sliderValue" class="slider" data-ng-class="{disabled: myController.sliderDisabled}">
 *     <div class="slider-active"></div>
 *     <div class="slider-grip"></div>
 * </div>
 *
 * @example without "active" bar and disabling
 * <div data-bb-slider="myController.sliderValue" class="slider">
 *     <div class="slider-grip"></div>
 * </div>
 *
 * @example vertical
 * <div data-bb-slider="myController.sliderValue" class="slider vertical" data-ng-class="{disabled: myController.sliderDisabled}">
 *     <div class="slider-active"></div>
 *     <div class="slider-grip"></div>
 * </div>
 *
 *  ----------------------------------------------------------------
 */
define([
    'angular',
    'jquery'
], function(angular, $){
    'use strict';

    var slider = function(){
        return {
            restrict: 'EA',
            require: '?ngModel',
            scope: {
                bbSlider: '='
            },
            replace: true,
            link: function($scope, $element, $attrs){
                var grid = $attrs.snap || 1, initialized;

                var posLeft = 'pageX',
                    cssLeft = 'left',
                    elSize = 'width',
                    sliderActiveTransition = 'width .2s',
                    sliderGripTransition = 'left .2s';

                if ($element.hasClass('vertical')){
                    posLeft = 'pageY';
                    cssLeft = 'top';
                    elSize = 'height';
                    sliderActiveTransition = 'height .2s';
                    sliderGripTransition = 'top .2s';
                }

                var setValue = function(value){
                    value = value > 100 ? 100 : value < 0 ? 0 : value; // possible values are between 0 and 100

                    $element.find('.slider-active').css(elSize, value + '%');
                    $element.find('.slider-grip').css(cssLeft, value + '%');
                    if (initialized){ // skip $apply on initialization stage
                        value = Math.round(value / grid) * grid; // stick to grid
                        $scope.$apply(function(){$scope.bbSlider = value;});
                    }
                };

                var updatePosition = function(evt){
                    if (evt.button === 0 || evt.button === 1){
                        var position = (evt[posLeft] - $element.offset()[cssLeft]) / $element[elSize]() * 100;
                        setValue(position);
                    }
                };

                setValue($scope.bbSlider || 0);

                $element.on('mousedown', function(evt){
                    if ($element.hasClass('disabled') || evt.button !== 0 && evt.button !== 1){
                        return;
                    }
                    // Temporary set transition for smooth animation to the click point
                    $element.find('.slider-active').css({'transition': sliderActiveTransition});
                    $element.find('.slider-grip').css({'transition': sliderGripTransition});

                    updatePosition(evt);

                    setTimeout(function(){
                        $element.find('.slider-active').css({'transition': ''});
                        $element.find('.slider-grip').css({'transition': ''});
                    }, 200);

                    $(document).on('mousemove', updatePosition).on('mouseup', function(){
                        $(document).off('mousemove', updatePosition);
                    });
                });

                initialized = true;
            }
        };
    };

    angular.module('bbSlider', [])
        .directive('bbSlider', slider);
});
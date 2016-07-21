/**
 *  ----------------------------------------------------------------
 *  Copyright (c) 2003/2014 Backbase B.V.
 *  ----------------------------------------------------------------
 *  Author : Backbase R&D - Amsterdam - New York
 *  Filename : pieprogress.dir.js
 *  Description: Pie progress component directive
 *
 * @example
 * <div data-bb-pie-progress="progressValue"></div>
 *
 *  ----------------------------------------------------------------
 */
define([
    'angular'
], function(angular) {
    'use strict';

    angular.module('bbPieProgress', [])
        .directive('bbPieProgress', [
            function() {
                return {
                    restrict: 'EA',
                    template: '<span class=\"pie-progress-container\"><canvas id="progress-{{$id}}"></canvas><span class="pie-progress-label">{{progress}}%</span></span></span>',
                    replace: true,
                    link: function($scope, $element, $attrs) {
                        var $progressPie = $element.find('.pie-progress');

                        var drawProgress = function() {
                            var width = $element.width();
                            var height = $element.height();

                            var bg = $element.find('canvas');
                            bg.attr('width', width);
                            bg.attr('height', height);
                            var ctx = bg[0].getContext('2d');
                            var imd = null;
                            var circ = Math.PI * 2;
                            var quart = Math.PI / 2;
                            ctx.beginPath();
                            ctx.strokeStyle = '#999999';
                            ctx.lineCap = 'square';
                            ctx.closePath();
                            ctx.fill();
                            ctx.lineWidth = 8.0;

                            imd = ctx.getImageData(0, 0, width, height);

                            var draw = function(current) {
                                ctx.putImageData(imd, 0, 0);
                                ctx.beginPath();
                                ctx.arc(width / 2, height / 2, (Math.min(width, height) - 30) / 2, -(quart), ((circ) * current) - quart, false);
                                ctx.stroke();
                            }

                            draw($scope.progress / 100);
                        };

                        $scope.progress = $scope.$eval($attrs.bbPieProgress);

                        $scope.$watch($attrs.bbPieProgress, function(newValue, oldValue) {
                            if (newValue > 100) {
                                newValue = 100;
                            }
                            if (newValue < 0) {
                                newValue = 0;
                            }
                            $scope.progress = newValue;
                            drawProgress();
                        });
                    }
                };
            }
        ]);
});

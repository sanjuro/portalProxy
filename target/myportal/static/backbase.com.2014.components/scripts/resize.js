/**
 *  ----------------------------------------------------------------
 *  Copyright © 2003/2014 Backbase B.V.
 *  ----------------------------------------------------------------
 *  Author : Backbase R&D - Amsterdam - New York
 *  Filename : resize.dir.js
 *  Description: Resize (vertical cells in tree) directive.
 *
 * @example
 * <div class="bc-resizeable" data-bb-resize="bc-dragbar">
 *   <ul class="bc-tree bc-accordion" data-bb-tree=""></ul>
 *   <div class="bc-dragbar"></div>
 *   <ul class="bc-tree bc-tree-bottom">
 * </div>
 *
 * The 2 ULs have to be positioned absolute (relative to $element) to
 * top and bottom. Height and top will be changed accordingly.
 * The first LIs of the ULs always stays visible.
 *  ----------------------------------------------------------------
 */
define([
    'angular',
    'jquery'
], function(angular, $) {
    'use strict';

    angular.module('bbResize', [])
        .directive('bbResize', ['$rootScope',
            function($rootScope) {
                return {
                    link: function(scope, $element, attrs) {
                        var $body = $(document.body),
                            $dragBar = $element.find('.' + attrs.bbResize),
                            $topElm, $bottomElm,

                            startValues = {},
                            setHeight = function(value) {
                                $bottomElm.height(value);
                                $topElm.css({
                                    bottom: value + startValues.delta
                                });
                                $dragBar.css({
                                    bottom: value
                                });
                            },
                            mouseMove = function(e) {
                                if (startValues.y) {
                                    var value = startValues.height + startValues.y - e.pageY;
                                    setHeight(
                                        value < startValues.minHeight ? startValues.minHeight :
                                        startValues.maxHeight < value + startValues.delta ? startValues.maxHeight - startValues.delta :
                                        value
                                    );
                                }
                            },
                            mouseUp = function(e) {
                                $body.off('mousemove', mouseMove).off('mouseup', mouseUp);
                            };

                        $rootScope.$on('element.ready', function($event, $elm){
                            if ($dragBar.prev().is($elm)){
                                $topElm = $dragBar.prev();
                            } else if ($dragBar.next().is($elm)){
                                $bottomElm = $dragBar.next();
                            }
                        });

                        // if (window.cookiesExist) { // bullshit, but it shows how to go on
                        //     setHeight(value);
                        // }

                        $dragBar.on('mousedown', function(e) {
                            var dragBarHeight = this.offsetHeight, // $(this).height();
                                elementHeight = $topElm[0].offsetHeight + dragBarHeight + $bottomElm[0].offsetHeight, // .height(),
                                maxHeight = elementHeight,
                                minHeight = 0;

                            $body.on('mousemove', mouseMove).on('mouseup', mouseUp);
                            $topElm.children().each(function(idx, elm) {
                                maxHeight -= elm.children[0].offsetHeight; // $(elm).height();
                            });
                            $bottomElm.children().each(function(idx, elm) {
                                minHeight += elm.children[0].offsetHeight;
                            });

                            startValues = {
                                x: e.pageX,
                                y: e.pageY,
                                height: $bottomElm[0].offsetHeight || elementHeight - $topElm[0].offsetHeight - dragBarHeight,
                                delta: dragBarHeight,
                                maxHeight: maxHeight,
                                minHeight: minHeight
                            };
                            return (e.returnValue = false);
                        });
                    }
                };
            }
        ]);
});

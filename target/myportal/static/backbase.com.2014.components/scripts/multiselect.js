/**
 *  ----------------------------------------------------------------
 *  Copyright © 2003/2014 Backbase B.V.
 *  ----------------------------------------------------------------
 *  Author : Backbase R&D - Amsterdam - New York
 *  Filename : multiselect.js
 *  Description:
 *  Implements select/multiselect pattern
 *  ----------------------------------------------------------------
 */
define([
    'angular',
    'zenith/utils'
], function(angular, utils){
    'use strict';

    var SELECTED_CLASS_NAME = 'bb-selected';
    var NAVIGATE_PARENT_CLASS_NAME = 'bb-navigate-parent';

    return angular.module('bbMultiselect', [])
        .directive('bbMultiselect', [function(){
            return {
                restrict: 'EA',
                scope: true,
                controller: function($scope, $element){
                    var self = this;

                    this.selector = null;
                    this.lastActivity = null;
                    this.lastKeyboardActivity = null;

                    this.select = function(item, add){
                        var $item = angular.element(item);
                        if (!add && $item.length === 1){
                            self.lastKeyboardActivity = null;
                            this.deselect($item.siblings());
                        }
                        $item.toggleClass(SELECTED_CLASS_NAME);
                        $item.hide().show(0);

                        this.scrollTo(item);

                        $scope.$emit('select', $element.find(self.selector + '.' + SELECTED_CLASS_NAME));
                    };

                    this.scrollTo = function(item){
                        var $item = angular.element(item);
                        if ($item.offset().top > $item.parent().offset().top + $item.parent().height()) {
                            $item.parent().get(0).scrollTop += $item.height() + parseInt($item.css('marginTop'), 10) * 2;
                        } else if ($item.offset().top < $item.parent().offset().top + (parseInt($item.css('marginTop'), 10) || $item.height()) * 2) {
                            $item.parent().get(0).scrollTop -= $item.height() + parseInt($item.css('marginTop'), 10) * 2;
                        }
                    };

                    this.selectRange = function(begin, end){
                        this.deselect();

                        var items = $element.find(this.selector);
                        var beginIndex = items.index(begin);
                        var endIndex = items.index(end);

                        if (beginIndex > endIndex){
                            endIndex = [beginIndex, beginIndex = endIndex][0];
                        }
                        this.select(items.splice(beginIndex, endIndex - beginIndex + 1));
                    };

                    this.deselect = function($item){
                        if ($item){
                            $item.removeClass(SELECTED_CLASS_NAME).hide().show(0);
                        } else {
                            $element.find(this.selector).removeClass(SELECTED_CLASS_NAME).hide().show(0);
                        }
                        $scope.$emit('select', $element.find(self.selector + '.' + SELECTED_CLASS_NAME));
                    };

                    /**
                     * Finds the next item to select based on currently selected item and direction
                     * @param  {Object} startItem - currently selected item
                     * @param  {String} direction - selection direction
                     * @return {Object}           - item to select
                     */
                    this.getNextItem = function(startItem, direction){
                        var $startItem = angular.element(startItem),
                            $items = $element.find(self.selector),
                            startItemIndex = $items.index(startItem),
                            boundaryBottom = Math.max(0, startItemIndex - 10),
                            offset = $startItem.offset(),
                            nextItem = null,
                            matrix = {},
                            found, mainOffset, secondaryOffset, mainKey, secKey, cachedSecKey;

                        var $itemsRange = angular.element($items.splice(boundaryBottom, 20));

                        // Building matrix of offsets
                        $itemsRange.each(function(idx, item){
                            var $el = angular.element(item);
                            var curItemOffset = $el.offset(),
                                curItemOffsetLeft = String(parseInt(curItemOffset.left, 10)),
                                curItemOffsetTop = String(parseInt(curItemOffset.top, 10));

                            if (direction === 'up' || direction === 'down') {
                                matrix[curItemOffsetLeft] = matrix[curItemOffsetLeft] || [];
                                matrix[curItemOffsetLeft][curItemOffsetTop] = $el;
                            } else {
                                matrix[curItemOffsetTop] = matrix[curItemOffsetTop] || [];
                                matrix[curItemOffsetTop][curItemOffsetLeft] = $el;
                            }
                        });

                        // Find neibourgh element based on matrix
                        mainOffset = direction === 'up' || direction === 'down' ? String(parseInt(offset.left, 10)) : String(parseInt(offset.top, 10));
                        secondaryOffset = direction === 'up' || direction === 'down' ? String(parseInt(offset.top, 10)) : String(parseInt(offset.left, 10));
                        for (mainKey in matrix) {
                            mainKey = String(parseInt(mainKey, 10));
                            if (mainKey === mainOffset) {
                                cachedSecKey = null;
                                var sortedSecKeys = utils.keys(matrix[mainKey]).sort(function(a, b){
                                    a = parseInt(a, 10);
                                    b = parseInt(b, 10);
                                    return a > b ? 1 : b > a ? -1 : 0;
                                });
                                for (var i = 0; i < sortedSecKeys.length; i++) {
                                    secKey = sortedSecKeys[i];
                                    secKey = String(parseInt(secKey, 10));
                                    if (found){
                                        nextItem = matrix[mainKey][secKey];
                                        break;
                                    }
                                    if (secKey === secondaryOffset) {
                                        if (direction === 'down' || direction === 'right') {
                                            found = true;
                                        } else {
                                            nextItem = matrix[mainKey][cachedSecKey];
                                            break;
                                        }
                                    }
                                    cachedSecKey = secKey;
                                }
                                break;
                            }
                        }

                        return nextItem;
                    };

                    $scope.selectInDirection = function($event, direction){
                        if (!self.lastActivity || $element.find(self.selector).index(self.lastActivity) === -1){
                            self.lastActivity = $element.find(self.selector).get(0);
                            self.select(self.lastActivity);
                        } else {
                            var startItem = self.lastActivity;
                            var nextItem = self.getNextItem(startItem, direction);
                            if (nextItem){
                                self.lastActivity = self.lastKeyboardActivity = nextItem;
                                self.select(nextItem);
                            }
                        }
                    };

                    $scope.addSelectionInDirection = function($event, direction){
                        if (!self.lastActivity){
                            self.lastActivity = $element.find(self.selector).get(0);
                            self.select(self.lastActivity);
                        } else {
                            var startItem = self.lastKeyboardActivity || self.lastActivity;

                            var nextItem = self.getNextItem(startItem, direction);
                            if (nextItem){
                                self.lastKeyboardActivity = nextItem;
                                self.selectRange(self.lastActivity, nextItem);
                            }
                        }

                    };

                    $scope.selectAll = function($event){
                        $event.preventDefault();
                        var $items = $element.find(self.selector).removeClass(SELECTED_CLASS_NAME);
                        self.select($items.not('.'+NAVIGATE_PARENT_CLASS_NAME));
                        self.lastActivity = null;
                    };
                },
                link: function($scope, $element, attrs, controller){

                    controller.selector = attrs.bbMultiselect;

                    $element.on('click', function($event){
                        var $target = angular.element($event.target),
                            $item = $target.closest(attrs.bbMultiselect);
                        if ($item.length){
                            if (!$event.shiftKey){
                                controller.select($item, $event.metaKey || $event.ctrlKey);
                                controller.lastActivity = $item;
                            } else {
                                if ($item.attr('data-uuid') === undefined){
                                    controller.select($item);
                                } else {
                                    controller.selectRange(controller.lastActivity, $item);
                                }
                            }
                        } else {
                            controller.deselect();
                            controller.lastActivity = null;
                        }
                    });

                    angular.element(document).on('keyup', function(event){
                        if (event.keyCode === 27) {
                            $element.find(controller.selector).removeClass(SELECTED_CLASS_NAME);
                        }
                    });

                    $scope.$on('new.folder', function(e, item){
                        function findNewFolder(uuid, callback) {
                            var elm = $element.find('[data-uuid='+uuid+']');
                            return (elm.length) ? callback(elm) : scrollDown(function(){
                                setTimeout(function(){
                                    findNewFolder(uuid, callback);
                                });
                            });
                        }

                        function scrollDown(callback) {
                            $scope.canvasCtrl.loadMoreItems();
                            $scope.$$phase ? callback() : $scope.$apply(callback);
                        }

                        setTimeout(function(){
                            findNewFolder(item.uuid, function(elm){
                                controller.select(elm);
                                controller.lastActivity = elm;
                                $element.get(0).scrollTop += elm.offset().top - elm.height();
                            });
                        }, 60);

                    });
                }
            };
        }]);
});
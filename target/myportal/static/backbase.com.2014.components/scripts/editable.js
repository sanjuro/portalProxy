define([
    'angular',
    'jquery'
], function(angular, $) {
    'use strict';

    function createSelection(field, start, end) {
        if (field.createTextRange) {
            var selRange = field.createTextRange();
            selRange.collapse(true);
            selRange.moveStart('character', start);
            selRange.moveEnd('character', end);
            selRange.select();
            field.focus();
        } else if (field.setSelectionRange) {
            field.focus();
            field.setSelectionRange(start, end);
        } else if (typeof field.selectionStart !== 'undefined') {
            field.selectionStart = start;
            field.selectionEnd = end;
            field.focus();
        }
    }

    var editable = function($rootScope) {
        return {
            restrict: 'A',
            require: '?ngModel',
            link: function(scope, $element, attrs) {
                var $input = $('<input type="text" class="bb-autoedit" />');
                var re = new RegExp(attrs.autoselect || /.*/);
                var clickTimeout, origValue, origScope;

                $element.on('click', function(evt) {
                    if (scope.$eval(attrs.bbEditable) || !attrs.bbEditable) {
                        clickTimeout = setTimeout(function(){
                            $element.hide();
                            $input.val($element.text().trim());
                            $element.after($input);

                            /* bind input events */
                            $input.blur(function() {
                                $input.off();
                                origValue = scope.$eval(attrs.ngModel);
                                origScope = $element.scope();
                                scope.$eval(attrs.ngModel + '="' + $input.val().replace(/\\/g, '\\\\').replace(/"/g, '\\\"') + '"');
                                $rootScope.$broadcast('item.rename', origScope, origValue);
                                $input.remove(false);
                                $element.show();
                            }).keydown(function(evt){
                                evt.stopPropagation();
                                if (evt.keyCode === 27){
                                    $input.off();
                                    origValue = scope.$eval(attrs.ngModel);
                                    origScope = $element.scope();
                                    $rootScope.$broadcast('item.rename.cancel', origScope, origValue);
                                    $input.remove(false);
                                    $element.show();
                                } else if (evt.keyCode === 13){
                                    $input.off();
                                    origValue = scope.$eval(attrs.ngModel);
                                    origScope = $element.scope();
                                    scope.$eval(attrs.ngModel + '="' + $input.val().replace(/\\/g, '\\\\').replace(/"/g, '\\\"') + '"');
                                    $rootScope.$broadcast('item.rename', origScope, origValue);
                                    $input.remove(false);
                                    $element.show();
                                }
                            }).dblclick(function(evt){
                                evt.stopPropagation();
                            });

                            /* pre-select contents */
                            var selMatch = $element.text().match(re);
                            if (selMatch && selMatch[1]) {
                                createSelection($input[0], $element.text().indexOf(selMatch[1]), selMatch[1].length);
                            } else {
                                $input.select();
                            }
                        }, 200);
                    }
                }).on('dblclick', function(evt){
                    clearTimeout(clickTimeout);
                });

                if (scope.$eval(attrs.autoedit)){
                    $element.hide();
                    $input.val(scope.$eval(attrs.ngModel));
                    $element.after($input);
                    $input.focus().select();

                    $input.blur(function() {
                        $input.off();
                        scope.$eval(attrs.ngModel + '="' + $input.val().replace(/\\/g, '\\\\').replace(/"/g, '\\\"') + '"');
                        origScope = $element.scope();
                        $rootScope.$broadcast('item.rename', origScope);
                        $input.remove(false);
                        $element.show();
                    }).keydown(function(evt){
                        evt.stopPropagation();
                        if (evt.keyCode === 27){
                            $input.off();
                            origScope = $element.scope();
                            $rootScope.$broadcast('item.rename.cancel', origScope);
                            $input.remove(false);
                            $element.show();
                        } else if (evt.keyCode === 13){
                            $input.off();
                            origScope = $element.scope();
                            scope.$eval(attrs.ngModel + '="' + $input.val().replace(/\\/g, '\\\\').replace(/"/g, '\\\"') + '"');
                            $rootScope.$broadcast('item.rename', origScope);
                            $input.remove(false);
                            $element.show();
                        }
                    }).dblclick(function(evt){
                        evt.stopPropagation();
                    });
                }
            }
        };
    };

    return angular.module('bbEditable', [])
        .directive('bbEditable', ['$rootScope', editable]);
});

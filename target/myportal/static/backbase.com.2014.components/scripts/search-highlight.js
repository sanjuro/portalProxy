define([
    'angular'
], function(angular){
    'use strict';

    angular.module('bbSearchHighlight', [])
        .directive('bbSearchHighlight', function(){
        return {
            restrict: 'A',
            scope: {
                searchQuery: '=bbSearchHighlight'
            },
            link: function($scope, $element){
                $scope.$watch('searchQuery', function(newValue, oldValue) {
                    if (newValue){
                        $element.attr('origValue', $element.text());
                        $element.html($element.attr('origValue').replace(new RegExp('(' + newValue + ')', 'i'), '<span class="bb-search-highlight">$1</span>'));
                    } else {
                        if ($element.attr('origValue')){
                            $element.html($element.attr('origValue'));
                        }
                    }
                }, true);
            }
        };
    });
});
define([
    'jquery',
    'angular',
    'zenith/utils'
], function ($, ng, utils) {
    'use strict';

    var WizardDirective = function($rootScope){
        return {
            restrict: 'EA',
            scope: true,
            link: function($scope, $element, attrs, controller){
                $($element).on('click', '[bb-wizard-next]', function(){
                    $scope.next();
                });

                $($element).on('click', '[bb-wizard-prev]', function(){
                    $scope.previous();
                });
            },
            controller: ['$scope', '$element', function($scope, $element){
                function unselectAll() {
                    utils.each($scope.steps, function (step) {
                        step.current = false;
                    });
                    $scope.currentStep = null;
                }

                $scope.steps = [];

                this.addStep = function(step) {
                    $scope.steps.push(step);
                    if ($scope.steps.length === 1) {
                        $scope.goTo($scope.steps[0]);
                    }
                };

                // this.setTitle = function(step, title){
                //     step.title = title;
                // };

                $scope.goTo = function(step){
                    unselectAll();
                    $scope.currentStep = step;
                    step.current = true;
                };

                $scope.next = function(){
                    var currentStep = $scope.steps.indexOf($scope.currentStep);
                    if (currentStep < $scope.steps.length - 1){
                        $scope.goTo($scope.steps[currentStep + 1]);
                    }
                };

                $scope.previous = function(){
                    var currentStep = $scope.steps.indexOf($scope.currentStep);
                    if (currentStep > 0){
                        $scope.goTo($scope.steps[currentStep - 1]);
                    }
                };
            }]
        };
    };

    return ['$rootScope', WizardDirective];
});
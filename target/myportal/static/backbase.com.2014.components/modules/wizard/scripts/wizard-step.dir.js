define([
    'angular'
], function(ng) {
    'use strict';

    var WizardStepDirective = function($rootScope) {
        return {
            restrict: 'EA',
            replace: true,
            transclude: true,
            require: '^bbWizard',
            scope: true,
            templateUrl: function($element, attrs){
                return attrs.template || $rootScope.serverRoot + '/static/backbase.com.2014.components/modules/wizard/templates/step.html';
            },
            link: function($scope, $element, attrs, bbWizard) {
                bbWizard.addStep($scope);
            },
            controller: function($scope, $element){
                $scope.current = false;

                this.setTitle = function(title){
                    $scope.title = title;
                };

                this.setButtons = function(buttons){
                    $scope.buttons = buttons;
                };
            }
        };
    };

    return ['$rootScope', WizardStepDirective];
});

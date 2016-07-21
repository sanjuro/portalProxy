define([
    'angular'
], function(ng) {
    'use strict';

    var WizardStepTitleDirective = function() {
        return {
            restrict: 'EA',
            // scope: false,
            replace: false,
            scope: {
                'ngModel': '='
            },
            require: '^bbWizardStep',

            compile: function compile(tElement, tAttrs, transclude) {
                return {
                    pre: function($scope, $element, attrs, bbWizardStep) {
                        if ($scope.ngModel) {
                            bbWizardStep.setTitle($scope.ngModel);
                        } else {
                            bbWizardStep.setTitle($element.html());
                        }
                        $element.remove();
                    }
                };
            }
        };
    };

    return WizardStepTitleDirective;
});

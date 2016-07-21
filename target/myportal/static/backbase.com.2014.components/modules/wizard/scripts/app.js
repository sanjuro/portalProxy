/**
 *  ----------------------------------------------------------------
 *  Copyright © 2003/2014 Backbase B.V.
 *  ----------------------------------------------------------------
 *  Author : Backbase R&D - Amsterdam - New York
 *  Filename : app.js
 *  Description:
 *  Wizard component module
 *  
 *  Provides directives for including wizard into markup
 *
 *  Usage:
 *  <bb-wizard>
 *      <div class="modal-header">
 *          <button type="button" class="close" data-ng-click="cancel()">&times;</button>
 *          <h3>Title</h3>
 *          <ul class="breadcrumb">
 *              <li data-ng-repeat="step in steps" data-ng-class="{active: step.current}" data-ng-click="goTo(step)" data-ng-bind-html="step.title"></li>
 *          </ul>
 *      </div>
 *      <div class="modal-body">
 *          <bb-wizard-step>
 *              <div bb-wizard-step-title>Step 1</div>
 *              Content of step 1
 *          </bb-wizard-step>
 *          <bb-wizard-step>
 *              <div bb-wizard-step-title>Step 2</div>
 *              Content of step 2
 *          </bb-wizard-step>
 *      </div>
 *      <div class="modal-footer">
 *          <button class="btn btn-lg btn-success pull-right" data-ng-if="currentStep === steps[0]" data-ng-click="goTo(steps[1])">Go to step 2</button>
 *          <button class="btn btn-lg btn-success pull-right" data-ng-if="currentStep === steps[1]">Finish</button>
 *          <button class="btn btn-link" data-ng-click="cancel()">Cancel</button>
 *      </div>
 *  </bb-wizard>

 *  ----------------------------------------------------------------
 */
define([
    'angular',
    'backbase.com.2014.components/modules/wizard/scripts/wizard.dir',
    'backbase.com.2014.components/modules/wizard/scripts/wizard-step.dir',
    'backbase.com.2014.components/modules/wizard/scripts/wizard-step-title.dir'
], function (ng, WizardDirective, WizardStepDirective, WizardStepTitleDirective) {
    'use strict';

    var Wizard = ng.module('bbWizard', [])
        .directive('bbWizard', WizardDirective)
        .directive('bbWizardStep', WizardStepDirective)
        .directive('bbWizardStepTitle', WizardStepTitleDirective);

    return Wizard;
});
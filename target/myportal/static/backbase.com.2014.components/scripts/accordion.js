/**
 *  ----------------------------------------------------------------
 *  Copyright © 2003/2014 Backbase B.V.
 *  ----------------------------------------------------------------
 *  Author : Backbase R&D - Amsterdam - New York
 *  Filename : accordion.js
 *  Description:
 *
 *  Extended version of angular-bootstrap Accordion component, which supports lazy loading.
 *  <bb-accordion close-others="true">
 *      <bb-accordion-group ng-repeat="group in groups" heading="{{group.title}}" handler="loadAccordionData()">
 *          <ul class="z-cm-accordion-group">
 *              <!-- some data loaded by loadAccordionData scope method-->
 *          </ul>
 *      </bb-accordion-group>
 *  </bb-accordion>
 *
 *
 *  Using infinite-scroll module, accordion group may be paginated. To help that, accordion sets up ``loadData`` method in scope, which encloses "handler" method.
 *
 *  <bb-accordion close-others="true">
 *      <bb-accordion-group ng-repeat="group in groups" heading="{{group.title}}" handler="loadAccordionData()">
 *          <ul class="z-cm-accordion-group" data-infinite-scroll="loadData()" data-infinite-scroll-distance="1" data-infinite-scroll-immediate-check="false">
 *              <li ng-repeat="item in items">{{item}}</li>
 *          </ul>
 *      </bb-accordion-group>
 *  </bb-accordion>
 *  ----------------------------------------------------------------
 */

define([], function() {
    angular.module('template/bbAccordion/accordion-group.html', []).run(['$templateCache', function($templateCache) {
        $templateCache.put('template/bbAccordion/accordion-group.html',
            "<div class=\"panel panel-default\">\n" +
            "  <div class=\"panel-heading\">\n" +
            "    <h4 class=\"panel-title\">\n" +
            "      <a class=\"accordion-toggle\" ng-click=\"toggleGroup($event)\" bb-accordion-transclude=\"heading\">{{heading}}</a>\n" +
            "    </h4>\n" +
            "  </div>\n" +
            "  <div class=\"panel-collapse\" collapse=\"!isOpen\">\n" +
            "     <div class=\"panel-body\" ng-transclude></div>\n" +
            "  </div>\n" +
            "</div>");
    }]);

    angular.module("template/bbAccordion/accordion.html", []).run(["$templateCache", function($templateCache) {
        $templateCache.put("template/bbAccordion/accordion.html",
            "<div class=\"panel-group\" ng-transclude></div>");
    }]);

    angular.module('bbAccordion', ['ui.bootstrap.collapse', 'template/bbAccordion/accordion.html', 'template/bbAccordion/accordion-group.html'])
        .constant('accordionConfig', {
            closeOthers: true
        })

    .controller('bbAccordionController', ['$scope', '$attrs', 'accordionConfig', function($scope, $attrs, accordionConfig) {

        // This array keeps track of the accordion groups
        this.groups = [];

        // Ensure that all the groups in this accordion are closed, unless close-others explicitly says not to
        this.closeOthers = function(openGroup) {
            var closeOthers = angular.isDefined($attrs.closeOthers) ? $scope.$eval($attrs.closeOthers) : accordionConfig.closeOthers;
            if (closeOthers) {
                angular.forEach(this.groups, function(group) {
                    if (group !== openGroup) {
                        group.isOpen = false;
                    }
                });
            }
        };

        // This is called from the accordion-group directive to add itself to the accordion
        this.addGroup = function(groupScope) {
            var that = this;
            this.groups.push(groupScope);

            groupScope.$on('$destroy', function(event) {
                that.removeGroup(groupScope);
            });
        };

        // This is called from the accordion-group directive when to remove itself
        this.removeGroup = function(group) {
            var index = this.groups.indexOf(group);
            if (index !== -1) {
                this.groups.splice(this.groups.indexOf(group), 1);
            }
        };

    }])

    // The accordion directive simply sets up the directive controller
    // and adds an accordion CSS class to itself element.
    .directive('bbAccordion', function() {
        return {
            restrict: 'EA',
            controller: 'bbAccordionController',
            transclude: true,
            replace: false,
            templateUrl: 'template/bbAccordion/accordion.html'
        };
    })

    // The accordion-group directive indicates a block of html that will expand and collapse in an accordion
    .directive('bbAccordionGroup', ['$parse', '$timeout', function($parse, $timeout) {
        return {
            require: '^bbAccordion', // We need this directive to be inside an accordion
            restrict: 'EA',
            transclude: true, // It transcludes the contents of the directive into the template
            replace: true, // The element containing the directive will be replaced with the template
            templateUrl: 'template/bbAccordion/accordion-group.html',
            scope: {
                heading: '@'
            }, // Create an isolated scope and interpolate the heading attribute onto this scope
            controller: function() {
                this.setHeading = function(element) {
                    this.heading = element;
                };
            },
            link: function(scope, element, attrs, accordionCtrl) {
                var getIsOpen, setIsOpen, handler;

                accordionCtrl.addGroup(scope);

                scope.contentLoaded = false;
                scope.isOpen = false;

                if (attrs.handler) {
                    handler = $parse(attrs.handler);
                    scope.$parent.loadData = function(){
                        handler(scope.$parent).then(function(data){
                            angular.extend(scope.$parent, data);
                            scope.isLoaded = true;
                            $timeout(function(){
                                scope.isOpen = true;
                            }, 100);
                        });
                    };
                } else {
                    scope.isLoaded = true;
                }

                if (attrs.isOpen) {
                    getIsOpen = $parse(attrs.isOpen);
                    setIsOpen = getIsOpen.assign;

                    scope.$parent.$watch(getIsOpen, function(value) {
                        scope.isOpen = !!value;
                    });
                }

                scope.toggleGroup = function(evt){
                    if (!scope.isOpen && !scope.isLoaded) {
                        scope.$parent.loadData();
                    } else {
                        scope.isOpen = !scope.isOpen;
                    }
                };

                scope.$watch('isOpen', function(value) {
                    if (value) {
                        accordionCtrl.closeOthers(scope);
                    }
                    if (setIsOpen) {
                        setIsOpen(scope.$parent, value);
                    }
                });
            }
        };
    }])

    // Use accordion-heading below an accordion-group to provide a heading containing HTML
    // <accordion-group>
    //   <accordion-heading>Heading containing HTML - <img src="..."></accordion-heading>
    // </accordion-group>
    .directive('bbAccordionHeading', function() {
        return {
            restrict: 'EA',
            transclude: true, // Grab the contents to be used as the heading
            template: '', // In effect remove this element!
            replace: true,
            require: '^bbAccordionGroup',
            compile: function(element, attr, transclude) {
                return function link(scope, element, attr, accordionGroupCtrl) {
                    // Pass the heading to the accordion-group controller
                    // so that it can be transcluded into the right place in the template
                    // [The second parameter to transclude causes the elements to be cloned so that they work in ng-repeat]
                    accordionGroupCtrl.setHeading(transclude(scope, function() {}));
                };
            }
        };
    })

    // Use in the accordion-group template to indicate where you want the heading to be transcluded
    // You must provide the property on the accordion-group controller that will hold the transcluded element
    // <div class="accordion-group">
    //   <div class="accordion-heading" ><a ... accordion-transclude="heading">...</a></div>
    //   ...
    // </div>
    .directive('bbAccordionTransclude', function() {
        return {
            require: '^bbAccordionGroup',
            link: function(scope, element, attr, controller) {
                scope.$watch(function() {
                    return controller[attr.bbAccordionTransclude];
                }, function(heading) {
                    if (heading) {
                        element.html('');
                        element.append(heading);
                    }
                });
            }
        };
    });
});

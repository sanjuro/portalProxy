/**
 *  ----------------------------------------------------------------
 *  Copyright © 2003/2014 Backbase B.V.
 *  ----------------------------------------------------------------
 *  Author : Backbase R&D - Amsterdam - New York
 *  Filename : fileupload.dir.js
 *  Description:
 *
 *  Usage:
 *  <div data-bb-thumbnail="/path/to/existing/image.png" data-upload-path="/upload/path"></div>
 *
 *  ----------------------------------------------------------------
 */

define(function(require, exports, module) {

    'use strict';

    var config = require('zenith/core/config'),
        setScopeVariables = require('backbase.com.2014.components/modules/thumbnail/scripts/setScopeVariables'),
        staticPath = config.contextRoot + '/static/backbase.com.2014.components/modules/thumbnail/';

    var FileUpload =function($rootScope) {

        function linkFn ($scope, $element /*, $attrs*/) {

            var data = $element.data(),
                thumbnailUrl = data.bbThumbnail || $scope.ngModel,
                thumbnailSrc = thumbnailUrl && thumbnailUrl.replace('$(contextRoot)', config.contextRoot);

            $scope.uploadPath = data.uploadPath;

            setScopeVariables($scope, thumbnailUrl, thumbnailSrc);

            $rootScope.$on('bbThumbnail:changed', function(ev, value) {
                $scope.$apply(function(){
                    if( $scope.ngModel !== undefined ) { $scope.ngModel = value; }
                });
            });
        }


        return {
            restrict: 'A',
            scope: {
                ngModel: '='
            },
            terminal: false,
            require:'?ngModel',
            templateUrl: staticPath + 'templates/thumbnail.ng.html',
            link: linkFn
        };
    };

    exports.directives = {
        bbThumbnail:  [ '$rootScope',  FileUpload ]
    };
});

/**
 *  ----------------------------------------------------------------
 *  Copyright © 2003/2014 Backbase B.V.
 *  ----------------------------------------------------------------
 *  Author : Backbase R&D - Amsterdam - New York
 *  Filename : ImportPortalCtrl.js
 *  Description:
 *
 *  ----------------------------------------------------------------
 */


define(function (require) {

    'use strict';

    // var labels = require('i18n!zenith/widgets/CreatePortal/modules/import-portal/nls/labels'),
    var ThumbnailCtrl,
        labels = {
            EMPTY_TXT: 'Click or drag a thumbnail (280 x 180 px)',
            OVER_TXT: 'Drop Image here',
            REPLACE_TXT: 'Replace Image',
            UPLOAD_ERR: 'Could not upload'
        },

        config = require('zenith/core/config'),

        setScopeVariables = require('backbase.com.2014.components/modules/thumbnail/scripts/setScopeVariables'),

        UPLOAD_API_URL = config.contextRoot + '/bb-admin-api/resources',
        UPLOAD_PATH = 'static/uploads/';
    /**
     * [ThumbnailCtrl description]
     * @param $rootScope
     * @param $scope
     * @param $bbModal
     * @constructor
     */
    ThumbnailCtrl = function ($rootScope, $scope, $bbModal) {

        var uploadPath = $scope.uploadPath || UPLOAD_PATH,
            fileUploadConfig = {
                url: UPLOAD_API_URL,
                add: function (files, uploadFiles) {
                    var file = files[0],
                        formData = {    // set upload path and file name
                            name: uploadPath + file.name
                        };

                    uploadFiles(formData).then(function (response) {
                        setScopeVariables($scope, config.contextRoot + '/' + response, ('$(contextRoot)/' + response).replace('$(contextRoot)', config.contextRoot));

                        $rootScope.$emit('bbThumbnail:changed', $scope.thumbnailUrl);
                        $scope.$apply();

                    }, function () {
                        $bbModal.notify({
                            icon: 'error',
                            text: labels.UPLOAD_ERR + ' ' + file.name
                        });
                    });

                },

                // check ie uploader state
                checkIframeResponse: function (response) {
                    // console.log(response);
                    return response.indexOf('HTTP ERROR') === -1;
                }
            };


        $scope.labels = labels;
        $scope.fileUploadConfig = fileUploadConfig;

    };


    return ['$rootScope', '$scope', '$bbModal', ThumbnailCtrl];

});

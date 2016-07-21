/**
 *  ----------------------------------------------------------------
 *  Copyright © 2003/2014 Backbase B.V.
 *  ----------------------------------------------------------------
 *  Author : Backbase R&D - Amsterdam - New York
 *  Filename : fileupload.dir.js
 *  Description: fileUploadConfig - should be defined in the $scope of the directive
 *
 *  Usage:
 *  <div data-bb-fileupload="fileUploadConfig">...</div>
 *
 *  ----------------------------------------------------------------
 */

/* globals define */

define(function(require, exports, module) {

    'use strict';

    var Promise = require('zenith/promise');
    var ng = require('angular');
    var $ = require('jquery');
    var uploadFormTpl = require('tpl!backbase.com.2014.components/modules/fileupload/templates/uploadFormRenderer.html');

    var FileUpload =function(FileuploadSrv) {

        function linkFn ($scope, $element /*, $attrs*/) {

            var config = ng.extend({
                add: function(files, uploadFiles){
                    uploadFiles();
                },
                onLoad: function(){},
                fields: []

            }, $scope.bbFileupload );

            var $html = uploadFormTpl({
                url: config.url
            });


            // var $el = $element.after($html).next();
            // inject form to the body
            var $body = $element.closest('body');
            var $el = $body.find('.z-bb-fileupload-form');

            if(!$el.length){
                $el = $body.append($html).find('.z-bb-fileupload-form');
            }


            $element.wrap('<label for="z_bb_uploadFile" class="z-bb-fileupload-label" />').parent('label');

            var $field = $el.find('input[type="file"]'),
                $form = $el.find('form'),
                $iframe = $el.find('iframe');

            function getFiles (evt) {
                var event = evt.originalEvent;
                return event.dataTransfer && event.dataTransfer.files;
            }



            function addFiles(evt) {
                var uploadFiles,
                    files = getFiles(evt) || this.files;

                $element.removeClass('z-drag-over');

                if (!files && this.value){
                    files = [];
                    files.push({
                        name: this.value.replace(/^.*[\/\\]+([^\/\\]+)$/, '$1'),
                        value: this.value
                    });
                }

                // TODO: upload multiple files

                if(window.FormData){
                    uploadFiles = function(formData){
                        config.formData = formData;
                        return FileuploadSrv.uploadFiles(files, config);
                    };
                } else {
                    uploadFiles = function(formData){

                        var dfd = new Promise(),
                            s = '';

                        $.each(formData || {}, function(key, val){
                            s += '<input type="hidden" name="' + key + '" value="' + val + '"></input>';
                        });

                        if(s){
                            $form.append($(s));
                        }

                        $iframe.on('load', function(){
                            var iframeContent = '';
                            try {
                                iframeContent = $(this.contentDocument).text();

                                if(config.checkIframeResponse){
                                    if(!config.checkIframeResponse(iframeContent)){
                                        dfd.reject(iframeContent);
                                    }
                                }
                            }
                            catch (e) {
                                dfd.reject();
                            }
                            dfd.resolve(iframeContent);
                        });

                        try {
                            $form.submit();
                        }
                        catch (e) {
                        }

                        return dfd.promise();
                    };
                }

                if (files && files.length > 0) {
                    config.add(files, uploadFiles);
                }
                return false;
            }


            // Remove events before attach new ones, this directive is called each time the modal is open
            // The input is the same and received the events each time the directive is called.
            $field.off('change click');
            $field.on({
                change: addFiles,
                click: function (evt){
                    evt.stopPropagation();
                }
            });

            var timeout = setTimeout(function() {}, 10),
                removeClass = function(){
                    $element.removeClass('z-drag-over');
                };

            // Remove events before attach new ones, this directive is called each time the modal is open
            $element.off('drop dragenter dragover dragleave');
            $element.on({
                dragenter: function(evt) {
                    evt.stopPropagation();
                    evt.preventDefault();
                    $element.addClass('z-drag-over');

                    return false;
                },

                dragover: function(evt) {
                    evt.stopPropagation();
                    evt.preventDefault();
                    $element.addClass('z-drag-over');
                    window.clearTimeout(timeout);
                    return false;
                },

                dragleave: function(evt) {
                    evt.stopPropagation();
                    evt.preventDefault();

                    if (this === evt.target) {
                        // removeClass();
                        setTimeout(removeClass, 100);
                    }
                    timeout = setTimeout(removeClass, 500);
                    return false;
                },

                drop: addFiles
            });

            config.onLoad($element);
        }

        return {
            restrict: 'A',
            scope: {
                ngModel: '=',
                bbFileupload:'='
            },
            terminal: false,
            require: '?ngModel',
            link: linkFn
        };
    };

    exports.filters = {
    };

    exports.directives = {
        bbFileupload:  ['FileuploadSrv', FileUpload ]
    };
});

/* globals define */

define(function(require, exports, module) {

    'use strict';

    var $ = require('jquery');
    var http = require('zenith/http');
    var Promise = require('zenith/promise');

    var fileupload = function() {

        this.uploadFiles = function(files, config) {

            function uploadProgress(i) {
                return function(){
                    // get the native XmlHttpRequest object
                    var xhr = $.ajaxSettings.xhr();

                    // set the onprogress event handler
                    xhr.upload.onprogress = function onProgress(evt) {
                        if (evt.lengthComputable) {
                            var progress = Math.round(evt.loaded / evt.total * 100);

                            if(config.progress){
                                config.progress(progress, i, files[i]);
                            }
                        }
                    };
                    return xhr;
                };
            }

            /**
             * Add extra form fields
             * @param {[type]} fd [description]
             */
            // TODO test this / implement same for iframe
            function addFields(fd) {
                $.each(config.formData || [], function(name, value){
                    fd.append(name, value);
                });
                return fd;
            }

            var deferreds = [];

            for (var i = 0, l = files.length; i < l; i++) {

                var fd = new FormData();
                fd.append('file', files[i]);

                var httpConfig = {
                    type: 'POST',
                    url: config.url,
                    data: addFields(fd),
                    contentType: false,
                    xhr: uploadProgress(i)
                };

                if(config.progress){
                    httpConfig.xhr = uploadProgress(i);
                }

                var request = http(httpConfig);

                // deferreds.push(request);
                return request;
            }
            // TODO multiple uploads
            // return Promise.all(deferreds).then(function());
        };


    };

    return [fileupload];
});

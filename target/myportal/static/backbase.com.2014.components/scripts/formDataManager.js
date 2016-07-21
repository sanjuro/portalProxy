/**
 *  ----------------------------------------------------------------
 *  Copyright © 2003/2014 Backbase B.V.
 *  ----------------------------------------------------------------
 *  Author: Backbase R&D - Amsterdam - New York
 *  Filename: formDataManager.js (native drag&drop)
 *  Description: form upload manager. Receives files and/or input
 *  fields and sends the form to the server
 *
 *  Usage: var formDataManager = new FormDataManager({ ... options ... });
 *  ----------------------------------------------------------------
 */

define(function (require, exports, module) {

    'use strict';

    var cookie = require('zenith/utils/cookie');

    var _options = {
            url: '',
            type: 'POST',
            fileInputName: 'file',
            allowMultipleFiles: true
            // successCallback
            // errorCallback
        },
        FormDataManager = function(options) {
            if (!window.FormData) {
                return false;
            }
            this.reset();
            this.options = $.extend({}, _options);
            for (var option in options || {}) {
                this.options[option] = options[option];
            }
        },
        noop = function(){};

    /* ----------------  API -------------- */

    FormDataManager.prototype.reset = function(options) {
        this.formData = null;
    }

    FormDataManager.prototype.addItems = function(data) {
        var self = this,
            createFormDataIfAbsent = function() {
                if (!self.formData) {
                        self.formData = new window.FormData();
                }
            };

        if (data.files && data.files.length) { // files
            if (this.options.allowMultipleFiles) {
                for (var n = 0, m = data.files.length; n < m; n++) {
                    createFormDataIfAbsent();
                    this.formData.append(this.options.fileInputName, data.files[n]);
                }
            } else {
                this.formData = new window.FormData();
                this.formData.append(this.options.fileInputName, data.files[data.files.length - 1]);
            }
        } else { // input field(s)
            if (!$.isArray(data)) {
                data = [data]; // arrayfi
            }
            for (var n = 0, m = data.length; n < m; n++) {
                createFormDataIfAbsent();
                this.formData.append(data[n].name, data[n].value);
            }
        }
    };

    FormDataManager.prototype.isEmpty = function() {
        return !this.formData;
    };

    FormDataManager.prototype.sendForm = function(sucess, error) {
        var options = this.options,
            headers = {};

        if (options.type === 'POST' || options.type === 'PUT' || options.type === 'DELETE') {
            headers.bbCSRF = cookie.getCookie('bbCSRF');
        }

        $.ajax({
            url: options.url,
            type: options.type,
            headers: headers,
            data: this.formData,
            processData: false,
            contentType: false
        }).
        done(sucess || options.successCallback || noop).
        fail(error || options.errorCallback || noop);

        this.reset();
    };

    /* ----------------  EXPOSE -------------- */
    
    exports.FormDataManager = FormDataManager;
});
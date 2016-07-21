/**
 *  ----------------------------------------------------------------
 *  Copyright © 2003/2014 Backbase B.V.
 *  ----------------------------------------------------------------
 *  Author: Backbase R&D - Amsterdam - New York
 *  Filename: filePicker.js
 *  Description: enables a click event for possible file drop zone
 *      for fallback situation of single file upload. On click the
 *      'open file' dialog comes up and an <input type="file" />
 *      gets created. onchange calls openCallback...
 *
 *  Usage: var filePicker = new FilePicker({ ... options ... });
 *      <div data-ndnd="dropZone"></div>
 *
 *      See this.options inside Fileupload for further explanations.
 *  ----------------------------------------------------------------
 */

// define('filePicker', ['jquery'], function ($) {
define(function (require, exports, module) {

    'use strict';

    var $ = window.jQuery;

    var cookie = require('zenith/utils/cookie');

    var _instance, // this will hold the current instance on initialize, dragenter and dragstart

        FilePicker = function(options){
            this.options = { // shared options for FilePicker and ndnd...
                /* -------- options mostly for ndnd --------- */
                // following will end up as $canvas, $dropZone and $dragElements
                $canvas: $('body'), // initial canvas for dnd;  // element, selector-text or jQuery()
                $dropZone: $('[data-ndnd="dropZone"]'), // initial dnd dropZone (file upload wrapper) // element, selector-text or jQuery()

                /* -------- options for FilePicker --------- */
                inputName: 'ndndFile', // name of added file-input-field
                uploadUrl: 'test.php',
                immediateUpload: true,
                detachedForm: true,

                dragenterClass: 'dragenter', // className for dropZone on enter (if ndnd.js installed)
                fileTriggerClass: 'file-trigger', // className for fake file-button
                fileTriggeredClass: 'file-triggered', // className for submit button
                fileDisplayClass: 'file-display', // className for DIV showing file name
                inputLabelClass: 'input-trigger-label', // label to trigger hidden input field
                dropClass: 'drop'

                // openCallback: function(e){...}, // this as _instance
                // completeCallback
                // responseCallback // if you know what to expect from respone...
            };
            initialize(this, options || {});
        },
        initialize = function(This, options) {
            for (var option in options) {
                if ('canvas dropZone dragElements uploadForm'.indexOf(option) !== -1) {
                    This.options['$' + option] = $(options[option]);
                } else {
                    This.options[option] = options[option];
                }
            }

            _instance = This;

            installManualUpload(This);
        },
        installManualUpload = function(This) { // simple version (only one file)
            var options = This.options,
                $dropZone = options.$dropZone,
                $form = $dropZone.closest('form'),
                $enriched, $fileInput,
                formTemplate = '<div data-container="">' +
                    '<label for="{{uuid}}-file" class="' + options.inputLabelClass + '">' +
                    '<input type="file" id="{{uuid}}-file" name="' + options.inputName + '" /></label>' +
                    '<div data-ndnd="file-display" id="{{uuid}}-file-display" class="' +
                    options.fileDisplayClass + '"></div></div>';

            $dropZone. // addClass(options.fileTriggerClass).
                each(function(idx, elm) {
                    $enriched = $(formTemplate.replace(/{{uuid}}/g, createUUID()));
                    $(elm).append($enriched);
                });

            // event listeners (change / click)
            options.$canvas.on('change', 'input[name="' + options.inputName + '"]', function(e) {
                var event = e.originalEvent || e,
                    id = this.id,
                    $label = $(options.$dropZone.selector).find('label[for="' + id + '"]'),
                    // $elm = $(this).closest(options.$dropZone.selector), // not working if outside form
                    $dropZone = $label.closest(options.$dropZone.selector), // dropZone
                    fileName = extractFileName(this.value),
                    $enriched = $dropZone.find('div[data-container]');

                $dropZone.removeClass(options.dragenterClass).addClass(options.dropClass).
                    find('div[data-ndnd="file-display"]').text(fileName);
                _instance.$submitButton = $form.find('input[type="submit"]').addClass(options.fileTriggeredClass);

                if (!$dropZone.closest('form').length) { // ceate form if necessary
                    $form = $enriched.wrap('<form data-ndnd=""></form>').closest('form');
                } else if (options.detachedForm && !_instance.$detachedForm) { // put outside existing form...
                    $fileInput = $enriched.find('input[type="file"]');
                    $form = $('<form data-ndnd=""></form>').append($fileInput);
                    $('body').append($form);
                    _instance.$detachedForm = $form;
                }
                $form.css('display', 'none');

                setCSRFToken($form);
                
                if (!_instance.$iFrame) {
                    enrichForm($form, This);
                }

                _instance = This;
                if (options.openCallback) {
                   options.openCallback.call(_instance, event);
                }

                if (options.immediateUpload) {
                    $form.on('submit', function() {
                        _instance.cleanup();
                    })[0].submit();

                }
            });
            // options.$canvas.on('click', options.$dropZone.selector, function(e) {
            //     // add more input fields for multiple file upload
            // });
        };

    /* ----------------  API -------------- */

    FilePicker.prototype.cleanup = function() {
        _instance = this;
        cleanupForm();
    };

    FilePicker.prototype.removeDetachedForm = function() {
        _instance = this;
        removeDetachedForm();
    };

    FilePicker.prototype.destroy = function() {
        this.options.$canvas.off('change', 'input[name="' + this.options.inputName + '"]');
        cleanupForm();
        for (var option in this.options) {
            delete this.options[option];
        }
        for (var element in this) {
            delete this[element];
        }
    };

    FilePicker.prototype.reset = function(options) {
        for (var option in options) {
            if ('canvas dropZone dragElements uploadForm'.indexOf(option) !== -1) {
                this.options['$' + option] = $(options[option]);
            } else {
                this.options[option] = options[option];
            }
        }

        _instance = this;
    };

    /* ----------------  private -------------- */

    function enrichForm($form, This) { // and append iFrame for file transfer
        var iFrameTemplate = '<iframe frameborder="0" class="upload-helper-iframe" ' +
                'name="uploadHelperIFrame" id="uploadHelperIFrame" style="display: none"></iframe>';

        _instance.$iFrame = $(iFrameTemplate);
        // _instance.$form = $form;

        // save original attributes for cleanup
        _instance.iFrameOriginalAttributes = {};
        $($form[0].attributes).each(function(idx, elm) {
            _instance.iFrameOriginalAttributes[elm.name] = elm.value;
        });

        _instance.iFrameAdditinalAttributes = {
            action: _instance.options.uploadUrl,
            method: 'post',
            // encoding: 'multipart/form-data',
            enctype: 'multipart/form-data',
            target: 'uploadHelperIFrame'// ,
            // file: input.value
        };


        _instance.$iFrame.one('load', function() {

            $form.find('iframe').one('load', function() {
                var doc = this.contentWindow ? this.contentWindow.document :
                        (this.contentDocument || this.document);

                if (_instance.options.responseCallback) {
                    _instance.options.responseCallback.call(_instance, doc);
                }

                $form.find('iframe').one('load', function() {
                    cleanupForm();
                    $form.find('iframe').remove();
                }).attr('src', 'javascript:false;');
                cleanupForm();
            });
        });

        $form.attr(_instance.iFrameAdditinalAttributes).append(_instance.$iFrame);
        return $form;
    }


    function removeDetachedForm() {
        var $input, id, $label;

        if (_instance.$detachedForm) {
            $input = _instance.$detachedForm.find('input');
            id = $input.attr('id');
            $label = _instance.options.$dropZone.find('label[for="' + id + '"]');
            $label.append($input);
            _instance.$detachedForm.remove();
            delete _instance.$detachedForm;
            delete _instance.$iFrame;
        }
    }

    function cleanupForm() {
        var options = _instance.options,
            $dropZone = options.$dropZone,
            $form = $dropZone.closest('form'),
            item;

        // $form.find('iframe').remove();
        $form.off();

        if (_instance.$iFrame) {
            for (item in _instance.iFrameAdditinalAttributes) {
                $form.removeAttr(item);
            }
            for (item in _instance.iFrameOriginalAttributes) {
                $form.attr(item, _instance.iFrameOriginalAttributes[item]);
            }

            _instance.$submitButton.removeClass(options.fileTriggeredClass);
            $dropZone.removeClass(options.dragenterClass).removeClass(options.dropClass).
                find('div[data-ndnd="file-display"]').text('');

            $form.attr('target', '').attr('file', '');

            removeDetachedForm();

            for (item in _instance) { // cleanup _instance
                if (item !== 'options') {
                    delete _instance[item];
                }
            }
        }
    }

    function setCSRFToken($form) {
        var $csrfTokenInput = $("input[name='bbCSRF']", $form);
        if (!$csrfTokenInput.length) {
            $csrfTokenInput = $('<input type="hidden" name="bbCSRF" />');
            $csrfTokenInput.appendTo($form);
        }
        $csrfTokenInput.val(cookie.getCookie('bbCSRF'));
    }


    /* ----------------  EXPOSE -------------- */

    // return FilePicker;
    exports.FilePicker = FilePicker;

    /* ----------------  tools -------------- */

    function extractFileName(name) {
        name = name.split(/(?:\/|\\)/);

        return name[name.length - 1];
    }

    function createUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16|0,
                v = c === 'x' ? r : (r&0x3|0x8);
                return v.toString(16);
            });
    }
});

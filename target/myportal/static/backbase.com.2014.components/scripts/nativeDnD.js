/* globals $ */
/**
 *  ----------------------------------------------------------------
 *  Copyright © 2003/2014 Backbase B.V.
 *  ----------------------------------------------------------------
 *  Author: Backbase R&D - Amsterdam - New York
 *  Filename: nativeDnD.js (native drag&drop)
 *  Description: drag and drop management for dropping files on a
 *  drop zone (to be uploaded later)
 *  The manager adds/removes classNames according to DnD actions..
 *
 *  Usage: var nativeDnD = new NativeDnD({ ... options ... });
 *      <div data-nativeDnD="dropZone"></div>
 *
 *      See this.options inside NativeDnD for further explanations.
 *  ----------------------------------------------------------------
 */

define(function (require, exports, module) {

    'use strict';

    var console = window.console || {log: function(){/* noop */}},

        _instance, // this will hold the current instance on initialize, dragenter and dragstart
        _options = {
            // following will end up as $canvas, $dropZone and $dragElements
            $canvas: $('body'), // initial canvas;  // element, selector-text or jQuery()
            $dropZone: $('[data-ndnd="dropZone"]'), // initial dropZone // element, selector-text or jQuery()
            $dragElements: $('[data-ndnd="dragElement"]'), // initial dropZone // element, selector-text or jQuery()

            allowInBrowserDragging: false, // allow DnD of items inside the browser
            allowText: false, // allow text being dragged and dropped (not possible if allowInBrowserDragging === false)
            isActive: true,

            dragenterClass: 'dragenter', // className for dropZone on enter
            dragstartClass: 'dragstart', // className for dropZone on start
            dragoverClass: 'dragover', // className for dropZone on drag over
            dropClass: 'drop', // className for dropZone on drop

            // fileTriggerClass: 'file-trigger', // className for fake file-button
            // fileTriggeredClass: 'file-triggered', // className for submit button
            fileDisplayClass: 'file-display', // className for DIV showing file name

            dragstartCallback: undefined, // function(e){...}, // this as _instance
            overCallback: undefined, // happens as expected in mouseover, so only every new over element
            dropCallback: undefined, // function(e){...} // this as _instance
            leaveWindowCallback: undefined, // ...
            beforeDropCallback: undefined
        },

        NativeDnD = function(options) {
            this.options = _options;
            initialize(this, options || {});
        },
        initialize = function(This, options) {
            for (var option in options) {
                if ('canvas dropZone dragElements'.indexOf(option) !== -1) {
                    This.options['$' + option] = $(options[option]);
                } else {
                    This.options[option] = options[option];
                }
            }

            _instance = This;
            installEvents(This);
        },
        installEvents = function(This, off) {
            var onOff = off ? 'off' : 'on';

            if (typeof window.ondrop !== 'undefined') {
                This.options.$canvas[onOff]('dragenter', function(e) {
                        if (!This.options.isActive) return false;
                        _instance = This;
                        dragenterHandler(e);
                    })
                    [onOff]('dragstart', This.options.$dragElements.selector || This.options.$dragElements, function (e) {

                        if (!This.options.isActive) return false;
                        _instance = This;
                        dragstartHandler(e);
                    })
                    [onOff]('dragover', dragoverHandler)
                    [onOff]('drop', This.options.$dropZone.selector, dropHandler)
                    [onOff]('dragleave', dragleaveHandler);
            }
        };

    /* ----------------  API -------------- */

    NativeDnD.prototype.cleanup = function() {
        this.options.$dropZone.
            // removeClass(this.options.dragstartClass).
            removeClass(this.options.dragenterClass).
            removeClass(this.options.dropClass).
            find('.' + this.options.fileDisplayClass).text('');
    };

    NativeDnD.prototype.destroy = function() {
        this.cleanup();
        installEvents(this, true);
        for (var item in this) {
            delete this[item];
        }
    };

    NativeDnD.prototype.setActivity = function(onOff) {
        this.options.isActive = !!onOff;
    };

    NativeDnD.prototype.reset = function(options) {
        this.options = _options;
        installEvents(this, true); // uninstall
        initialize(this, options || {});
    };

    /* ----------------  EXPOSE -------------- */

    exports.NativeDnD = NativeDnD;

    /* ----------------  event handlers -------------- */

    function dragstartHandler(e) {
        var options = _instance.options;

        _instance.cachedElement = undefined;
        if (options.dragstartCallback) {
            options.dragstartCallback.call(_instance, e.originalEvent || e);
        }
    }

    function dragenterHandler(e) {
        var event = e.originalEvent || e,
            options = _instance.options,
            $currentDropZone;

        options.$dropZone.removeClass(options.dropClass);
        _instance.cachedElement = undefined;
        if (checkIfValidElement(event)) {
            $currentDropZone = $(event.target).closest(options.$dropZone);
            if ($currentDropZone.length) {
                $currentDropZone.addClass(options.dragenterClass);
            } else {
                options.$dropZone.addClass(options.dragstartClass).removeClass(options.dragenterClass);
            }
        }
    }

    function dragoverHandler(e) { // happens with every mouse move
        var event = e.originalEvent || e,
            options = _instance.options,
            callbackPossible = false,
            $currentDropZone;

        if (!_instance.options.isActive) return false;
        // .closest() might be heavy, so we should cache jQuery collection
        if (_instance.cachedElement === event.target) {
            $currentDropZone = _instance.$cachedElement;
        } else {
            $currentDropZone = _instance.$cachedElement = $(event.target).closest(options.$dropZone);
            callbackPossible = true;
        }
        _instance.cachedElement = event.target;


        if (!$currentDropZone.length || !checkIfValidElement(event)) {
            showCancelDrop(event);
        }
        cancelEvent(event);

        if (callbackPossible && options.overCallback) {
            options.overCallback.call(_instance, event);
        }
    }

    function dragleaveHandler(e) {
        var event = e.originalEvent;

        if (!_instance.options.isActive) return false;
        // might not work over position: fixed elements...
        if (event.layerX <= 0 && event.layerY <= 0 && _instance.options.leaveWindowCallback) {
            _instance.cachedElement = undefined;
            _instance.options.leaveWindowCallback.call(_instance, event);
        }
    }

    function dropHandler(e) {
        var event = e.originalEvent || e,
            files = event.dataTransfer.files || event.target.files,
            postFix, fileName = '', fileNames = [],
            options = _instance.options,
            $currentDropZone = $(event.target).closest(options.$dropZone);

        if (!_instance.options.isActive) return false;
        if ($currentDropZone.length) {
            if (options.beforeDropCallback) {
                options.beforeDropCallback.call(_instance, event);
            }
            cancelEvent(event);
            $currentDropZone.removeClass(options.dragenterClass).addClass(options.dropClass);

            for (var n = 0, m = files.length; n < m; n++) {
                if (files[n].size === 0) {
                    console.log('uploading files with file-size 0 is not allowed');
                } else {
                    fileName = extractFileName(files[n].name);
                    if (!files[n].type) {
                        postFix = fileName.split('.');
                        postFix = postFix[postFix.length - 1];
                    }
                    // do something here...
                    fileNames.push(fileName);
                }
            }
            // add file names in div
            $currentDropZone.find('.' + options.fileDisplayClass).text(fileNames.join(', '));
            if (options.dropCallback) {
                options.dropCallback.call(_instance, event);
            }
        }
    }

    /* ----------------  tools -------------- */

    function extractFileName(name) {
        name = name.split(/(?:\/|\\)/);

        return name[name.length - 1];
    }

    function checkIfValidElement(event) {
        var options = _instance.options;

        return ($.inArray('Files', event.dataTransfer.types) > -1) ||
            (options.allowText === true || event.dataTransfer.types.length !== 0 &&
                [].join.call(event.dataTransfer.types, '').indexOf('text') === -1) ||
            options.allowInBrowserDragging === true;
    }

    function cancelEvent(event) {
        event.preventDefault();
        event.stopPropagation();
    }

    function showCancelDrop(event) {
        //effectAllowed property fires exception in IE
        try {
            event.dataTransfer.effectAllowed = 'none';
        } catch (e) {}

        event.dataTransfer.dropEffect = 'none';
    }
});

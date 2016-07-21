/**
 *  ----------------------------------------------------------------
 *  Copyright © 2003/2014 Backbase B.V.
 *  ----------------------------------------------------------------
 *  Author : Backbase R&D - Amsterdam - New York
 *  Filename : slider.dir.js
 *  Description: D&D component that just translates pointer gestures into D&D.
 *
 *  Listens to pointerdown (mouse, touch,...). If so, it starts drag
 *  detection, at the same time initializeDrag callback is executed and
 *  pointermove and pointerup event listeners get installed. There is also
 *  a bit of pre-calculations going on for the target (height, width, mousepos, ...)
 *  If dragOffset then exceeds its value (in pixels) startDrag callback
 *  gets fired once and doDrag callback starts constantly being executed
 *  on pointermove until pointerup happens, stopDrag gets executed and
 *  pointermove and pointerup event listeners get de-installed.
 *  You can use the callbacks (that are transporting a lot of usefull information
 *  stored in the second argument) to either do something or fire
 *  your own events like 'dragStart', 'dragging', etc.
 *  ----------------------------------------------------------------
 */
;(function (window, exports, undefined) {
    "use strict";

    var DnD,
        _dragDrop = {},
        _this;

    /* ---------------- common helpers -------------------- */

    function getOrigin(elm) {
        var box = (elm.getBoundingClientRect) ? elm.getBoundingClientRect() : {top: 0, left: 0},
            doc = elm && elm.ownerDocument,
            body = doc.body,
            win = doc.defaultView || doc.parentWindow || window,
            docElem = doc.documentElement || body.parentNode,
            clientTop = docElem.clientTop || body.clientTop || 0, // border on html or body or both
            clientLeft = docElem.clientLeft || body.clientLeft || 0;

        return {
            left: box.left + (win.pageXOffset || docElem.scrollLeft) - clientLeft,
            top: box.top + (win.pageYOffset || docElem.scrollTop) - clientTop
        };
    }

    function preventDefault(e) {
        e.returnValue = e.preventDefault ? e.preventDefault() : false;
        return false;
    }

    function addEvent(obj, type, func) {
        if (!addEvent.cache) {
            addEvent.cache = {
                _get: function (obj, type, func, checkOnly) {
                    var cache = addEvent.cache[type] || [],
                        n = cache.length;

                    while (n--) {
                        if (obj === cache[n].obj && String(func) === String(cache[n].func)) {
                            func = cache[n].func;
                            if (!checkOnly) {
                                cache[n] = cache[n].obj = cache[n].func = null;
                                cache.splice(n, 1);
                            }
                            return func;
                        }
                    }
                },
                _set: function (obj, type, func) {
                    var cache = addEvent.cache[type],
                        result;
                    if (!cache) {
                        cache = addEvent.cache[type] || [];
                    }

                    if (addEvent.cache._get(obj, type, func, true)) {
                        result = true;
                    } else {
                        cache.push({
                            func: func,
                            obj: obj
                        });
                    }
                    return result;
                }
            };
        }

        if (!func.name && addEvent.cache._set(obj, type, func)) {
            return;
        }

        if (obj.addEventListener) {
            obj.addEventListener(type, func, false);
        } else {
            obj.attachEvent("on" + type, func);
        }
    }

    function removeEvent(obj, type, func) {
        if (!func.name) {
            func = addEvent.cache._get(obj, type, func) || func;
        }

        if (obj.removeEventListener) {
            obj.removeEventListener(type, func, false);
        } else {
            obj.detachEvent("on" + type, func);
        }
    }

    /* ------------------ _ private ------------------- */

    function downHandler(event, foundTarget, __this) {
        var e = event || window.event,
            isTarget = foundTarget.tagName,
            options = __this.options;

        _this = __this;
        _dragDrop = { // can we help out more here?
            delayState: 0,
            context: __this,
            target: foundTarget,
            targetOrigin: isTarget ? getOrigin(foundTarget) : undefined,
            pageX: e.pageX,
            pageY: e.pageY,
            dragOffset: {x: 0, y: 0},
            offsetLeft: isTarget ? foundTarget.offsetLeft : undefined,
            offsetTop: isTarget ? foundTarget.offsetTop : undefined,
            offsetWidth: isTarget ? foundTarget.offsetWidth : undefined,
            offsetHeight: isTarget ? foundTarget.offsetHeight : undefined
        };

        addEvent(options.dragCanvas, options.pointermove, moveHandler);
        addEvent(options.dragCanvas, options.pointerup, upHandler);
    }

    function doEventHandlers(_this, off) {
        var onOff = off ? removeEvent : addEvent,
            options = _this.options;

        onOff(options.startCanvas, options.pointerdown, function (event) {

            var e = event || window.event,
                button = e.button !== undefined ?
                        (window.ActiveXObject && !window.Performance ? e.button - 1 : e.button) :
                        options.button,
                foundTarget = _this.callbacks.initializeDrag ?
                        _this.callbacks.initializeDrag(e, _this) : undefined;
            if (foundTarget && button === options.button) {
                downHandler(e, foundTarget, _this);
                return preventDefault(e);
            }
        });
    }

    function initializeDnD(_this, options) {
        var option;
        for (option in options) {
            if (/^\b\D+\S*Drag$/.test(option)) {
                _this.callbacks[option] = options[option];
            } else {
                _this.options[option] = options[option];
            }
        }
        doEventHandlers(_this);
    }

    function upHandler(event) {
        var e = event || window.event,
            options = _this.options;

        removeEvent(options.dragCanvas, options.pointermove, moveHandler);
        removeEvent(options.dragCanvas, options.pointerup, upHandler);

        if (_this.callbacks.stopDrag && _this.callbacks.doDrag) {
            _this.callbacks.stopDrag(e, _dragDrop);
        }
    }

    function moveHandler(event) {
        var e = event || window.event,
            dragDrop = _dragDrop,
            callbacks = _this.callbacks,
            options = _this.options;

        if (dragDrop.delayState || (
                Math.abs(e.pageX - dragDrop.pageX) >= options.dragOffset ||
                Math.abs(e.pageY - dragDrop.pageY) >= options.dragOffset
            )) {

            if (dragDrop.delayState === 0) {
                dragDrop.delayState = 1;
                if (callbacks.startDrag) {
                    _dragDrop.dragOffset = {x: e.pageX - dragDrop.pageX, y: e.pageY - dragDrop.pageY};
                    callbacks.startDrag(e, dragDrop);
                }
            }

            if (callbacks.doDrag) {
                callbacks.doDrag(e, dragDrop);
            } else {
                upHandler(e);
            }
        }
    }

    DnD = function (options) {
        this.callbacks = {
            // initializeDrag
            // startDrag
            // doDrag
            // stopDrag
        };
        this.options = {
            startCanvas: window,
            dragCanvas: window,
            dragOffset: 10,
            button: 0,

            pointerdown: 'mousedown',
            pointermove: 'mousemove',
            pointerup: 'mouseup'
        };

        initializeDnD(this, options);
    };
    DnD.getOrigin = getOrigin;
    DnD.addEvent = addEvent;
    DnD.removeEvent = removeEvent;
    /* -------------------- export -------------------- */

    if (window.define && window.define.amd) {
        window.define('backbase.com.2014.components/scripts/DnD', function () {
            return DnD;
        });
    } else {
        exports.DnD = DnD;
    }

}(window, window));
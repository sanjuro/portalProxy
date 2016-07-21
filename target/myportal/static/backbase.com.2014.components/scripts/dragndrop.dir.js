define([
    ''
], function($) {
    'use strict';

    return function() {
        return {
            link: function(scope, $element, attrs) {
                var dragCache = {
                    treeElm: {},
                    canvas: {},
                    isDragging: false
                },

                dragStartCallback = function(e, elm, node, offset, elmOrigin, _this) {
                    var dragSymbol = dragCache.dragSymbol,
                        dragSymbolStyle = dragCache.dragSymbolStyle,
                        dragCanvas = dragCache.canvas.element = document.querySelector('.bp-widget-body');

                    if (!dragSymbol) {
                        dragSymbol = dragCache.dragSymbol = dragCanvas.appendChild(document.createElement('div'));
                        dragSymbolStyle = dragCache.dragSymbolStyle = dragSymbol.style;
                    }

                    dragCache.canvas.offset = BBTree.getOrigin(dragCanvas);
                    dragCache.canvas.width = dragCache.canvas.element.offsetWidth;

                    dragSymbol.innerHTML = elm.innerHTML;
                    dragSymbol.className = 'bc-drag-helper ' + elm.parentNode.className;
                    dragSymbolStyle.cssText = 'height:' + elm.offsetHeight + 'px;display: inline-block;';
                    dragCache.dragSymbolWidth = dragSymbol.offsetWidth;
                    dragCache.canvas.max = dragCache.canvas.width + dragCache.canvas.offset.left - dragCache.dragSymbolWidth - 20;
                    BBTree.addEvent(document.querySelector('.z-cm-canvas'), 'mouseover', detectHover);
                    dragCache.isDragging = true;
                    prepareTreeItemsDetection(elm);
                },
                dragCallback = function(e, elm, node, _this) {
                    var rightBorder = e.pageX > (dragCache.canvas.max);

                    dragCache.dragSymbolStyle.left = (e.pageX + 10 - dragCache.canvas.offset.left -
                        (rightBorder ? dragCache.dragSymbolWidth : 0)) + 'px';
                    dragCache.dragSymbolStyle.top = (e.pageY + 10 - dragCache.canvas.offset.top) + 'px';
                    detectTreeItems(e.pageY);
                },
                dropCallback = function(e, elm, node, elmOrigin, _this) {
                    // cleanup all things that we needed for dragging
                    // 
                    window.clearTimeout(dragCache.autoOpenTimer);
                    if (dragCache.canvas.current) dragCache.canvas.current.style.outline = '';
                    BBTree.removeEvent(document.querySelector('.z-cm-canvas'), 'mouseover', detectHover);
                    BBTree.removeClass(dragCache.treeElm.prevElement, 'bc-dragdrop-' + dragCache.treeElm.pos);
                    dragCache.isDragging = false;

                    if (checkDropSuccess(e, elm, node, elmOrigin, _this)) {
                        dragCache.dragSymbolStyle.cssText = '';
                    }
                },
                appendCallback = function(elm, jumper, _this, scope, fetchData) { // cleanup: scope, fetchData not good here
                    if (dragCache.isDragging) {
                        prepareTreeItemsDetection(elm);
                        initAutoOpenFolders(elm, _this, scope, fetchData);
                    }
                },

                // ----------------------------
                checkIfDropTarget = function(elm) {
                    return  (elm.className && elm.className.indexOf('z-cm-item') !== -1) || // canvas // !/(?:^|\b)z-cm-item(?:\s*|$)/.test(className)
                            (elm.parentNode && elm.parentNode.className && elm.parentNode.className.indexOf('tree-folder') !== -1) || // tree
                            elm === document.querySelector('.z-cm-canvas');
                },
                checkDropSuccess = function(e, elm, node, elmOrigin, _this) {
                    var target = e.target,
                        top = document.body;

                    while (target.parentNode && !checkIfDropTarget(target) && target !== top) {
                        target = target.parentNode;
                    }
                    if (target === top || target === document) {
                        dropFailed(elm);
                    } else {
                        console.log('Dropped: ', elm, ' successfuly on ', target);
                        return true;
                    }
                },
                dropFailed = function (elm) { // make more generic to use for drop success...
                    var origin = BBTree.getOrigin(elm);

                    BBTree.doAnimation(dragCache.dragSymbolStyle,
                        [   {type: 'left', unit: 'px', start: +dragCache.dragSymbolStyle.left.replace('px', ''),
                                end: origin.left}, // - dragCache.canvas.offset.left
                            {type: 'top', unit: 'px', start: +dragCache.dragSymbolStyle.top.replace('px', ''),
                                end: origin.top - dragCache.canvas.offset.top}],
                        BBTree.doAnimation.timer(true),
                        500,
                        function(n) {return -(--n * n * n * n - 1);},
                        function(elmStyle, css) {
                            dragCache.dragSymbolStyle.cssText = '';
                        }
                    );
                },

                // -------- Canvas D&D only
                detectHover = function(event) { // drag detection
                    var elm = event.target;

                    window.clearTimeout(dragCache.autoOpenTimer); // take care of this... spagetti all bolognese

                    while (!checkIfDropTarget(elm) && elm !== this) {
                        elm = elm.parentNode;
                    }
                    if (dragCache.canvas.current !== elm) {
                        highlightCanvasItems(elm, this);
                        dragCache.canvas.current = elm;
                        event.stopPropagation();
                    }
                },
                highlightCanvasItems = function(elm, root) {
                        if (dragCache.canvas.current) {
                            dragCache.canvas.current.style.outline = '';
                        }
                        if (elm !== root) {
                            elm.style.outline = '3px solid rgba(50, 50, 50, .2)';
                        }
                },

                // -------- Tree D&D only
                prepareTreeItemsDetection = function(elm) {
                    var isDropTarget = checkIfDropTarget(elm),
                        height = elm.offsetHeight,
                        top = BBTree.getOrigin(elm).top,
                        cache = dragCache.treeElm = {
                            element: elm,
                            top: top,
                            height: height,
                            topLimit: top + (height / (isDropTarget ? 4 : 2)),
                            bottomLimit: top + height - (height / (isDropTarget ? 4 : 2)),
                            prevElement: dragCache.treeElm.prevElement || null,
                            pos: dragCache.treeElm.pos || null
                        };

                    if (!dragCache.treeHighlight) {
                        dragCache.treeHighlight = elm.appendChild(document.createElement('div'));
                        dragCache.treeHighlight.className = 'bc-tree-dorp-highlight';
                    } else {
                        elm.appendChild(dragCache.treeHighlight);
                    }
                },
                detectTreeItems = function(y) {
                    var cache = dragCache.treeElm,
                        pos = y <= cache.topLimit ? 'top' : y > cache.bottomLimit ? 'bottom' : 'middle';

                    if (pos !== cache.pos) {
                        highlightTreeItems(cache, pos);
                        cache.prevElement = cache.element;
                        cache.pos = pos;
                    }
                },
                highlightTreeItems = function(cache, pos) {
                    BBTree.removeClass(cache.prevElement, 'bc-dragdrop-' + cache.pos);
                    BBTree.addClass(cache.element, 'bc-dragdrop-' + pos);
                },
                initAutoOpenFolders = function(elm, _this, scope, fetchData) { // cleanup: scope, fetchData not good here
                    window.clearTimeout(dragCache.autoOpenTimer);
                    if (checkIfDropTarget(elm)) {
                        dragCache.autoOpenTimer = window.setTimeout(function() {
                            var node = _this.treeIndex[elm.getAttribute('data-uuid')].model;
                            if (node.children && !node.children.length) {
                                fetchData(node, elm, _this);
                            } else {
                                _this.selectNode(node.uuid, true);
                                _this.toggleNode(node.uuid, false,true);
                                scope.$emit('dataLoad', node); // doesn't do anything here...
                            }
                        }, 1000);
                    }
                };
            }
        };
    };
});
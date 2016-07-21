;(function(window, exporter, undefined) {
    "use strict";

    /**
     * Klass of tree (see model of instance in debugger)
     * @param {HTMLElement} treeRoot The UL that will be the root of the tree
     * @param {Object} options  An object holding all the options and callbacks (described iside the object itself)
     */
    var BBTree = function(treeRoot, options) {
            this.elements = { // cache for relevent HTMLElements
                tree: treeRoot,
                jumper: treeRoot.querySelector('.' + options.jumperID) || options.jumperID || 'bc-tree-jumper',
                toggle: treeRoot.querySelector('.' + options.toggleID) || options.toggleID || 'bc-tree-opener'
            };

            this.options = {
                exclude: options.exclude || function (model){ return model; },
                classPrefix: 'bc-tree-', // LIs get bc-tree-folder/image/... className
                selectedClassName: 'bc-tree-selected',
                collapsedClassName: 'bc-tree-closed',
                openedClassName: 'bc-tree-open',
                loadingClassName: 'bc-tree-loading', // className of LI if branch gets loaded
                jumperContainerClassName: 'bc-tree-items',
                dataID: 'data-uuid', // the key of the ID 'key' in the model to look for
                dblclickSupport: true, // double click would open a branch

                toggleTime: 400, // animation duration on open/close tree branch
                easing: function(n) {return -(--n * n * n * n - 1);}, // quarticEaseOut
                dragOffset: 12, // if D&D is enabled, this is the offset (in px) when dragging starts

                click: 'click', // event listener on click/touchStart/...
                dblclick: 'dblclick', // as above...
                mouseover: 'mouseover',
                mousedown: 'mousedown',
                mousemove: 'mousemove',
                mouseup: 'mouseup',
                dragCanvas: window // the mousedown/mousemove... canvas
            };

            /**
             * Model of the initial tree
             * @type {Array}
             *
             * @description  The expected model looks like the following:
             *
             * [{
             *     title: 'Title', // Name of item displayed inside A-tag
             *     uuid: '', // a unique identifier as String
             *     type: '', // String of the type (folder, Image, Whatever...)
             *     children: [] // (an)other Object(s) (model) like this or empty, if not there there will be no possibility to open / load
             * }, {...}]
             *
             * parentuuid and index will be added automatically
             *
             */
            this.tree = options.model;
            this.treeIndex = {};
            this.callbacks = {};

            initBBTree(this, options);
        },
        _dragDrop = {},
        _this;

    BBTree.prototype.buildTree = function(model) {
        if (this.elements.tree.getElementsByTagName('li').length) {
            this.destroyTree(this.tree);
            this.tree = model;
        }
        var tmpJumper = this.elements.tree.querySelector('.' + this.options.jumperID);
        document.body.appendChild(tmpJumper);

        this.elements.tree.innerHTML = getTreeHTML(this, model);

        if (tmpJumper){
            this.elements.tree.appendChild(tmpJumper);
        }
        referenceNodes(this, this.elements.tree);
    };

    BBTree.prototype.destroyTree = function() {
        doEventHandlers(this, true);
        for (var node in this.tree) {
            this.removeNode(this.tree[node][this.options.id], this.tree, node);
        }
        for (var n in this) {
            if (n === 'elements') for (var m in this[n]) {
                this[n][m] = null;
            }
            this[n] = null;
            delete this[n];
        }
    };

    BBTree.prototype.appendNode = function(element, model, noAnim, force) {
        var fragment,
            container,
            recycleContainer,
            recycleHasChildren = false,
            model = this.treeIndex[model.nodeType ? model.getAttribute(this.options.dataID) : model] ?
                this.treeIndex[model.nodeType ? model.getAttribute(this.options.dataID) : model].model : model,
            isExisting = !!this.treeIndex[model[0][this.options.id]],// model[0] !== model[0],
            modelNode = isExisting ? undefined : addNodes(this, model, element),
            exclude = this.options.exclude;

        model = exclude(model);

        if (isExisting) reAppendNode(this, element, model[0], noAnim, force);
        if (!modelNode) return;

        recycleContainer = this.treeIndex[modelNode[this.options.id]].HTMLNode.parentNode.getElementsByTagName('ul')[0];
        // recycleContainer = modelNode.htmlNode.parentNode.getElementsByTagName('ul')[0];
        recycleHasChildren = recycleContainer ? !!recycleContainer.children.length : false;

        fragment = document.createDocumentFragment();
        container = fragment.appendChild(document.createElement('ul'));
        container.innerHTML = getTreeHTML(this, isExisting ? [model] : model, element);
        referenceNodes(this, container);

        if (recycleContainer) {
            while (container.children[0]) {
                fragment.appendChild(container.children[0]);
            }
            fragment.removeChild(container);
            recycleContainer.appendChild(fragment);
            if (!recycleHasChildren) {
                container.style.height = '';
                removeClass(element.parentNode, this.options.collapsedClassName);
                addClass(element.parentNode, this.options.openedClassName);
            }
        } else {
            container.style.height = '0px';
            addClass(element.parentNode, this.options.collapsedClassName);
            element.parentNode.appendChild(fragment);
        }

        toggleChildren(element, this, !!noAnim, force === undefined ? true : force);

    };

    BBTree.prototype.insertBefore = function(element, model, noAnim, force) {
        var fragment = document.createDocumentFragment(),
            container = fragment.appendChild(document.createElement('div')),
            sibling = this.treeIndex[element.nodeType ? element.getAttribute(this.options.dataID) : element],

            idxNode = this.treeIndex[model.nodeType ? model.getAttribute(this.options.dataID) : model[this.options.id]],
            model = idxNode ? idxNode.model : model,
            htmlNode = sibling.HTMLNode,
            isExisting = model !== model,
            modelNode = isExisting ? undefined : addNodes(this, model, htmlNode, sibling.model.index);

            if (isExisting) reInsertNode(this, sibling.model, model, noAnim, force);
            if (!modelNode) return;

            container.innerHTML = getTreeHTML(this, model, sibling.model['parent' + this.options.id].HTMLNode);
            referenceNodes(this, container);
            while (container.children[0]) {
                fragment.appendChild(container.children[0]);
            }
            fragment.removeChild(container);
            htmlNode.parentNode.parentNode.insertBefore(fragment, htmlNode.parentNode);
    };

    BBTree.prototype.removeNode = function(element, parent, index) { // this could be done more generic??
        var currentId = element.nodeType ? element.getAttribute(this.options.dataID) : element,
            currentNode,
            elm;

        element = this.treeIndex[currentId].model;
        elm = this.treeIndex[currentId].HTMLNode;

        for (currentNode in element.children) { // first do children
            this.removeNode(element.children[currentNode][this.options.id], element, currentNode);
        }

        elm.parentNode.parentNode.removeChild(elm.parentNode); // do we have to remove ULs????
        elm = null;
        if (element['parent' + this.options.id]) {
            if (index) {
                parent.children[index] = null;
                parent.children.splice(index, 1);
                // reorderNodes(parent, index);
            } else {
                parent = this.treeIndex[element['parent' + this.options.id]].model;
                for (currentNode in parent.children) {
                    if (parent.children[currentNode] === element) {
                        parent.children[currentNode] = null;
                        parent.children.splice(currentNode, 1);
                        reorderNodes(parent, currentNode);
                        break;
                    }
                }
            }
        }
        this.treeIndex[currentId].model = null;
        this.treeIndex[currentId].HTMLNode = null;
        delete this.treeIndex[currentId];
    };

    BBTree.prototype.updatePath = function(uuid, originalUuid){
        var self = this;
        var treeIndex = this.treeIndex;
        var node;
        if (!treeIndex[uuid] && treeIndex[originalUuid]) {
            treeIndex[uuid] = treeIndex[originalUuid];
            delete treeIndex[originalUuid];
        }
        node = treeIndex[uuid].model;

        if (node.children){
            node.children.forEach(function(item, idx, children){
                item.path = [node.path, item.title].join('/');
                self.updatePath(item.uuid);
            });
        }
    };

    BBTree.prototype.updateParentModel = function (model){};

    BBTree.prototype.updateNode = function(element, model, force) {
        var idxElm = this.treeIndex[element.nodeType ? element.getAttribute(this.options.dataID) : element],
            origUuid = idxElm.model.uuid,
            idxModel = idxElm.model,
            madeChanges = false,
            fragment;

        for (var key in model) {
            if (idxModel[key] !== model[key]) {
                idxModel[key] = model[key];
                madeChanges = true;
            }
        }

        this.updatePath(idxModel.uuid, origUuid);

        if (madeChanges || force) {
            this.updateParentModel(idxModel);
            fragment = document.createDocumentFragment().appendChild(document.createElement('div'));
            fragment.innerHTML = getPartialTreeHTML(this, [idxModel], null);
            fragment = fragment.children[0];
            idxElm.HTMLNode.parentNode.parentNode.replaceChild(fragment, idxElm.HTMLNode.parentNode);
            referenceNodes (this, fragment);
        }
    };

    BBTree.prototype.selectNode = function(element, scrollElm) {
        element = highlightNode(this.treeIndex[element.nodeType ? element.getAttribute(this.options.dataID) : element].HTMLNode, this);
        if (scrollElm) scrollIntoView(element, scrollElm, this);
    };

    BBTree.prototype.toggleNode = function(element, noAnim, force) {
        toggleChildren(this.treeIndex[element.nodeType ? element.getAttribute(this.options.dataID) : element].HTMLNode, this, noAnim, force);
    };

    // some extra export which I might use with the implementation
    BBTree.doAnimation = doAnimation;
    BBTree.addEvent = addEvent;
    BBTree.removeEvent = removeEvent;
    BBTree.addClass = addClass;
    BBTree.removeClass = removeClass;
    BBTree.hasClass = hasClass;
    BBTree.getOrigin = getOrigin;

    /* -------------------- export -------------------- */

    if (window.define && window.define.amd) {
        window.define('backbase.com.2014.components/scripts/bbtree', function () {
            return BBTree;
        });
    } else {
        exporter.BBTree = BBTree;
    }


    /* ---------------------------------------------- */

    function initBBTree(This, options) {
        var newElement;

        for (var option in options) {
            if(/Callback/.test(option)) {
                This.callbacks[option] = options[option];
            } else if (!/tree|model/.test(option)) {
                This.options[option] = options[option];
            }
        }
        This.options.id = This.options.dataID.split('-');
        This.options.id = This.options.id[1] || This.options.id[0];

        // install jumper and toggle in DOM if they don't exist
        if (!This.elements.jumper.nodeType) { // or: typeof This.elements.jumper === 'string'
            newElement = document.createElement('div');

            newElement.className = This.elements.jumper; // is still a String
            This.elements.jumper = This.elements.tree.appendChild(newElement);
            This.elements.jumper.innerHTML = '<div class="' + This.options.jumperContainerClassName + '"></div>';
        }
        if (!This.elements.toggle.nodeType){
            newElement = document.createElement('div');
            newElement.className = This.elements.toggle; // is still a String
            This.elements.toggle = This.elements.tree.appendChild(newElement);
        }

        _this = This;
        if (This.tree && This.tree) {
            This.buildTree(This.tree);
        }

        doEventHandlers(This);
    }

    /* -------------- model and view mainpulation ----------- */

    function isEmptyObject(obj) {
        for (var prop in obj) {
            if (obj.hasOwnProperty(prop)) return false;
        }
        return true;
    }

    /**
     * Translates a model of a tree into a HTML (UL / LI) tree (and indexes the model,... saves time to do in here)
     * @param  {Object} This   The context (instance of current tree)
     * @param  {Array} model  The model that has to be translated into a HTML UL-LI tree
     * @param  {HTMLElement} parent The parent element used for recursion
     * @return {String}        Returns the HTML of the complete UL / LI (A) tree
     */
    function getTreeHTML(This, model, parent) {
        var tree = [''], // V8
            node,
            hasChildren = false,
            hasPossibleChildren = false,
            className = '',
            // prevent redo on recursion...
            alternative = This.options.getTreeHTML ? This.options.getTreeHTML(This, model, parent) : undefined,
            openedCln = This.options.openedClassName,
            collapsedCln = This.options.collapsedClassName,
            index = 0;

        for (var n = 0, m = model.length; n < m; n++) {
            node = model[n];
            if (parent) { // fake circular (back)reference
                node['parent' +  This.options.id] = parent[This.options.id] || parent.getAttribute(This.options.dataID);
            }
            node.index = index++;
            hasChildren = !!(node.children && node.children.length);

            if (alternative === undefined) {
                hasPossibleChildren = !!node.children;

                className = hasChildren || hasPossibleChildren ? openedCln: '';
                className = !hasChildren && hasPossibleChildren ? collapsedCln : className;
                if (node.type) className += (className ? ' ' : '') + This.options.classPrefix + node.type.split(';')[0].replace('/', '-');
                className = className ? ' class="' + className + '"' : '';

                tree.push('<li' + className + '><a href="#" data-' + This.options.id + '="' + node.uuid + '"' +
                    ' title="' + node.title + '">' +
                    (node.type.indexOf('image') === 0 ? '<img src="' + node.thumbUrl + '" alt="' + node.altText + '">' : '') + // /^image/.test(node.type)
                    node.title + '</a>');
                tree.push(hasChildren || hasPossibleChildren ?
                    '<ul>' + (node.children ? getTreeHTML(This, node.children, node) : '') + '</ul></li>' : '</li>');
            } else if (hasChildren) { // to build the model, not for rendering
                getTreeHTML(This, node.children);
            }

            This.treeIndex[node.uuid] = {model: node};
        }

        return alternative || tree.join('');
    }

    /**
     * Render partial tree HTML to update the tree when rename of folder/item is used.
     * @param  {Object} This   The context (instance of current tree)
     * @param  {Array} model  The model that has to be translated into a HTML UL-LI tree
     * @param  {HTMLElement} parent The parent element used for recursion
     * @return {String} Returns the HTML of the complete UL / LI (A) tree
     */
    function getPartialTreeHTML(This, model, parent) {
        var tree = [''], node,
            alternative = This.options.getTreeHTML ? This.options.getTreeHTML(This, model, parent) : undefined,
            index = 0, i, j,
            generatedTemplate = jQuery(alternative);

        for (i = 0; i < model.length; i++) {
            node = model[i];

            if (parent) { // fake circular (back)reference
                node['parent' +  This.options.id] = parent[This.options.id] || parent.getAttribute(This.options.dataID);
            }

            node.index = index++;

            if(node.children && node.children.length) {
                var children = node.children;

                for(j = 0; j < children.length; j++) {
                    jQuery(generatedTemplate).children('ul').append(getPartialTreeHTML(This, [children[j]], node));
                }
            }

            This.treeIndex[node.uuid] = {model: node};
        }

        return generatedTemplate[0].outerHTML || tree.join('');
    }

    function findContainer(This, element, childElement) {
        var container;

        for (var n = element.children.length; n--; ) {
            if (element.children[n].tagName.toLowerCase() === 'ul') return element.children[n];
        }

        if (childElement) {
            container = document.createElement('ul');
            container.appendChild(childElement);
            element.appendChild(container);
            container.style.height = '';
            addClass(container.parentNode, This.options.openedClassName);
            return container;
        }
    }

    function removeNode(node, model) {
        for (var n = node.children.length; n--; ) {
            if (node.children[n] === model) {
                node.children.splice(n, 1);
                reorderNodes(node, n);
                break;
            }
        }
    }

    function reAppendNode(This, node, model, noAnim, force) {
        var parent = This.treeIndex[model['parent' + This.options.id]] && This.treeIndex[model['parent' + This.options.id]].model,
            container,
            element;

        node = addNodes(This, [model], node);
        model['parent' + This.options.id] = node[This.options.id];
        element = This.treeIndex[node[This.options.id]].HTMLNode;

        if (parent){
                removeNode(parent, model);
        }

        This.updatePath(model.uuid);

        container = findContainer(This, element.parentNode, This.treeIndex[model[This.options.id]].HTMLNode.parentNode);
        removeClass(element.parentNode, This.options.collapsedClassName);
        addClass(element.parentNode, This.options.openedClassName);
        element.parentNode.style.height = '';
        container.appendChild(This.treeIndex[model[This.options.id]].HTMLNode.parentNode);
    }

    function reInsertNode(This, node, model, noAnim, force) {
        var parent = This.treeIndex[model['parent' + This.options.id]].model,
            element;

        addNodes(This, [model], node[This.options.id], node.index);

        model['parent' + This.options.id] = node['parent' + This.options.id];
        if (model['parent' + This.options.id] === undefined) delete model['parent' + This.options.id];

        removeNode(parent, model);

        element = This.treeIndex[node[This.options.id]].HTMLNode;

        element.parentNode.parentNode.insertBefore(This.treeIndex[model[This.options.id]].HTMLNode.parentNode, element.parentNode);
    }

    function addNodes(This, model, parent, index) {
        var node = This.treeIndex[parent.nodeType ? parent.getAttribute(This.options.dataID) : parent].model,
            isIdx = index !== undefined;

        if (node) {
            if (isIdx) {
                node = This.treeIndex[node['parent' + This.options.id]].model;
            }

            if (node.children) {
                model.index = isIdx ? index : node.children.length;

                for (var n = 0, m = model.length; n < m; n++) {
                    if (isIdx) {
                        node.children.splice(index++, 0, model[n]);
                    } else {
                        node.children.push(model[n]);
                    }
                }
                if (isIdx) reorderNodes(node, index - model.length);
            } else {
                node.children = [model];
                model.index = 0;
            }
            return node;
        }
    }

    function referenceNodes (This, elements) {
        elements = elements.getElementsByTagName('a');
        for (var n = elements.length; n--; ) {
            This.treeIndex[elements[n].getAttribute(This.options.dataID)].HTMLNode = elements[n];
            // This.HTMLIndex[elements[n].getAttribute(This.options.dataID)] = elements[n];
        }
    }

    function findElement(element, root, instance) {
        while (element && element !== root) {
            if (element.getAttribute && instance.treeIndex[element.getAttribute(instance.options.dataID)]) {
                return element;
            } else {
                element = element.parentNode;
            }
        }
    }

    function reorderNodes(parentNode, index) {
        for (var n = index ? +index : 0, m = parentNode.children.length; n < m; n++) {
             parentNode.children[n].index = n;
        }
    }

    /* --------------- event handlers --------------- */

    function doEventHandlers(This, off) {
        var onOff = off ? removeEvent : addEvent;

        onOff(This.elements.tree, This.options.click, function(e) {
            var e = e || window.event,
                target = e.srcElement || e.target,
                node = findElement(target, this, This);

            if (node) {
                clickHandler(e, node, This);
                return false;
            }
        });

        onOff(This.elements.tree, This.options.dblclick, function(e) {
            var e = e || window.event,
                target =e.srcElement || e.target,
                node = findElement(target, this, This);

            if (node) {
                clickHandler(e, node, This);
                return false;
            }
        });

        onOff(This.elements.tree, This.options.mouseover, function(e) {
            var e = e || window.event,
                target = e.srcElement || e.target,
                node = findElement(target, this, This);

            if (node) {
                mouseOverHandler(e, node, This);
            }
        });

        onOff(This.elements.tree, This.options.mousedown, function(e) {
            var e = e || window.event,
                target = e.srcElement || e.target,
                node = findElement(target, this, This);

            if (node) {
                mouseDownHandler(e, node, This);
                e.returnValue = false;
                if (e.preventDefault) e.preventDefault();
                return false;
            }
        });
    }

    function clickHandler(e, elm, This) {
        var isArrow = e.target === This.elements.jumper,
            isRoot = elm.parentNode.parentNode === This.elements.tree,
            hasChildren = elm.parentNode.getElementsByTagName('ul')[0],
            openClose = hasChildren && e.target === This.elements.toggle,
            activeChild = elm.parentNode.querySelector('.' + This.options.selectedClassName),
            action = isArrow ? 'detail' : e.target === elm ? 'select' : openClose ?
                (elm.parentNode.className.match(This.options.collapsedClassName) ? 'open' : 'close') : 'icon',
            toggled;

        if (This.callbacks.clickCallback &&
                This.callbacks.clickCallback(e, elm, This.treeIndex[elm.getAttribute(This.options.dataID)].model, action, This)) {
            return false;
        }

        if (openClose || (hasChildren &&
                This.options.dblclickSupport && e.type === This.options.dblclick && This.elements.current === elm)) {
            toggled = toggleChildren(elm, This, undefined, undefined, hasChildren.childNodes.length);
            if (toggled && activeChild && activeChild !== elm) {
                highlightNode(elm, This);
            }
        } else if (This.elements.active !== elm && !isRoot) {
            highlightNode(elm, This);
        }
    }

    function mouseOverHandler(e, elm, This) {
        var isRoot = elm.parentNode.parentNode === This.elements.tree;

        if (!isRoot && This.elements.current !== elm) {
            This.elements.oldCurrent = This.elements.current;
            This.elements.current = elm;
            appendJumper(elm, This);
        }
    }

    /* --------------- animation stuff ---------------- */

    function toggleChildren(elm, This, noAnim, force, postpone) {
        var parent = elm.parentNode,
            wrapper = parent.getElementsByTagName('ul')[0],
            wrapperStyle = wrapper.style,
            currentHeight = wrapper.offsetHeight,
            autoHeight = 0,
            openedCln = This.options.openedClassName,
            collapsedCln = This.options.collapsedClassName,
            isClosed = parent.className.match(collapsedCln);

        if (This.animate) {
            return false;
        }

        if (This.callbacks.toggleCallback && This.callbacks.toggleCallback(elm, force, This) ||
            (isClosed && force === false || !isClosed && force === true)) {
            return false;
        }

        if (postpone !== undefined && !postpone) {
            if (This.callbacks.loadTreeItemsCallback && This.callbacks.loadTreeItemsCallback(elm, This, noAnim, force)) {
                return false;
            }
            addClass(parent, This.options.loadingClassName);
            return false;
        }

        if (!currentHeight) { // we need to detect the resulting expanded height
            wrapperStyle.height = '';
            autoHeight = wrapper.offsetHeight;
            wrapperStyle.height = currentHeight + 'px';
        }

        This.animate = true;

        doAnimation(
            wrapper.style,
            currentHeight ? {type: 'height', unit: 'px', start: currentHeight, end: 0} :
                        {type: 'height', unit: 'px', start: 0, end: autoHeight - currentHeight},
            noAnim ? This.options.toggleTime : doAnimation.timer(true),
            This.options.toggleTime,
            This.options.easing,
            function() {
                wrapper.style.height = wrapper.offsetHeight ? '' : '0px';
                if (This.callbacks.toggleEndCallback) {
                    This.callbacks.toggleEndCallback(elm, This);
                }
            }
        );

        toggleClass(parent, collapsedCln);
        toggleClass(parent, openedCln);

        return true;
    }

    function doAnimation(elmStyle, css, time, toggleTime, easing, callback) {
        var ease = easing(time / toggleTime);

        if (!css.length) css = [css];
        if (time < toggleTime) { // might be done for more than 1 type if cssText is used instead
            for (var n = css.length; n--; ) {
                elmStyle[css[n].type] = (css[n].start + ease * (css[n].end - css[n].start)) + css[n].unit; // Math.round IE8?
            }
            window.setTimeout(function(){
                doAnimation(elmStyle, css, doAnimation.timer(), toggleTime, easing, callback);
            }, 1000 / 60);
        } else {
            for (var n = css.length; n--; ) {
                elmStyle[css.type] = css.end + css.unit;
            }
            delete _this.animate;
            if (callback) callback(elmStyle, css);
        }
    }

    doAnimation.timer = function(res) {
        if (!res) return new Date().getTime() - doAnimation.timer.sT || 0;
        else {
            doAnimation.timer.sT = new Date().getTime();
            return 0;
        }
    };

    function scrollIntoView(elm, scrollElm, This) {
        var container = scrollElm.nodeType ? scrollElm : This.elements.tree.firstChild.getElementsByTagName('ul')[0],
            containerHeight = container.offsetHeight,
            containerOrigin = getOrigin(This.elements.tree),
            elmOrigin = getOrigin(elm),
            before = container.scrollTop,
            after = 0;

        if (elmOrigin.top - elm.offsetHeight < containerOrigin.top) {
            after = before - containerOrigin.top + elmOrigin.top - (elm.offsetHeight * 2);
        } else if (elmOrigin.top - containerOrigin.top > containerHeight) {
            after = before - (containerHeight + containerOrigin.top - elmOrigin.top - elm.offsetHeight);
        }
/*        var container = This.elements.tree.firstChild.getElementsByTagName('ul')[0],
            before = container.scrollTop,
            after = 0,
            diff;

        elm.scrollIntoView(true);
        after = container.scrollTop;
        container.scrollTop = before;
        diff = before - after;

*/      if (after) doAnimation(
            container,
            {type: 'scrollTop', unit: '', start: before, end: after},
            doAnimation.timer(true),
            600,
            function(n) {return --n*n*n+1;}
        );
    }

    /* ---------------- some interaction ----------------*/

    function highlightNode(elm, This) {
        if (This.callbacks.highlightCallback && This.callbacks.highlightCallback(elm, This)) {
            return false;
        }

        removeClass(This.elements.active, This.options.selectedClassName);
        addClass(elm, This.options.selectedClassName);
        if (This.elements.active) This.elements.oldActive = This.elements.active;
        This.elements.active = elm;
        return elm;
    }

    function appendJumper(elm, This) {
        var hasChildren = elm.parentNode.getElementsByTagName('ul').length;

        if (This.callbacks.appendCallback && This.callbacks.appendCallback(elm, This.elements.jumper, This)) {
            return false;
        }

        if (!This.options.avoidJumper) elm.appendChild(This.elements.jumper);
        if (hasChildren) {
            elm.appendChild(This.elements.toggle);
        }
    }

    /* ---------------- D&D manager -------------------- */

    function mouseDownHandler(e, elm, This) {
        _this = This;
        _dragDrop = {
            delayState: 0,
            element: elm,
            elemetOrigin: getOrigin(elm),
            node: This.treeIndex[elm.getAttribute(This.options.dataID)].model,
            x: e.pageX,
            y: e.pageY
        };

        addEvent(This.options.dragCanvas, This.options.mousemove, mouseMoveHandler);
        addEvent(This.options.dragCanvas, This.options.mouseup, mouseUpHandler);
    }

    function mouseMoveHandler(e) {
        var dragDrop = _dragDrop;

        if (dragDrop.delayState || (
            Math.abs(e.pageX - dragDrop.x) >= _this.options.dragOffset ||
            Math.abs(e.pageY - dragDrop.y) >= _this.options.dragOffset)) {

            if (dragDrop.delayState === 0) {
                dragDrop.delayState = 1;
                if (_this.callbacks.dragStartCallback) {
                    _this.callbacks.dragStartCallback(e, dragDrop.element, dragDrop.node,
                        {x: e.pageX - dragDrop.x, y: e.pageY - dragDrop.y}, dragDrop.elemetOrigin, _this);
                }
            }

            if (_this.callbacks.dragCallback) {
                _this.callbacks.dragCallback(e, dragDrop.element, dragDrop.node, _this);
            } else {
                mouseUpHandler(e);
            }
        }
    }

    function mouseUpHandler(e) {
        removeEvent(_this.options.dragCanvas, _this.options.mousemove, mouseMoveHandler);
        removeEvent(_this.options.dragCanvas, _this.options.mouseup, mouseUpHandler);

        if (_this.callbacks.dropCallback && _this.callbacks.dragCallback && _dragDrop.delayState) {
            _this.callbacks.dropCallback(e, _dragDrop.element, _dragDrop.node, _dragDrop.elemetOrigin, _this);
        }
    }

    /* -------------------- common helpers ------------------------ */
    /*
     * The following could be replaced by functions from an external
     * library like portalClient, jQuery, Zepto, ...
     */

    function addEvent (obj, type, func) {
        if (!addEvent.cache) addEvent.cache = {
            _get: function (obj, type, func, checkOnly) {
                var cache = addEvent.cache[type] || [];

                for (var n = cache.length; n--; ) {
                    if (obj === cache[n].obj && '' + func === '' + cache[n].func) {
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
                var cache = addEvent.cache[type] = addEvent.cache[type] || [];

                if (addEvent.cache._get(obj, type, func, true)) {
                    return true;
                } else {
                    cache.push({
                        func: func,
                        obj: obj
                    });
                }
            }
        };

        if (!func.name && addEvent.cache._set(obj, type, func)) {
            return;
        }

        if (obj.addEventListener) obj.addEventListener(type, func, false);
        else obj.attachEvent("on" + type, func);
    }

    function removeEvent (obj, type, func) {
        if (!func.name) {
            func = addEvent.cache._get(obj, type, func) || func;
        }

        if (obj.removeEventListener) obj.removeEventListener(type, func, false);
        else obj.detachEvent("on" + type, func);
    }

    function addClass(elm, cln) {
        var className = elm.className;

        if (elm && !hasClass(elm, cln)) {
            elm.className = className + (className ? ' ' : '') + cln;
        }
    }

    function removeClass(elm, cln) {
        if (!elm) return;
        elm.className = elm.className.replace(new RegExp('(\\b|\\s+)' + cln + '(\\s+|$)', 'g'), function($1, $2) {
            return !$1 || !$2 ? '' : ' ';
        }).replace(/ $/, '');
    }

    function hasClass(elm, cln) {
        return !elm ? false : new RegExp(cln).test(' ' + elm.className + ' ');
    }

    function toggleClass(elm, cln, force) {
        if (!elm) return;
        if (force || !hasClass(elm, cln)) {
            addClass(elm, cln);
        } else {
            removeClass(elm, cln);
        }
    }

    function getOrigin(elm) {
        var box = (elm.getBoundingClientRect) ? elm.getBoundingClientRect() : {top: 0, left: 0},
            doc = elm && elm.ownerDocument,
            body = doc.body,
            win = doc.defaultView || doc.parentWindow || window,
            docElem = doc.documentElement || body.parentNode,
            clientTop  = docElem.clientTop  || body.clientTop  || 0, // border on html or body or both
            clientLeft =  docElem.clientLeft || body.clientLeft || 0;

        return {
            left: box.left + (win.pageXOffset || docElem.scrollLeft) - clientLeft,
            top:  box.top  + (win.pageYOffset || docElem.scrollTop)  - clientTop
        };
    }

})(window, window);
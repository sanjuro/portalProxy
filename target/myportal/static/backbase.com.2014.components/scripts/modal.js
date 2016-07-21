define([
    'angular',
    'jquery',
    'tpl!backbase.com.2014.components/templates/modal/notify.html',
    'tpl!backbase.com.2014.components/templates/modal/confirm.html',
    'tpl!backbase.com.2014.components/templates/modal/dialog.html'
], function(angular, $, notifyTpl, confirmTpl, dialogTpl) {
    'use strict';

    // TODO(kirill) move into the Base utility if is widely used
    var oop = {
        inherit : function(obj, parent, props) {
            var key;
            function F() {}

            F.prototype = parent.prototype;
            obj.prototype = new F();
            obj.prototype.constructor = obj;

            for (key in props) if ( Object.prototype.hasOwnProperty.call(props, key) ) {
                obj.prototype[key] = props[key];
            }
            obj.prototype.__parent = function (name, args) {
                return parent.prototype[name].apply(this, utils.toArray(args) || []);
            };
            obj.prototype.__construct = function (args) {
                parent.apply(this, args || []);
            };
            return obj;
        }
    };

    var provider = function($q) {
        /**
         * collection of notification panels
         * @type {*}
         */
        var notificationQueue = (function() {
            var queue = {}; // for direct access to items
            var ids = []; // for index based access + item length
            var add = function(item) {
                var id = 'id_' + item.uid;
                if (!queue[id]) {
                    item.index = ids.length;
                    queue[id] = item;
                    ids.push(id);
                }
                return item;
            };
            var reposition = function() {
                var notification;
                for (var i = 0; i < ids.length; i++) {
                    notification = queue[ids[i]];
                    if (notification) {
                        notification.index = i;
                        notification.reposition();
                    }
                }
            };
            var remove = function(item) {
                var id = 'id_' + item.uid;
                if (queue[id]) {
                    ids.splice(item.index, 1);
                    delete queue['id_' + item.uid];
                }
                item = null;
                reposition();
            };
            var has = function(item) {
                return !!queue['id_' + item.uid];
            };
            var item = function(uid) {
                return queue['id_' + uid];
            };
            var length = function() {
                return ids.length;
            };
            return {
                add: add,
                remove: remove,
                has: has,
                item: item,
                length: length
            };
        })();

        /**
         * Base class for modals
         * @param {Object} params - configuration params for modal
         */
        var Modal = function(params) {
            this.uid = params.uid;
            this.$template = this.createView(params);

            this.show();

        };
        Modal.prototype.tplFn = function(data){
            return data;
        };

        Modal.prototype.modalProxy = true;

        Modal.prototype.show = function() {
            this.$template.animate({
                opacity: 1,
                'margin-top': '+=5'
            });
        };
        Modal.prototype.hide = Modal.prototype.close = function() {
            var modal = this;
            modal.$template.animate({
                opacity: 0,
                'margin-top': '+=5'
            }, function() {
                modal.$template.detach();
                if (modal.modalProxy){
                    modal.$modalProxy.remove();
                }
            });
        };

        Modal.prototype.defaultButtons = [];

        Modal.prototype.getPosition = function(){
            return $('body').height() / 2 - 200;
        };

        Modal.prototype.createView = function(params) {
            var modal = this;

            params = {
                icon: params.icon || 'checkbox',
                iconCls: params.iconCls,
                uid: this.uid || Math.random(),
                title: params.title,
                text: params.text,
                html: params.html,
                className: params.className,
                buttons: params.buttons || this.defaultButtons,
                y: this.getPosition() + 'px'
            };

            var $template = $(this.tplFn(params));
            $template.css({
                'visibility': 'hidden',
                'opacity': 0
            });
            $(document.body).append($template);

            if (this.modalProxy){
                modal.$modalProxy = $('<div class="bb-pm-modal-proxy"></div>');
                $(document.body).append(modal.$modalProxy);
            }

            var tWidth = $template.outerWidth();
            $template.css({
                'visibility': 'visible',
                'margin-left': -tWidth / 2 + 'px',
                'top': params.y
            });
            if (params.className) {
                $template.addClass(params.className);
            }
            if (params.data) {
                for (var o in params.data) {
                    $template.data(o, params.data[o]);
                }
            }
            if (params.buttons.length){
                $template.find('.bb-pm-buttons .btn').each(function(idx, btn){
                    var $btn = $(btn), btnObject = params.buttons[idx];
                    if (btnObject.type === 'ok'){
                        $btn.focus();
                        $btn.click(function(evt){
                            if (typeof btnObject.handler === 'function'){
                                btnObject.handler(modal);
                            }
                            modal.okHandler();
                            modal.hide();
                        });
                    } else if (btnObject.type === 'cancel'){
                        $btn.click(function(evt){
                            if (typeof btnObject.handler === 'function'){
                                btnObject.handler(modal);
                            }
                            modal.cancelHandler();
                            modal.hide();
                        });
                    } else {
                        $btn.click(function(evt){
                            if (typeof btnObject.handler === 'function'){
                                btnObject.handler(modal);
                            }
                        });
                    }
                });
            }

            return $template;
        };
        Modal.prototype.reposition = function() {
            var newPos = 10 + (this.index * 85);
            this.$template.animate({
                top: newPos + 'px'
            });
        };

        /**
         * notification panel
         * @param params
         * @constructor
         */

        var Notification = oop.inherit(function(params) {

            this.timeout = null;
            this.index = null;
            this.uid = params.uid;
            this.delay = params.delay || 3000;
            this.$template = this.createView(params);

            this.show();
        }, Modal, {
            tplFn: notifyTpl,
            modalProxy: false,
            getPosition: function(){
                return 10 + (notificationQueue.length() * 85);
            },
            show: function() {
                this.$template.animate({
                    opacity: 1,
                    'margin-top': '+=10'
                });
                if (this.delay > -1) {
                    this.hide();
                }
            },
            hide: function() {
                var panel = this,
                    time = this.delay > -1 ? this.delay : 1;
                clearTimeout(this.timeout);
                this.timeout = setTimeout(function() {
                    panel.$template.animate({
                        opacity: 0,
                        'margin-top': '+=10'
                    }, function() {
                        panel.$template.remove();
                        notificationQueue.remove(panel);
                    });
                }, time);
            }
        });

        var Confirm = oop.inherit(function(params) {
            this.index = null;
            this.uid = params.uid;
            this.$template = this.createView(params);

            this.show();

            this.keyHandler = this.keyHandler.bind(this);
            $(document).on('keydown', this.keyHandler);

        }, Modal, {
            tplFn: confirmTpl,
            show: function() {
                this.promise = $q.defer();
                this.$template.animate({
                    opacity: 1,
                    'margin-top': '+=5'
                });
                return this.promise.promise;
            },
            defaultButtons: [{title: 'OK',type: 'ok'}, {title: 'Cancel',type: 'cancel'}],
            okHandler: function(){
                this.promise.resolve(this.$template);
                $(document).off('keydown', this.keyHandler);
            },
            cancelHandler: function(){
                this.promise.reject(this.$template);
                $(document).off('keydown', this.keyHandler);
            },
            keyHandler: function(event){
                event.stopPropagation();
                if (event.keyCode === 27) {
                    this.cancelHandler();
                    this.hide();
                }
            }
        });

        var Dialog = oop.inherit(function(params) {
            this.index = null;
            this.uid = params.uid;
            this.$template = this.createView(params);

            this.show();

        }, Modal, {
            tplFn: dialogTpl,
            show: function() {
                this.promise = $q.defer();
                this.$template.animate({
                    opacity: 1,
                    'margin-top': '+=5'
                });
                return this.promise.promise;
            },
            defaultButtons: [{title: 'OK',type: 'ok'}, {title: 'Cancel',type: 'cancel'}],
            okHandler: function(){
                this.promise.resolve(this.$template);
            },
            cancelHandler: function(){
                this.promise.reject();
            }
        });


        return {
            notify: function(params) {
                var panel;
                if(params.icon && params.icon !== 'error'){
                    if (notificationQueue.has(params)) {
                        panel = notificationQueue.item(params.uid);
                        if (panel.delay > -1) {
                            panel.hide();
                        }
                    } else {
                        if (!params.uid) {
                            params.uid = Math.random();
                        }
                        panel = new Notification(params);
                        notificationQueue.add(panel);
                    }
                    return panel;
                }else{
                    params.status = 'error';
                    params.title = (params.title || 'ERROR').toUpperCase();
                    params.html = params.message || params.text;
                    params.text = params.message || params.text;
                    params.buttons = [
                        {
                            title: 'OK',
                            type: 'ok',
                            callback: function (){}
                        }
                    ];
                    return this.dialog(params);
                }
            },

            confirm: function(params) {
                var confirm = new Confirm(params);
                return confirm.show();
            },

            dialog: function(params){
                var dialog = new Dialog(params);
                return dialog.show();
            }
        };
    };

    angular.module('bbModal', [])
        .provider('$bbModal', function(){
            return {
                $get: ['$q', provider]
            };
        });
});

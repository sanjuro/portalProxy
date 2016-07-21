(function() {
	'use strict';

	var hotKeys = angular.module('drahak.hotkeys', []);

	hotKeys.directive('hotkey', ['$parse', '$hotkey', 'HotKeysElement', function($parse, $hotkey, HotKeysElement) {
		return {
			restrict: 'AE',
			link: function(scope, element, attrs) {
				var isUsedAsAttribute = element[0].nodeName.toLowerCase() !== 'hotkey';
				var entityManager = isUsedAsAttribute ? HotKeysElement(element) : $hotkey;

				var isForced = scope.$eval(attrs.forced);
				var invoker = $parse(attrs.invoke);
				var description = attrs.description;
				var hotkeys = {};
				var callback = function(event) {
					invoker(scope, { $event: event, $hotkeysList: entityManager._hotKeyDescriptions });
				};
				hotkeys[attrs.hotkey || attrs.bind] = callback;

				angular.forEach(hotkeys, function(handler, hotkey) {
					entityManager.bind(hotkey, handler, description, isForced);
				});

				element.bind('$destroy', function() {
					entityManager.unbind(attrs.hotkey || attrs.bind, callback, description);
				});
			}
		}
	}]);

	hotKeys.factory('HotKeysElement', ['$window', 'HotKeys', function($window, HotKeys) {

		// TODO: find better way how to support multiple key codes for a key
		var replace = {
			93: 91 // commmand key codes
		};

		var code = null;
		var getKeyCode = function(event) {
			code = event.keyCode;
			return typeof replace[code] !== 'undefined' ? replace[code] : code;
		};

		/**
		 * @params {HTMLElement} element
		 * @returns {HotKeys}
		 */
		return function(element) {
			var keys = [];
			var key = null;
			var elem = angular.element(element);
			var root = angular.element($window);
			var scope = elem.scope();
			var hotKeys = HotKeys();

			/** @type {HotKeys} */
			if (scope) scope.$hotKeys = hotKeys;

			root.bind('blur', function() { keys = []; });
			elem.bind('keydown', function(e) {
				key = getKeyCode(e);
				if (keys.indexOf(key) === -1) keys.push(key);
				hotKeys.trigger(keys, [e], e);
			});

			elem.bind('keyup', function(e) {
				var code = getKeyCode(e);

				if(code === 91) {
					// If command is up, better to clean the keys because you don't have keyup for any key after command was pressed
					// http://bitspushedaround.com/on-a-few-things-you-may-not-know-about-the-hellish-command-key-and-javascript-events/
					keys = [];
				} else {
					keys.splice(keys.indexOf(code), 1);
				}

			});

			return hotKeys;
		};
	}]);

	hotKeys.factory('HotKeys', ['ParseKey', 'KeyChars', '$rootScope', function(ParseKey, KeyChars, $rootScope) {

		/**
		 * @constructor
		 */
		var HotKeys = function() {
			this._hotKeys = {};
			this._hotKeyDescriptions = {};
			this._hotKeysForced = {};
		};

		/**
		 * Get hot key index
		 * @param {String|Array.<Number>} hotKeyExpr
		 * @returns {String}
		 * @private
		 */
		HotKeys.prototype._getHotKeyIndex = function(hotKeyExpr) {
			var hotKey;
			if (angular.isString(hotKeyExpr)) {
				hotKey = ParseKey(hotKeyExpr);
			} else if (angular.isArray(hotKeyExpr)) {
				hotKey = hotKeyExpr;
			} else {
				throw new Error('HotKey expects hot key to be string expression or key codes array, ' + typeof(hotKeyExpr) + ' given.');
			}
			return hotKey.sort().join('+');
		};

		HotKeys.prototype._getHotKeyChar = function(hotKeyExpr){
			var hotKey;
			if (angular.isString(hotKeyExpr)) {
				hotKey = KeyChars(hotKeyExpr);
			} else if (angular.isArray(hotKeyExpr)) {
				hotKey = hotKeyExpr;
			} else {
				throw new Error('HotKey expects hot key to be string expression or key codes array, ' + typeof(hotKeyExpr) + ' given.');
			}
			return hotKey.join('+');
		};

		/**
		 * Register hot key handler
		 * @param {String|Array.<Number>} hotKey
		 * @param {Function} callback
		 * @returns this
		 */
		HotKeys.prototype.bind = function(hotKey, callback, description, forced) {
			var hotKeyChar = this._getHotKeyChar(hotKey);
			hotKey = this._getHotKeyIndex(hotKey);
			if (!this._hotKeys[hotKey]) {
				this._hotKeys[hotKey] = [];
			}
			if (!this._hotKeyDescriptions[hotKeyChar] && description) {
				this._hotKeyDescriptions[hotKeyChar] = [];
			}
			if (!this._hotKeysForced[hotKey]){
				this._hotKeysForced[hotKey] = [];
			}
			this._hotKeys[hotKey].push(callback);
			this._hotKeysForced[hotKey].push(forced || false);
			this._hotKeyDescriptions[hotKeyChar].push(description);
			return this;
		};

		/**
		 * Remove registered hot key handlers
		 * @param {String|Array.<Number>} hotKey
		 * @returns this
		 */
		HotKeys.prototype.unbind = function(hotKey, handler, description) {
			var hotKeyChar = this._getHotKeyChar(hotKey);
			hotKey = this._getHotKeyIndex(hotKey);
			this._hotKeys[hotKey].splice(this._hotKeys[hotKey].indexOf(handler), 1);
			this._hotKeysForced[hotKey].splice(this._hotKeys[hotKey].indexOf(handler), 1);
			this._hotKeyDescriptions[hotKeyChar].splice(this._hotKeyDescriptions[hotKeyChar].indexOf(description), 1);
			return this;
		};

		/**
		 * Trigger hot key handlers
		 * @param {String|Array.<Number>} hotKey
		 * @param {Array} [args]
		 */
		HotKeys.prototype.trigger = function(hotKey, args, e) {
			var self = this;
			args = args || [];
			hotKey = this._getHotKeyIndex(hotKey);

			if (this._hotKeys[hotKey] && this._hotKeys[hotKey].length){
				var callback = this._hotKeys[hotKey][this._hotKeys[hotKey].length - 1];
				var forced = self._hotKeysForced[hotKey][this._hotKeys[hotKey].length - 1];
				var blacklist = ['INPUT', 'TEXTAREA', 'SELECT'];

				if (!$rootScope.disableHotkeys && blacklist.indexOf(e.target.tagName) === -1 && !e.target.isContentEditable || forced) {
					callback.apply(callback, args);
				}
			}
			// angular.forEach(this._hotKeys[hotKey], function(callback, idx) {
			// 	if (e.target.tagName !== 'INPUT' || self._hotKeysForced[hotKey][idx]) {
			// 		callback.apply(callback, args);
			// 	}
			// });

			if (!$rootScope.$$phase) {
				$rootScope.$apply();
			}
		};

		return function() {
			return new HotKeys();
		}
	}]);

	hotKeys.factory('$hotkey', ['$window', 'HotKeysElement', function($window, HotKeysElement) {
		return HotKeysElement($window);
	}]);

	hotKeys.service('ParseKey', ['$window', function($window) {
		var userAgent = $window.navigator.userAgent.toLowerCase();
		var isFirefox = userAgent.indexOf('firefox') > -1;
		var isOpera = userAgent.indexOf('opera') > -1;
		var commandKeyCode = isFirefox ? 224 : (isOpera ? 17 : 91 /* webkit */);

		var lexer = {
			'backspace': 8,
			'return': 8,
			'tab': 9, 'tabulator': 9,
			'enter': 13,
			'shift': 16,
			'ctrl': 17, 'control': 17,
			'alt': 18,
			'esc': 27, 'escape': 27,
			'left': 37,
			'up': 38,
			'right': 39,
			'down': 40,
			'insert': 45,
			'del': 46,
			'delete': 46,
			'command': commandKeyCode,
			'cmd': commandKeyCode,
			'/': 191
		};

		return function(expression) {
			var keys = [];
			var expressions = expression.split('+');

			angular.forEach(expressions, function(expr) {
				expr = expr.trim().toLowerCase();
				if (lexer[expr]) {
					keys.push(lexer[expr]);
				} else if (expr.length === 1) {
					keys.push(expr.toUpperCase().charCodeAt(0));
				} else {
					throw new Error('ParseKey expects one character or special expression like "Tab" or "Control", "' + expr + '" given');
				}
			});

			return keys;
		};
	}]);

	hotKeys.service('KeyChars', ['$window', function($window) {
		var userAgent = $window.navigator.userAgent.toLowerCase();
		var isMac = userAgent.indexOf('mac os') > -1;
		var lexer = {
			'backspace': 'backspace' + (isMac ? ' &#9003;' : ''),
			'return': 'return &#x23ce;',
			'enter': 'return &#x23ce;',
			'tab': 'tab &#x9;',
			'tabulator': 'tab &#x9;',
			'shift': 'shift &#x21e7;',
			'ctrl': 'ctrl',
			'control': 'ctrl',
			'alt': 'alt' + (isMac ? ' &#x2325;' : ''),
			'esc': 'esc',
			'escape': 'esc',
			'left': 'arrow left &#x2190;',
			'up': 'arrow up &#x2191;',
			'right': 'arrow right &#x2192;',
			'down': 'arrow down &#x2193;',
			'insert': 'ins',
			'del': 'del',
			'delete': 'del',
			'command': 'cmd &#x2318;',
			'cmd': 'cmd &#x2318;'
		};

		return function(expression) {
			var keys = [];
			var expressions = expression.split('+');

			angular.forEach(expressions, function(expr) {
				expr = expr.trim().toLowerCase();
				if (lexer[expr]) {
					keys.push(lexer[expr]);
				} else if (expr.length === 1) {
					keys.push(expr.toUpperCase());
				} else {
					throw new Error('KeyChars expects one character or special expression like "Tab" or "Control", "' + expr + '" given');
				}
			});

			return keys;
		};
	}]);

})();
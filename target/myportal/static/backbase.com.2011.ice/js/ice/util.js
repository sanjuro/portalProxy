/**
 * Copyright © 2013 Backbase B.V.
 */


be.utils.define('be.ice.util', ['jQuery'], function ($) {

    'use strict';

	// helper that makes functions that take 1 parameter and callbacks return a
	// promise instead
	var fbind1 = function(fn) {
		return function(arg1) {
			var deferred = $.Deferred();

			fn(arg1, function() {
				deferred.resolve.apply(this, arguments);
			},
			function() {
				deferred.reject.apply(this, arguments);
			});

			return deferred.promise();
		};
	},

	// helper that makes keyword functions return a promise instead
	// keyword functions are functions that take a single param object
	// it's called keyword because all parameters are named as keys of the
	// params map
	fnkbind = function(fn) {
		return function(params) {
			var deferred = $.Deferred();

			params.successCallback = function() {
				deferred.resolve.apply(this, arguments);
			};
			params.errorCallback = function() {
				deferred.reject.apply(this, arguments);
			};
			fn(params);

			return deferred.promise();
		};
	},

	// chain functions that return a promise together
	// returns a promise for the whole chain, that, when resolved, contains the
	// results of all chained function calls
	// when a single promise fails, the whole promise fails

    chain = function chain(fns) {
		return fns.reduce(function(chain, fn) {
			return chain.then(function(chain) {
				return fn()
					.then(function(result) {
						return chain.concat(result);
					});
			});
		}, $.Deferred().resolve([]));
	},

    bind = function(fn /*, function arguments*/) {
		var args = Array.prototype.slice.call(arguments, 1);
		return function() {
			return fn.apply(this, args);
		};
	},

    portalManagerMessage = function(params) {
        bc.component.notify({
            uid: params.uid || Math.random.toString(26),
            icon: params.error || 'error',
            message: params.message || '',
            delay: params.delay || 5000
        });
    },

    path2obj = function(obj, path) {
		if (!obj) return {};
		if (!path) return obj;

		var splitted = path.split('.');
		var prefix = splitted[0];
		var type = splitted[1] && /^\d+$/.test(splitted[1]) && 'array' || 'object';
		path = splitted.slice(1).join('.');

		if (obj[prefix] === undefined && type == 'array') obj[prefix] = [];
		if (obj[prefix] === undefined && type == 'object') obj[prefix] = {};
		return path2obj(obj[prefix], path);
	},

    setPathOnObj = function(obj, path, val) {
		path = path.split('.');
		var key = path[path.length - 1];
		path = path.slice(0, -1).join('.');
        var target = path2obj(obj, path)[key];
        if (!target) {
            target = path2obj(obj, path);
            target[key] = typeof val === 'string' ? val : val.length ? [] : {};
            target = target[key];
        }
        if (typeof val !== 'string') {
            $.extend(true, target, val);
        }
	},

    getContextRoot = function() {
		return window.b$ &&
			b$.portal &&
			b$.portal.config &&
			b$.portal.config.serverRoot ||
			'';
	},

    getContentServiceProxyUrl = function (repositoryId) {
        repositoryId = repositoryId || 'contentRepository';
        return getContextRoot() + '/content/atom/' + repositoryId + '/';
    },

    getPortalName = function() {
		return window.b$ &&
			b$.portal &&
			b$.portal.portalName ||
			'';
	},

    keys = function(object) {
        var keys = [];
        for (var key in object) {
            if (object.hasOwnProperty(key)) {
                keys.push(key);
            }
        }
        return keys;
    },

    log = function() {
        var console = window.console || {
            log: function(){},
        };

        if(
            config.debug ||
            top.bd && top.bd.devMode || bd && bd.devMode ||
            (top.location.search && top.location.search.indexOf('debug=true') > -1))
        {
            console.log.apply(console, arguments);
        }
    },

    cleanup = function(str) {
        return str
            .replace(/ href=""/g,'')            // remove empty hrefs
            .replace(/ class=""/g,'')           // remove empty classes
            .replace(/>\s+</g,'><')             // space between tags
            .replace(/\{\uFEFF\{/g,'{{')        // invisible space
            .replace(/<!--[\s\S]*?-->/gi,'')    // remove html comments

            // ie8 specific
            .replace(/ sizcache[^=]+="[^"]*"/g,'')  // remove attr
            .replace(/=""/g,'');                    // fix empty attributes
    },

    config = {},


    /*----------------------------------------------------------------*/
    /* Helper to display the diff between 2 strings in console
    /* TO be cleaned up
    /*----------------------------------------------------------------*/
    consoleDiff = function ( o, n ) {

        if($('html').hasClass('ie')) {
            console.log(o);
            console.log(n);
            return { o : o , n : n };
        }
        else {
            var diff = function( o, n ) {
                var ns = {};
                var os = {};

                for ( var i = 0, nl = n.length; i < nl; i++ ) {
                    if ( ns[ n[i] ] == null ) {
                        ns[ n[i] ] = { rows: [], o: null };
                    }
                    ns[ n[i] ].rows.push( i );
                }

                for ( var i = 0 , ol = o.length; i < ol; i++ ) {
                    if ( os[ o[i] ] == null ) {
                        os[ o[i] ] = { rows: [], n: null };
                    }
                    os[ o[i] ].rows.push( i );
                }

                for ( var i in ns ) {
                    if ( ns[i].rows.length == 1 && typeof(os[i]) !== 'undefined' && os[i].rows.length == 1 ) {
                        n[ ns[i].rows[0] ] = { text: n[ ns[i].rows[0] ], row: os[i].rows[0] };
                        o[ os[i].rows[0] ] = { text: o[ os[i].rows[0] ], row: ns[i].rows[0] };
                    }
                }

                for ( var i = 0; i < n.length - 1; i++ ) {
                    if ( n[i].text != null && n[i+1].text == null && n[i].row + 1 < o.length && o[ n[i].row + 1 ].text == null && n[i+1] == o[ n[i].row + 1 ] ) {
                        n[i+1] = { text: n[i+1], row: n[i].row + 1 };
                        o[n[i].row+1] = { text: o[n[i].row+1], row: i + 1 };
                    }
              }

                for ( var i = n.length - 1; i > 0; i-- ) {
                    if ( n[i].text != null && n[i-1].text == null && n[i].row > 0 && o[ n[i].row - 1 ].text == null && n[i-1] == o[ n[i].row - 1 ] ) {
                        n[i-1] = { text: n[i-1], row: n[i].row - 1 };
                        o[n[i].row-1] = { text: o[n[i].row-1], row: i - 1 };
                    }
              }

              return { o: o, n: n };
            }

            var oSpace, nSpace, os = '%c', ns = '%c';
            o = o.replace(/\s+$/, '');
            n = n.replace(/\s+$/, '');
            oSpace = o.match(/\s+/g);
            nSpace = n.match(/\s+/g);

            if (oSpace == null) {
                oSpace = ["\n"];
            } else {
                oSpace.push("\n");
            }
            if (nSpace == null) {
                nSpace = ["\n"];
            } else {
                nSpace.push("\n");
            }

            var out = diff(o == "" ? [] : o.split(/\s+/), n == "" ? [] : n.split(/\s+/) );

            for (var i = 0, outOL = out.o.length; i < outOL; i++) {
                if (out.o[i].text != null) {
                    os +=  out.o[i].text + oSpace[i];
                } else {
                    os += '%c' + out.o[i] + oSpace[i] + '%c';
                }
            }

            for (var i = 0, outNL = out.n.length; i < outNL; i++) {
                if (out.n[i].text != null) {
                    ns += out.n[i].text + nSpace[i];
                } else {
                    ns += '%c' + out.n[i] + nSpace[i] + '%c';
                }
            }

            var osStyle = 'background:red;color:#fff;',
                nsStyle = 'background:green;color:#fff;',
                unghangeStyle = 'color: rgba(0,0,0,0.4);',
                logDiff = function(str, style1, style2){
                    var difs = str.match(/%c/g).length,
                        arr = [str].concat(
                            new Array(difs)
                                .join('.').split('.')
                                .map(function(el, i){
                                    return i%2 ? style1: style2;
                                })
                        );
                    // apply colors to console
                    console.log.apply(console, arr);
                };

            logDiff(os, osStyle, unghangeStyle);
            logDiff(ns, nsStyle, unghangeStyle);
            // console.log(os , unghangeStyle, osStyle, unghangeStyle );
            // console.log(ns , unghangeStyle, nsStyle, unghangeStyle );
            return { o : os , n : ns };

        }

    };

    $.extend($.expr[':'],{
        attr:function(o,i,m){
            var attrs=$.getAttrAll(o),re=m[3],found=false;
            $.each(attrs,function(k,v){
                if(new RegExp(re).test(v)) {
                    return found=true;
                }
            });
            return found;
        }
    });
    // get all attributes of an element
    $.getAttrAll=function(el){
        var rect = [];
        for (var i=0, attrs=el.attributes, len=attrs.length; i<len; i++){
            rect.push(attrs.item(i).nodeName);
        }
        return rect;
    };


	return {
		fbind1: fbind1,
		fnkbind: fnkbind,
		chain: chain,
		bind: bind,
        portalManagerMessage: portalManagerMessage,
		path2obj: path2obj,
		setPathOnObj: setPathOnObj,
		getContextRoot: getContextRoot,
        getContentServiceProxyUrl: getContentServiceProxyUrl,
		getPortalName: getPortalName,
        keys: keys,
        consoleDiff: consoleDiff,
        cleanup: cleanup,
        config: config,
        log: log
	};
});


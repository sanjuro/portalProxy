/**
 *  ----------------------------------------------------------------
 *  Copyright © 2003/2013 Backbase B.V.
 *  ----------------------------------------------------------------
 *  Author : Backbase R&D - Amsterdam - New York
 *  Filename : search.srv.js
 *  Description: migrate from the component.search.js
 *
 *  ----------------------------------------------------------------
 */
define([
    'jquery'
], function(jQuery) {
    'use strict';

    /* default command list */
        var DEFAULT_SEARCH_CMD = [
            {
                'cmd':'ref',
                'text':'References',
                'getQuery': function(item) {
                    return item.uuid ? 'refuuid:' + item.uuid : this.cmd + ':' + getItemQuery(item);
                },
                'getTooltip' : function(item) {
                    return getValFromQuery(getItemQuery(item));
                }
            },
            {
                'cmd':'uses',
                'text':'Uses content',
                'enableAutoSuggestion' : true,
                'getTooltip' : function(item) {
                    return getValFromQuery(item.query);
                }
            },
            {
                'cmd':'pub',
                'text':'Publishing states'
            },
            {
                'cmd':'@',
                'text':'Last edited by',
                'getTooltip' : function(item) {
                    return this.text + ': ' + getValFromQuery(item.query);
                }
            }
            /*{
                'cmd':'editdate',
                'text':'Last edited on',
            }
            */

        ],

        /* smart query command class */
        SearchCommand = function(customCmd) {
            // fetch from server
            var prop = { //default property function
                    'getLabel': function(item) { return this.cmd + ':' + getItemQuery(item); },
                    'getQuery': function(item) { return this.cmd + ':' + item.uuid; },
                    'getTooltip': function(item) { return getItemQuery(item); },
                    'enableAutoSuggestion': true
                },
                cmdWrap = function(cmdArray) {
                    var cmdObj = [], i,l,c, j,jLen,jCurrent;
                    for(j = 0, jLen = cmdArray.length; j < jLen; j++){
                        jCurrent = cmdArray[j];
                        for(i = 0, l = DEFAULT_SEARCH_CMD.length; i < l; i++){
                            c = DEFAULT_SEARCH_CMD[i];
                            if(jCurrent === c.cmd){
                                cmdObj.push(jQuery.extend({}, prop, c));
                            }
                        }
                    }
                    return cmdObj;
                },
                cmd = cmdWrap( customCmd || [] ); //jQuery.extend([], DEFAULT_SEARCH_CMD, customCmd),

            return {
                get : function(query, getAll) {
                    if(query === undefined || !(typeof(query) == 'string' || query instanceof String)) { return cmd; }
                    else {
                        var lowerCaseQuery = jQuery.trim(query.toLowerCase()),
                            grepFn = function (n) {
                                var trigger = n.cmd.toLowerCase() + ':';
                                return lowerCaseQuery.indexOf(trigger) === 0;
                            },
                            matchedCmd = lowerCaseQuery.length? jQuery.grep(cmd, grepFn) : [];

                        return matchedCmd.length ? ( getAll ? matchedCmd : matchedCmd[0] ) : null;
                    }
                }
            };

        },
        getValFromQuery = function(query) {
            var queryArray = query.split(':');
            if(queryArray.length > 1){
                queryArray.shift(); //remove the cmd
            }
            return queryArray.join(':'); //construct the searching value
        },
        getItemQuery = function(item) {
            return item.label ? item.label : item.query;
        };




    var bbSearchSrv = function($http, $q, $rootScope) {
        var self = this;

        // expose SearchCommand
        self.SearchCommand = SearchCommand;


    };

    return ['$http', '$q', '$rootScope', bbSearchSrv];
});

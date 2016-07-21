/**
 *  ----------------------------------------------------------------
 *  Copyright © 2003/2013 Backbase B.V.
 *  ----------------------------------------------------------------
 *  Author : Backbase R&D - Amsterdam - New York
 *  Filename : search.dir.js
 *  Description: migrate from the component.search.js
 *
 *  ----------------------------------------------------------------
 */
define([
    'angular'
    ,'jquery'
    ,'zenith/http/server-status'
    ,'dashboard/js/lib/jquery.tokeninput-1.6.0.batched'
    ,'css!dashboard/css/token-input-bb'
], function(angular, jQuery, Status) {
    'use strict';

    var $ = angular.element,//prevent conflict with Jquery and get different object

        EVENTS = {
            'ON_SEARCH' : 'onSearch.searchTokenInput',
            'ON_RESULT' : 'onResult.searchTokenInput',
            'ON_CANCEL' : 'onCancel.searchTokenInput'
        },


        //init the search field
        init = function (params, bbSearchSrv) {

            var self = {
                $template : params.template,
                $tokenizedInput : null,
                isAutoSuggestionCancel : false,
                SearchCmd : new bbSearchSrv.SearchCommand(params.cmd),//init the command object
                flg : false,
                changeToken : function(val, isFocus) {
                    //if(isOverLimit(this.$template))
                    this.$template.find('.bc-search-input').tokenInput("clear");
                    if(isFocus){
                        this.$tokenizedInput.focus();
                    }
                    if(jQuery.type( val ) === 'string'){
                        this.$tokenizedInput.val(val);
                    }
                }
            };


            // BOF TokenInput
            initSearchTokenInput.call(self, params);

            // BOF Command DropDown
            scopeSetup.call(self, params);

            bindEvent_generic.call(self, params);

            if(params.target) {
                $(params.target).append(self.$template);
            }

            // clean up
            $(document).bind('DOMNodeRemoved.search', function(ev) {
                if(ev.target === self.$template[0] || $(ev.target).find('.bc-search-container').length) {
                    self = null;
                    $(document).unbind('DOMNodeRemoved.search');
                }
            });

            //server detection
            //TODO: currenlty this will run twice if two search component inited in the page
            Status.solr.checkStatus().success(function(){
                if(params.target) {
                    $(params.target).find('.bc-search-container').removeClass('bc-search-container-hide');
                }
            }).fail(function(){
                if(params.target) {
                    $(params.target).find('.bc-search-container').remove();
                }
            });

            return {cmd : self.SearchCmd.get(), $template : self.$template};
        },

        /* BOF Search TokenInput */
        initSearchTokenInput = function(params) {
            var self = this,
                SearchCmd = self.SearchCmd,
                $template = self.$template,
                ps = params.tokenInputParams.ps ? params.tokenInputParams.ps : 10,
                defaultUrl = params.contextRoot.replace(/\/$/, '') + '/portals/'+ params.portalName +'/pagemanagement/search/suggestions',
                urlFn = function() {
                    var url = defaultUrl,
                        searchQuery = self.$tokenizedInput.val(),
                        cmd = SearchCmd.get(searchQuery);
                    url += '?ps='+ps+'&';

                    if((cmd && cmd.enableAutoSuggestion === false) || !searchQuery){
                        url = '';
                    }

                    if(params.tokenInputParams.urlFn && typeof params.tokenInputParams.urlFn === 'function'){
                        url = params.tokenInputParams.urlFn(url, searchQuery, cmd);
                    }

                    return url;
                },
                tokenInputParams = {
                    url: urlFn,
                    //minChars : 2,
                    queryParam : 'query',
                    animateDropdown: false,
                    hintText : '',
                    searchingText: '',
                    noResultsText : '',
                    deleteText : '',
                    tokenLimit : 1,
                    selectSuggestion : false,
                    enableComma : false,
                    clearOnBlur : false,
                    cache: false,
                    propertyToSearch : 'query',
                    preventDuplicates : true,
                    contentType : 'xml', //TokenInput is naming dataType to contentType
                    //searchDelay: 600,
                    resultsFormatter : function(item){
                        // console.log('resultsFormatter: ', item);
                        var inputVal = self.$tokenizedInput.val(),
                            itemQuery = getItemQuery(item),
                            cmdObj = SearchCmd.get(itemQuery),
                            title = cmdObj ? cmdObj.getTooltip(item) : item.query,
                            queryVal = cmdObj ? getValFromQuery(inputVal) : inputVal,
                            val = cmdObj ? getValFromQuery(itemQuery) : itemQuery;

                        //escape the special char for Regex
                        var regexp_special_chars = new RegExp('[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\-]', 'g');
                        queryVal = queryVal.replace(regexp_special_chars, '\\$&');

                        val = val.replace(new RegExp('('+queryVal+')','i'), '<strong>$1</strong>');

                        return '<li title="' + title + '"><span>'+val+'</span></li>';
                    },
                    tokenFormatter: function(item) {
                        // console.log('tokenFormatter: ', item);
                        var itemQuery = getItemQuery(item),
                            cmdObj = SearchCmd.get(itemQuery),
                            template = '';

                        if(cmdObj) {
                            template = '<li class="bc-tokenized bc-searchToken" title="' + cmdObj.getTooltip(item) + '">'+
                                '<div class="bc-searchToken-cmd"><div class="bc-searchToken-text">'+ getCmdFromQuery(itemQuery) +'</div></div>' +
                                '<div class="bc-searchToken-value"><div class="bc-searchToken-text">'+ getValFromQuery(itemQuery) +'</div></div>' +
                                '</li>';
                        }

                        return template;
                    },
                    tokenValue : function(item) {
                        // console.log('tokenValue: ', item);
                        return item.query;
                    },

                    onAdd: function(item) {
                        // console.log('onAdd: ', item);
                        detectAddToken(item, self);
                    },
                    onDelete: function() {
                        self.$tokenizedInput.focus();
                    },

                    onResult: function (data) {
                        //limit to cmd for now
                        var searchQuery = self.$tokenizedInput.val(),
                            matchedCmd = SearchCmd.get(searchQuery),
                            results = [];

                        //show the dropdown if user pressed ENTER after auto suggestion result from server
                        if(!self.isAutoSuggestionCancel){
                            //use jquery to conver the xml to json in case for the bootstrap ui
                            var customParam = params.tokenInputParams,
                                suggestions = [],
                                i,l,c, title, uuid, resultsObj = {};

                            if(customParam.resultData && typeof customParam.resultData === 'function'){
                                suggestions = customParam.resultData(data, searchQuery, matchedCmd);
                                //only accept array type
                                if(suggestions instanceof Array === false){
                                    suggestions = suggestionXmlToJson(data);
                                }
                            }else{
                                suggestions = suggestionXmlToJson(data);
                            }

                            for (i = 0, l = suggestions.length; i < l; i++) {
                                c = suggestions[i];
                                title = c.title;
                                uuid = c.uuid;
                                if(matchedCmd){
                                    resultsObj = {
                                        query: matchedCmd.getQuery({ uuid: uuid, label : title }),
                                        label: matchedCmd.getLabel({ uuid: uuid, label : title }), //( cmdName ? cmdName + ":" : '' ) + title,
                                        uuid : uuid,
                                        isCmdQuery : true
                                    };
                                }else{
                                    resultsObj = {
                                        query: title,
                                        label: title,
                                        uuid : uuid,
                                        isCmdQuery : false
                                    };
                                }
                                results.push(resultsObj);
                            }
                        }
                        //console.log('onResult: ', results);
                        return results;
                    }

                };

            //$('.token-input-dropdown').remove(); // make sure we have only one of these lying around

            tokenInputParams = jQuery.extend({}, tokenInputParams, params.tokenInputParams);
            $template.find('.bc-search-input').tokenInput( {} ,  tokenInputParams)
                .data('tokenLimit', tokenInputParams.tokenLimit);

            // set the jquery object after the the init
            self.$tokenizedInput = $template.find('.token-input-input-token').find('input').addClass('bc-tokenInput-input');

            bindEvent_searchTokenInput.call(self, params);
        },

        bindEvent_searchTokenInput = function() {
            var self = this,
                $template = self.$template;

            /* BOF // use bc-search-hiddenInput to handle the click, double click and backspace press */
            $template
                .on('click.searchTokenInput', '.bc-searchToken', function () {
                    $template.find('.bc-search-hiddenInput').focus();
                })
                .on('dblclick.searchTokenInput', '.bc-searchToken', function () {
                    var tokens = $template.find('.bc-search-input').tokenInput("get");
                    if(!tokens.length) return;
                    var token = tokens[0];
                    var query = token.label ? token.label : token.query;
                    self.changeToken(query,true);
                });
            $template.find('.bc-search-hiddenInput')
                .on('keydown.searchTokenInput', function(evt) {
                    if(evt.which === 8){//Backspace, escape
                        //TODO: should use "remove" instead of "clear"
                        self.changeToken('',true);
                    }else if(evt.which === 27){
                        evt.stopPropagation();
                        evt.preventDefault();
                        self.changeToken('',true);
                        return false;
                    }
                })
                .on('focus.searchTokenInput blur.searchTokenInput', function() {
                    this.value = '';
                });


            /* BOF // tokenized Input field event */
            self.$tokenizedInput.on('keydown.searchTokenInput', function(evt) {
                if (evt.keyCode === 27) {
                    evt.stopPropagation();
                    $(evt.target).trigger('blur');
                    self.isAutoSuggestionCancel = true;
                    $template.trigger(EVENTS.ON_CANCEL);
                    return false;
                }else if (evt.keyCode === 13) {
                    evt.stopPropagation();
                    self.isAutoSuggestionCancel = true;
                    detectAddToken(evt, self);
                    return false;
                }else{
                    self.isAutoSuggestionCancel = false;
                }
            }).on('blur.searchTokenInput', function() {
                self.isAutoSuggestionCancel = false;
            });
        },

        /* BOF generic event on the template */
        bindEvent_generic = function(params) {
            // show the result of search tag
            var self = this, $template = self.$template;

            $template.on(EVENTS.ON_SEARCH, function(evt, data, states) {
                if(!data || !data.query) return;
                states = states || {};

                var item = jQuery.extend({}, data), searchQuery = '',
                    $input = $template.find('.bc-search-input');

                searchQuery = getItemQuery(item);

                if(!states.isAdded) {
                    if(item.isCmdQuery === undefined){
                        item.isCmdQuery = self.SearchCmd.get(searchQuery) ? true : false;
                    }

                    if(states.clearInput) { $input.tokenInput("clear"); }

                    if(item.isCmdQuery){// its reference search
                        item.isAdded = true;
                        $input.tokenInput("add", item);
                    }else{// its normal search
                        self.$tokenizedInput.val(item.query);
                    }
                }

                if(searchQuery.length) { toggleSpinner($template, false); }

                if(isOverLimit($template)){ $template.find('.bc-search-hiddenInput').focus(); }

                //console.log('===================== RUN onSearch =====================');
                //returning the token and the actual value of the query
                if(params.onSearch) params.onSearch(item.isCmdQuery ? $input.tokenInput('get') : ($input.tokenInput('get')).concat(item));

            });

            $template.on(EVENTS.ON_RESULT, function(evt, data) {
                toggleSpinner($template, false);
                if(params.onResult) params.onResult(data);
            });

            $template.on(EVENTS.ON_CANCEL, function(evt, data) {
                self.changeToken('');
                toggleSpinner($template, false);
                if(params.onCancel) params.onCancel(data);
            });

        },
        /* EOF generic event on the template */

        /* BOF scope variable and function setup */
        scopeSetup = function(params) {
            var self = this;

            //assign dropdownOpts
            params.scope.dropdownOpts = self.SearchCmd.get();


            //scope functions
            params.scope.focusInput = function() {
                self.$tokenizedInput.trigger('focus');
            };

            params.scope.dropdownClick = function($evt, opts){
                self.changeToken(opts.cmd + ':', true);
                //TODO: if dropdown not close, force to close

            };

            /* cancel button */
            params.scope.cancel = function() {
                self.$template.trigger(EVENTS.ON_CANCEL);
            };

            //loading spinner
            //$searchBtn.find('li.bc-icn').removeClass('bc-action').addClass('bc-search-black');

        },

        /* BOF Utils functions */
        getCmdFromQuery = function(query) {
            var queryArray = query.split(':');
            return queryArray.length > 1? queryArray[0].toLowerCase() : '';
        },
        getValFromQuery = function(query) {
            var queryArray = query.split(':');
            if(queryArray.length > 1){
                queryArray.shift(); //remove the cmd
            }
            return queryArray.join(':'); //construct the searching value
        },
        isOverLimit = function($template) {
            var $input = $template.find('.bc-search-input'),
                tokenLen = $input.tokenInput("get").length,
                tokenLimit = $input.data('tokenLimit');

            return tokenLen >= tokenLimit;
        },
        getItemQuery = function(item) {
            return item.label ? item.label : item.query;
        },
        toggleSpinner = function($template, action) {
            return;
            var $searchBtn = $('.bc-search-button', $template).find('li.bc-icn');
            if(action === true){
                $searchBtn.removeClass('bc-search-black').addClass('bc-icn-spinner');
            }else{
                $searchBtn.removeClass('bc-icn-spinner').addClass('bc-search-black');
            }
        },
        detectAddToken = function(ev, self) {
            if(!ev) return;
            var query, item = {}, states = {};

            if(ev.target){//ENTER pressed
                query = $(ev.target).val();
                if(query){
                    if (self.flg) { self.flg = false; }
                    else { item = { query : query }; }
                }
            }else if(ev.isAdded){//already added
                delete ev.isAdded;
                return;
            }else if(ev.query){//onAdd
                item = ev;
                query = ev.label ? ev.label : ev.query;
                if(self.SearchCmd.get(query)){//has token
                    states.isAdded = true;
                }else{//no token
                    self.$tokenizedInput.val(query);
                    self.flg = true;
                    //TODO: find a way to detect the keypress in here, set back the flg by timeout
                    window.setTimeout(function() { self.flg = false; } , 300);
                }
            }

            self.$template.trigger(EVENTS.ON_SEARCH, [ item, states ]);
        },
        suggestionXmlToJson = function(xml) {
            var suggestions = jQuery(xml).find('suggestion'),
                i,l,c, title, uuid, results = [];
            for (i = 0, l = suggestions.length; i < l; i++) {
                c = jQuery(suggestions[i]);
                title = c.find('title').text();
                uuid = c.find('uuid').text();
                results.push({
                    title : title,
                    uuid : uuid
                });
            }
            return results;
        }
        /* EOF Utils functions */
        ;




    var bbToolbarSearch = function($rootScope, bbSearchSrv) {
        return {
            scope: {
                id : '=?',
                portalName : '=?',
                cmd : '=?',
                // optional event
                onSearch : '=?',
                onResult : '=?',
                onCancel : '=?'

            },
            templateUrl : $rootScope.serverRoot + '/static/backbase.com.2014.components/modules/search/templates/search.html',
            // controller : function($scope, $element, $attrs, $transclude) { },
            link: function(scope, $element, attrs) {

                scope.dropdownOpts = [];
                //console.log(scope.cmd);
                //param for searchTokenInput
                var params = {
                        scope : scope,
                        tokenInputParams : {
                            idPrefix: scope.id || 'token-input-bbSearch'+ Math.floor(Math.random() * 10000000)
                        },
                        cmd : scope.cmd || [  ], //['ref', 'uses', 'pub', '@']
                        target : $element,
                        template : $element.find('.bc-search-container'),
                        portalName : scope.portalName || $rootScope.portalName || 'dashboard',
                        contextRoot :  $rootScope.serverRoot  || '/',
                        'onSearch' : function(data){
                            console.log('onSearch.bbSearch', data);
                            if(scope.onSearch && angular.isFunction(scope.onSearch)) scope.onSearch(data);
                        },
                        'onResult' : function(data){
                            console.log('onResult.bbSearch', data);
                            if(scope.onResult && angular.isFunction(scope.onResult)) scope.onResult(data);
                        },
                        'onCancel' : function(data){
                            console.log('onCancel.bbSearch', data);
                            if(scope.onCancel && angular.isFunction(scope.onCancel)) scope.onCancel(data);
                            // if (attrs.bbToolbarSearch){
                                // scope.$apply(function(){
                                //     scope.$eval(attrs.bbToolbarSearch + "=''");
                                // });
                            // }
                         }
                    },

                    searchTokenInput = init(params, bbSearchSrv),
                    $template = searchTokenInput.$template,
                    $tokenizedInput = $template.find('.bc-tokenInput-input');


                // if (attrs.bbToolbarSearch){
                //     $tokenizedInput.attr('data-ng-model', attrs.bbToolbarSearch);
                // }

                //add bootStrap css class
                $template.find('.token-input-list').addClass('form-control');
                $tokenizedInput.addClass('input-sm');

                //compile the inner template to initialize the angularjs ui dropdown
                //$compile($element.contents())(scope);

            }
        };
    };

    return  ['$rootScope', 'bbSearchSrv', bbToolbarSearch] ;
});

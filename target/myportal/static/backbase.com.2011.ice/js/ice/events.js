/**
 * Copyright © 2013 Backbase B.V.
 */
if (!window.be) window.be = {};
if (!window.be.ice) window.be.ice = {};

be.ice.events = (function ($) {
    'use strict';

    var iceEvents = {
        listeners: {},
        cleaners: {}
    };

    var config = {
        names: []
    };

    var registerEventListener = function(name, fn) {
        iceEvents.listeners[name] = fn;
    };

    var registerEventCleaner = function(name, fn) {
        iceEvents.cleaners[name] = fn;
    };

    // attach widget events
    // runs once during the initialization of each widgets
    var attachEvents = function(domnode, widget){

        var names = config.names || [];

        // attach all widget events
        names.forEach(function(name) {
            attach(name, domnode, widget);
        });

        return domnode;
    };

    var detachEvents = function(domnode){
        var names = config.names || [];
        names.forEach(function(name) {
            detach(name, domnode);
        });
        return domnode;
    };


    /**
     * This function initializing an event listener from a mapper
     *
     * @param  {string}  eventName - event should be registered before it could be used
     * @param  {element} domnode   - target html element
     * @param  {object}  data      - optional parameters
     * @return {element}           - dom element with attached listeners
     */
    var attach = function(eventName, domnode, data){
        // console.log('attach', eventName);
        eventName &&
        iceEvents.listeners[eventName] &&
        iceEvents.listeners[eventName](domnode, data);

        return domnode;
    };

    var detach = function(eventName, domnode){
        eventName &&
        iceEvents.cleaners[eventName] &&
        iceEvents.cleaners[eventName](domnode);

        return domnode;
    };


    return {
        registerEventListener: registerEventListener,
        registerEventCleaner: registerEventCleaner,
        attachEvents: attachEvents,
        detachEvents: detachEvents,
        attach: attach,
        detach: detach,
        config: config
    };
})(jQuery);

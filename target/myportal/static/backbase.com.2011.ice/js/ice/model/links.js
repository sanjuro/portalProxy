/**
 *  ----------------------------------------------------------------
 *  Copyright © 2003/2013 Backbase B.V.
 *  ----------------------------------------------------------------
 *  Author : Backbase R&D - Amsterdam - New York
 *  Filename : links.js
 *  Description:
 *
 *  ----------------------------------------------------------------
 */


be.utils.define('be.ice.model.links', [
    'be.ice.util'
], function (util) {

    'use strict';

    var getLinkPath = function(linkData){
        var path = '';

        if (linkData.referencedItem) {
            path = util.getContextRoot() + '/' + linkData.finalUrl;
        } else if(linkData.itemType == 'externalLink') {
            path = linkData.finalUrl;
        }

        return path;
    };

    var resolveLink = function(link) {
        var resolve = function() {
            link.path = '';
            return $.Deferred().resolve(link);
        };

        if(link.uuid) {
            return getLinkByUUID(link.uuid).then(function(linkData) {
                link.path = getLinkPath(linkData);
                return link;
            }, resolve);
        } else {
            resolve();
        }
    };

    var getLinkByUUID = function(uuid){
        return top.bd.pm.controller.onLinkByUUID(uuid, 'ice-getLinkByUUID');
    }

    // linkmodel api bridge
    return {
        getLinkPath: getLinkPath,
        resolveLink: resolveLink,
        getLinkByUUID: getLinkByUUID
    };

});

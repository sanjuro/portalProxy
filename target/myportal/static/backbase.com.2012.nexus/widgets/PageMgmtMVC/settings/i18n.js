/*
 *  ----------------------------------------------------------------
 *  Copyright Backbase b.v. 2003/2013
 *  All rights reserved.
 *  ----------------------------------------------------------------
 *  Version 5.5
 *  Author : Backbase R&D - Amsterdam - New York
 *  Filename : i18n.js
 *  Description: General static text messages
 *
 *  ----------------------------------------------------------------
 */

window.bd.pm = window.bd.pm || {};


be.utils.define('bd.pm.msg', function() {
    var i18n = {
        MSG_ITEM_LOCKED                  : "You cannot change the hierarchy in this section because it is (partly) locked for publication",
        //MSG_NO_EDITING                 : "You do not have sufficient permissions to edit this page",
        //MSG_ADD_LINKS                  : "This portal contains pages without links, please run database migration scripts to add links.",
        TTL_MOVE_PUB_ITEMS               : "MOVE PUBLISHED ITEM(S)",
        MSG_MOVE_PUB_ITEMS               : "Are you sure you want to move the selected published item(s)?",
        MSG_SELECT_PARENT                : "Select the parent of the items to show",
        ERR_LOCK_LINK_ADD                : "Unable to add, because parent node is locked",
        ERR_LOCK_LINK_EDIT               : "Unable to modify, because parent node is locked",
        ERR_LOCK_LINK_DELETE             : "Unable to delete, because parent node is locked",
        ERR_PUB_LINK_DELETE              : "Unable to delete, because there are one or more published nested items",
        BTN_CANCEL_TXT                   : "Cancel",
        BTN_MOVE_TXT                     : "Move",
        ERR_LINK_UPDATE                  : "Unable to update the link, Please try again.",
        ERR_AJAX_REFRESH                 : "Ajax Error: Could not load refreshed page data!",
        MSG_NO_DUPLICATE                 : "You do not have permission to duplicate",
        MSG_NO_REMOVE                    : "You do not have permission to remove",
        MSG_NO_PROTOCOL                  : "The Url doesn't contain a protocol. <br/> Are you sure you want to save it?",
        ACCESS_DENIDED_TITLE             : "Access denied",
        ACCESS_DENIDED_MSG               : 'The requested page requires authorization. Please login with a valid Username and Password.',
        ACCESS_DENIDED_WARNING           : 'You do not have permission to access this page.',
        SERVER_ERROR                     : 'The page is not rendered correctly.',
        MSG_NO_MASTER_PAGE               : "You can not edit the settings of this page because you do not have permissions on the used master page.",
        MSG_NO_PERMISSION_ON_MASTER_PAGE : "You do not have permissions to view the selected master page",
        TITLE_DELETE                     : "Delete",
        TITLE_ACTION                     : "Action",
        TITLE_DETAILS                    : "View details",
        TITLE_DETAILS_CLOSE              : "Close details",
        TITLE_PUBLISH                    : "Publish",
        TITLE_PUB_PROGRESS               : "Currently in a publication",
        //default landing page
        ERR_SET_DEFAULT_LANDING_PAGE     : "Item is in publication process"
    };

    return i18n;
});

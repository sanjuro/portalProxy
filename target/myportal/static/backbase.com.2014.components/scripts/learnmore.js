/* globals $ */
/**
 *  ----------------------------------------------------------------
 *  Copyright © 2003/2014 Backbase B.V.
 *  ----------------------------------------------------------------
 *  Author: Backbase R&D - Amsterdam - New York
 *  Filename: nativeDnD.js (native drag&drop)
 *  Description: this module is used to add baseUrl and version for 
 *  all 'learn more' documentation links across portal.
 *  ----------------------------------------------------------------
 */

define(function (require, exports, module) {

    'use strict';

    $(document).mouseover(function(e){
        var $target = $(e.target);

        if($target.hasClass('bc-doc-link')){
            $target.attr('href', $target.attr('href')
                .replace('{bbDocUrl}', bd.uiEditingOptions.backbaseDocumentation.baseDocUrl)
                .replace('{bbDocVersion}', bd.uiEditingOptions.backbaseDocumentation.docVersion));
        }
    });
});
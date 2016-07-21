window.be = window.be || {};
window.be.ice = window.be.ice || {};

// ICE configuration

be.ice.config = {

    // widget events
    events: [
        'init-drop',
        'init-ckeditor',
        'incontextnav'
    ],

    // widget mappers
    mappers: [
        'plaintext',
        'image',
        'link',
        'richtext',
        'mustache',
        'richtext-link',
        'richtext-image',
        'mustache'
    ],


    ckeditor: {
        // this name could be used in the mapper to configure CKEditor
        plaintext: {
            allowedContent : '!*',
            extraAllowedContent : '!*',
            enterMode : 2 //CKEDITOR.ENTER_BR (2) – lines are broken with <br> elements;
        }
    },

    /**
     * Function is used to generate content path for new content saved in cmis
     * @param  {[string]} widgetName - name of content widget
     * @return {[string]} example: "/Generated content/myportal/mypage/ContentWidget_123"
     */
    getContentPath: function(widgetName){
        'use strict';
        var generatedUrl = be.utils.module('top.bd.PageMgmtTree.selectedLink.properties.generatedUrl')['value'];
        return ('/Generated content/' +
            (generatedUrl ? generatedUrl + '/' : '') +
            (widgetName ? widgetName : ''));
    }
};

/**
 * @license Copyright (c) 2003-2013, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.html or http://ckeditor.com/license
 */

CKEDITOR.editorConfig = function( config ) {
	// Define changes to default configuration here. For example:
	// config.language = 'fr';
	// config.uiColor = '#AADC6E';
    config.skin='moono-dark';
    config.title = false;

    //config.enterMode = CKEDITOR.ENTER_BR;

	// config.allowedContent = true; //This will disable the all filters, Please don't disable the filter unless you really know what you are doing.
	// config.extraAllowedContent = 'a[*]; img[*]{width,height}';

    // To be consistent with rendering filter use the same whitelist in CKEditor
    // https://my.backbase.com/resources/documentation/portal/5.5.1/howiceworks_whitelist.html
    config.allowedContent = {
        '$1': {
            elements: [
                'a', 'b', 'big', 'blockquote', 'br', 'caption', 'cite', 'code', 'col', 'colgroup', 'dd',
                'del', 'div', 'dl', 'dt', 'em', 'font', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'i', 'img',
                'ins', 'li', 'o', 'ol', 'p', 'pre', 'q', 's', 'small', 'span', 'strike', 'strong', 'sub',
                'sup', 'table', 'tbody', 'td', 'tfoot', 'th', 'thead', 'tr', 'tt', 'u', 'ul'
            ],
            attributes: [
                'alink', 'bgcolor', 'border', 'class', 'cellpadding', 'cellspacing', 'color', 'cols',
                'coords', 'dir', 'face', 'hspace', 'ismap', 'lang', 'marginheight', 'marginwidth',
                'multiple', 'nohref', 'noresize', 'noshade', 'nowrap', 'ref', 'rel', 'rev', 'rows',
                'scrolling', 'shape', 'tabindex', 'usemap', 'valign', 'value', 'vlink', 'vspace'
            ],
            styles: [
                '-moz-border-radius', '-moz-border-radius-bottomleft', '-moz-border-radius-bottomright',
                '-moz-border-radius-topleft', '-moz-border-radius-topright', '-moz-box-shadow', '-moz-outline',
                '-moz-outline-color', '-moz-outline-style', '-moz-outline-width', '-o-text-overflow',
                '-webkit-border-bottom-left-radius', '-webkit-border-bottom-right-radius', '-webkit-border-radius',
                '-webkit-border-radius-bottom-left', '-webkit-border-radius-bottom-right', '-webkit-border-radius-top-left',
                '-webkit-border-radius-top-right', '-webkit-border-top-left-radius', '-webkit-border-top-right-radius',
                '-webkit-box-shadow', 'azimuth', 'background', 'background-attachment', 'background-color',
                'background-image', 'background-position', 'background-repeat', 'border', 'border-bottom', 'border-bottom-color',
                'border-bottom-left-radius', 'border-bottom-right-radius', 'border-bottom-style', 'border-bottom-width',
                'border-collapse', 'border-color', 'border-left', 'border-left-color', 'border-left-style', 'border-left-width',
                'border-radius', 'border-right', 'border-right-color', 'border-right-style', 'border-right-width',
                'border-spacing', 'border-style', 'border-top', 'border-top-color', 'border-top-left-radius',
                'border-top-right-radius', 'border-top-style', 'border-top-width', 'border-width', 'box-shadow',
                'caption-side', 'color', 'cue', 'cue-after', 'cue-before', 'direction', 'elevation', 'empty-cells',
                'font', 'font-family', 'font-size', 'font-stretch', 'font-style', 'font-variant', 'font-weight', 'height',
                'image()', 'letter-spacing', 'line-height', 'linear-gradient()', 'list-style', 'list-style-image',
                'list-style-position', 'list-style-type', 'margin', 'margin-bottom', 'margin-left', 'margin-right',
                'margin-top', 'max-height', 'max-width', 'min-height', 'min-width', 'outline', 'outline-color', 'outline-style',
                'outline-width', 'padding', 'padding-bottom', 'padding-left', 'padding-right', 'padding-top', 'pause',
                'pause-after', 'pause-before', 'pitch', 'pitch-range', 'quotes', 'radial-gradient()', 'rect()',
                'repeating-linear-gradient()', 'repeating-radial-gradient()', 'rgb()', 'rgba()', 'richness', 'speak',
                'speak-header', 'speak-numeral', 'speak-punctuation', 'speech-rate', 'stress', 'table-layout', 'text-align',
                'text-decoration', 'text-indent', 'text-overflow', 'text-shadow', 'text-transform', 'text-wrap', 'unicode-bidi',
                'vertical-align', 'voice-family', 'volume', 'white-space', 'width', 'word-spacing', 'word-wrap'
            ]
        },

        '$2': {
            elements: 'a',
            attributes: [
                'href', 'src', 'target', 'title', 'data-ice-link-ref', 'data-ice-content-path', 'data-ice-link-name', 'data-ice-rtlink', 'data-ice-target', 'data-ice-link'
            ]
        },

        '$3': {
            elements: [
                'blockquote', 'q'
            ],
            attributes: 'cite'
        },

        '$4': {
            elements: [
                'col', 'colgroup'
            ],
            attributes: [
                'span', 'width'
            ]
        },

        '$5': {
            elements: 'img',
            attributes: [
                'align', 'alt', 'height', 'href', 'src', 'title', 'width', 'data-ice-content-path', 'data-ice-content-preview'
            ]
        },

        '$6': {
            elements: 'ol',
            attributes: [
                'start', 'type'
            ]
        },

        '$7': {
            elements: 'table',
            attributes: [
                'summary', 'width'
            ]
        },

        '$8': {
            elements: 'td',
            attributes: [
                'abbr', 'axis', 'colspan', 'rowspan', 'width'
            ]
        },

        '$9': {
            elements: 'th',
            attributes: [
                'abbr', 'axis', 'colspan', 'rowspan', 'scope', 'width'
            ]
        },

        '$10': {
            elements: 'ul',
            attributes: 'type'
        }
    };
};

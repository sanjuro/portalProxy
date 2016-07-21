/***
 * Default ckEditor image plugin implementation for all ice widgets.
 * Copyright © 2011 Backbase B.V.
 */
(function(window, document, jQuery, CKEDITOR, bd){

    'use strict';
    if(!CKEDITOR) return;
    CKEDITOR.plugins.add( 'iceLink', {
        init: function( editor ) {
            var addIceLinkCmd = editor.addCommand( 'bindIceLink', new CKEDITOR.dialogCommand('bindIceLink'));

            //add the button and link the command
            editor.ui.addButton( 'bindIceLink', {
                label: 'Ice Link',
                command: 'bindIceLink',
                icon: 'Link'
            });
            editor.on('doubleclick', function(e){
                var linkElm = CKEDITOR.plugins.iceLink.getSelectedLink(editor) || e.data.element;
                if(linkElm && linkElm.hasAttribute('data-parentid') && editor.filter.check('a')){ //also check if the field allow link tag
                    e.data.dialog = 'bindIceLink';
                }
            });

            editor.on('paste', function(e){
                var linkElm = CKEDITOR.plugins.iceLink.getSelectedLink(editor) || e.data.element;
                if(linkElm && linkElm.hasAttribute('data-parentid')){
                    e.stop();
                    var elm = linkElm.$;
                    var range = be.utils.getCursor(elm);
                    range.replace(document.createTextNode(e.data.dataValue));
                    var textNode = CKEDITOR.plugins.iceLink.findTextNode(elm);
                    CKEDITOR.plugins.iceLink.convert2SingleTextNode(textNode);
                }
            });
        }
    });

    CKEDITOR.dialog.add( 'bindIceLink', function( editor ) {
        /** get the image information */
        var commonLang = editor.lang.common,
            linkLang = editor.lang.link,
            dialogDefinition = {
                title: 'Ice Link',
                minWidth: 350,
                minHeight: 230,
                contents: [{
                    id: 'Ice Link Info',
                    label: 'Ice Link Info',
                    title: 'Ice Link Info',
                    elements: [{
                        type: 'vbox',
                        id: 'urlOptions',
                        children: [{
                            type: 'hbox',
                            widths: ['25%', '75%'],
                            children: [{
                                id: 'protocol',
                                type: 'select',
                                label: commonLang.protocol,
                                'default': 'http://',
                                items: [
                                    // Force 'ltr' for protocol names in BIDI. (#5433)
                                    ['http://\u200E', 'http://'],
                                    ['https://\u200E', 'https://'],
                                    ['ftp://\u200E', 'ftp://'],
                                    ['news://\u200E', 'news://'],
                                    [linkLang.other, '']
                                ],
                                setup: function(data) {
                                    if (data.url)
                                        this.setValue(data.url.protocol || 'http://');
                                },
                                commit: function(data) {
                                    if (!data.url)
                                        data.url = {};

                                    data.url.protocol = this.getValue();
                                }
                            }, {
                                type: 'text',
                                id: 'url',
                                label: commonLang.url,
                                required: true,
                                onLoad: function() {
                                    this.allowOnChange = true;
                                },
                                onKeyUp: function() {
                                    this.allowOnChange = false;
                                    var protocolCmb = this.getDialog().getContentElement('info', 'protocol'),
                                        url = this.getValue(),
                                        urlOnChangeProtocol = /^(http|https|ftp|news):\/\/(?=.)/i,
                                        urlOnChangeTestOther = /^((javascript:)|[#\/\.\?])/i;

                                    var protocol = urlOnChangeProtocol.exec(url);
                                    if (protocol) {
                                        this.setValue(url.substr(protocol[0].length));
                                        protocolCmb.setValue(protocol[0].toLowerCase());
                                    } else if (urlOnChangeTestOther.test(url))
                                        protocolCmb.setValue('');

                                    this.allowOnChange = true;
                                },
                                onChange: function() {
                                    if (this.allowOnChange) // Dont't call on dialog load.
                                        this.onKeyUp();
                                },
                                validate: function() {
                                    var dialog = this.getDialog();

                                    if (dialog.getContentElement('info', 'linkType') && dialog.getValueOf('info', 'linkType') != 'url')
                                        return true;

                                    if ((/javascript\:/).test(this.getValue())) {
                                        alert(commonLang.invalidValue);
                                        return false;
                                    }

                                    if (this.getDialog().fakeObj) // Edit Anchor.
                                        return true;

                                    var func = CKEDITOR.dialog.validate.notEmpty(linkLang.noUrl);
                                    return func.apply(this);
                                },
                                setup: function(data) {
                                    this.allowOnChange = false;
                                    if (data.url)
                                        this.setValue(data.url.url);
                                    this.allowOnChange = true;

                                },
                                commit: function(data) {
                                    // IE will not trigger the onChange event if the mouse has been used
                                    // to carry all the operations #4724
                                    this.onChange();

                                    if (!data.url)
                                        data.url = {};

                                    data.url.url = this.getValue();
                                    this.allowOnChange = false;
                                }
                            }]
                        }]
                    },
                    {
                        type: 'vbox',
                        id: 'elmAttr',
                        children: [{
                            type: 'hbox',
                            widths: ['15%', '85%'],
                            children: [{
                                type: 'text',
                                label: 'Title',
                                'default': '',
                                id: 'advTitle',
                                setup: function(data) {
                                    if (data.title)
                                        this.setValue(data.title || '');
                                },
                                commit: function(data) {
                                    if (!data.title)
                                        data.title = {};

                                    data.title = this.getValue();
                                }
                            }]
                        }]
                    },
                    {
                        type: 'vbox',
                        id: 'elmLabel',
                        children: [{
                            type: 'hbox',
                            widths: ['15%', '85%'],
                            children: [{
                                type: 'text',
                                label: 'Label',
                                //requiredContent: 'a[title]',
                                'default': '',
                                id: 'advLabel',
                                setup: function(data) {
                                    if (data.label)
                                        this.setValue(data.label || '');
                                },
                                commit: function(data) {
                                    if (!data.label)
                                        data.label = {};

                                    data.label = this.getValue();
                                }
                            }]
                        }]
                    }]
            }],
            onShow: function(e, b) {
                var element = null, href = '', retval={}, urlMatch, title = '', label = '',
                    urlRegex = /^((?:http|https|ftp|news):\/\/)?(.*)$/;

                // Fill in all the relevant fields if there's already one link selected.
                if ((element = CKEDITOR.plugins.iceLink.getSelectedLink(editor)) && element.hasAttribute('href')){
                    href = element.getAttribute('href');
                    title = element.getAttribute('title');
                    label = CKEDITOR.plugins.iceLink.getLinkText(element.$);
                }

                if ( href && ( urlMatch = href.match( urlRegex ) ) ) {
                    retval.type = 'url';
                    retval.url = {};
                    retval.url.protocol = urlMatch[ 1 ];
                    retval.url.url = urlMatch[ 2 ];
                }
                retval.title = title;
                retval.label = label;
                this.setupContent(retval);
            },

            onOk: function() {
                var attributes = {},
                    data = {},
                    element = CKEDITOR.plugins.iceLink.getSelectedLink(editor);

                this.commitContent(data);
                if(element){
                    var protocol = (data.url && data.url.protocol !== undefined) ? data.url.protocol : 'http://',
                        url = (data.url && CKEDITOR.tools.trim(data.url.url)) || '';
                    attributes['href'] = (url.indexOf('/') === 0) ? url : protocol + url;
                    attributes['title'] = data.title;
                    element.setAttributes(attributes);
                    if(data.label) CKEDITOR.plugins.iceLink.replaceLinkText(data.label, element.$);
                    bd.iceEvents.onSave(jQuery(element.$));
                }
            }
        };
        return dialogDefinition;
    });

    CKEDITOR.plugins.iceLink = {
        getSelectedLink : function( editor ) {
            var selection = editor.getSelection();
            var selectedElement = selection.getSelectedElement();
            if ( selectedElement && selectedElement.is( 'a' ) )
                return selectedElement;

            var range = selection.getRanges( true )[ 0 ];

            if ( range ) {
                range.shrink( CKEDITOR.SHRINK_TEXT );
                return editor.elementPath(range.getCommonAncestor()).contains( 'a', false);
            }
            return null;
        },

        findTextNode: function(element) {
            var num = element.childNodes.length;

            for (var count = 0; count < num; count++) {
                var currentNode = element.childNodes[count];

                if (currentNode.nodeType == 3) /* its a text node */ {
                    return currentNode;
                } else if (currentNode.nodeType == 1) /* its an element node */ {
                    currentNode = this.findTextNode(currentNode);
                    if (currentNode !== null) {
                        return currentNode;
                    }
                }
            }
            return null;
        },

        /* searches for the first text node and replaces it */
        replaceLinkText: function(newText, anchor) {
            if (anchor.childNodes) {
                var textNode = this.findTextNode(anchor);

                if (textNode !== null) {
                    textNode.nodeValue = newText;
                }else{
                    anchor.appendChild(document.createTextNode(newText));
                }
            }else{
                anchor.appendChild(document.createTextNode(newText));
            }
        },

        getLinkText: function(anchor) {
            if (anchor.childNodes) {
                var textNode = this.findTextNode(anchor);

                if (textNode !== null) {
                    return textNode.nodeValue;
                }
            }
            return '';
        },
        convert2SingleTextNode : function(textNode) {
            var siblingNode = textNode.nextSibling;
            if(siblingNode && siblingNode.nodeType == 3){
                textNode.nodeValue += siblingNode.nodeValue;
                siblingNode.remove();
                this.convert2SingleTextNode(textNode);
            }
        }
    };

    //add the ice link plugin
    CKEDITOR.config.extraPlugins = 'iceLink' + (CKEDITOR.config.extraPlugins.length > 1 ? ',' + CKEDITOR.config.extraPlugins : '');


})(window, document, jQuery, CKEDITOR, bd);

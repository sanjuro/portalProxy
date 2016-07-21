/***
 * Default ckEditor image plugin implementation for all ice widgets.
 * Copyright © 2011 Backbase B.V.
 */
;(function($, CKEDITOR, be){

    'use strict';


    if(!CKEDITOR) return;

    /* Private functions */

    var getLinkData = function(uuid){
        return top.bd.pm.controller.onLinkByUUID(uuid);
    };

    var removeValidationErrors = function (context) {
        $('ul.token-input-list', context).parent().find('label.error').remove();
    };
    var validateOnTokenData = function (linkLang, instance) {
        var context = instance.getDialog().getElement().$,
            func = CKEDITOR.dialog.validate.notEmpty(linkLang.noUrl);

        removeValidationErrors(context);

        if(func.apply(instance) !== true){
            $('ul.token-input-list', context).parent().append('<label class="error" for="' + instance.getInputElement().$.id + '">Not an existing menu item</div>');
            return false;
        }else{
            return true;
        }
    };

    CKEDITOR.plugins.add( 'iceMLink', {
        init: function( editor ) {
            editor.addCommand( 'bindIceMLink', new CKEDITOR.dialogCommand('bindIceMLink'));

            //add the button and link the command
            editor.ui.addButton( 'bindIceMLink', {
                label: 'Managed Link',
                command: 'bindIceMLink',
                icon: 'Link'
            });
            //On paste we just change the content of the link.
            editor.on('paste', function(e){
                var linkElm = CKEDITOR.plugins.iceLink.getSelectedLink(editor) || e.data.element;
                if(linkElm){
                    e.stop();
                    var elm = linkElm.$;
                    var range = be.utils.getCursor(elm);
                    range.replace(document.createTextNode(e.data.dataValue));
                    var textNode = CKEDITOR.plugins.iceLink.findTextNode(elm);
                    CKEDITOR.plugins.iceLink.convert2SingleTextNode(textNode);
                }
            });
            editor.on( 'doubleclick', function( evt ) {
                var element = CKEDITOR.plugins.iceMLink.getSelectedLink( editor ) || evt.data.element;
                if ( !element.isReadOnly() ) {
                    if ( element.is( 'a' ) ) {
                        evt.data.dialog = 'bindIceMLink';
                    }
                }
            });

            if ( editor.contextMenu ) {
                if ( editor.addMenuItem ) {
                    editor.addMenuGroup( 'linkGroup' );
                    editor.addMenuItems({
                        'iceMLink': {
                            label: 'Link',
                            command: 'bindIceMLink',
                            icon: 'Link',
                            group: 'linkGroup',
                            order: 1
                        },
                        'unlink': {
                            label: editor.lang.link.unlink,
                            command: 'unlink',
                            icon: 'unlink',
                            group: 'linkGroup',
                            order: 5
                        }
                    });
                }
                editor.contextMenu.addListener( function( element ) {
                    if ( !element || element.isReadOnly() )
                        return null;
                    var linkElm  = CKEDITOR.plugins.iceMLink.getSelectedLink( editor );

                    if ( !linkElm )
                        return null;

                    return {iceMLink: CKEDITOR.TRISTATE_OFF};
                });
            }

        }
    });

    CKEDITOR.dialog.add( 'bindIceMLink', function( editor ) {
        /** get the image information */
        var onBlur,
            commonLang = editor.lang.common,
            linkLang = editor.lang.link,
            dialogDefinition = {
                title: 'Link',
                minWidth: 350,
                minHeight: 200,
                contents: [{
                    id: 'Ice Link Info',
                    label: 'Ice Link Info',
                    title: 'Ice Link Info',
                    elements: [{
                        type: 'vbox',
                        id: 'urlOptions',
                        children: [{
                            type: 'hbox',
                            widths: ['75%', '25%'],
                            children: [{
                                type: 'text',
                                id: 'url',
                                label: 'Link', //commonLang.url,
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
                                onShow: function () {
                                    removeValidationErrors(this.getDialog().getElement().$);
                                    $('.token-input-input-token input').css('width', '100%');
                                },
                                onChange: function() {
                                    if (this.allowOnChange) // Don't call on dialog load.
                                        this.onKeyUp();
                                },
                                onBlur: function () {
                                    validateOnTokenData(linkLang, this);
                                    $('.token-input-input-token input').css('width', '100%');
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

                                    return validateOnTokenData(linkLang, this);
                                },
                                setup: function(data) {
                                    this.allowOnChange = false;
                                    var self = this,
                                        el = this.getInputElement(),
                                        tokenInputSelector = '.token-input-input-token input',
                                        field = $(el.$),
                                        tokenData = field.data('tokenInputObject'),
                                        getTokenData = function(linkData){
                                            if(linkData){
                                                var icon = top.bd.pm.view.getItemTypeObj(linkData);
                                                return {
                                                    id: linkData.uuid,
                                                    name: be.utils.HTMLEncode(linkData.properties.title.value),
                                                    icon: icon ? icon.icon : 'bc-page',
                                                    finalUrl: linkData.finalUrl,
                                                    managed: true
                                                };
                                            } else {
                                                return {};
                                            }
                                        };
                                    onBlur = onBlur || function (){
                                        self.onBlur();
                                    };
                                    if(!tokenData){
                                        bc.component.tokenize({
                                            field: field,
                                            zindex: 20000,
                                            tokenLimit: 1,
                                            animateDropdown: false,
                                            placeholder: 'Link to a menu Drag a page from the Page List or start typing',
                                            hintText: 'Type in a menu item',
                                            onAdd: function () {
                                                el.focusNext();
                                                onBlur();
                                            }
                                        });
                                    } else {
                                        $(el.$).tokenInput('clear');
                                    }

                                    $(tokenInputSelector).off('blur', onBlur).on('blur', onBlur);

                                    if (data.ref && top && top.bd && top.bd.pm){
                                        // var vc = b$.getVC(data.el),
                                        //     uuid = vc.getPreference(data.ref);
                                        var uuid = data.ref;

                                        if(uuid){
                                            getLinkData(uuid).done(function(link){
                                                $(el.$).tokenInput('add', getTokenData(link));
                                            });
                                        } else {
                                            be.utils.log('uuid is not defined', 'ice.ckeditor-plugins.managed-link');
                                        }
                                    } else if(data.url) {
                                        // not managed link
                                        var url  = data.url.protocol ? data.url.protocol : '';
                                        url += data.url.url;
                                        $(el.$).tokenInput('add', {id:'0', name: url });
                                    } else {
                                        // focus token input
                                        setTimeout( function () {
                                            $(tokenInputSelector).focus();
                                        }, 100);

                                    }
                                    this.isATemplateLink = Boolean(data.el && data.el.getAttribute('data-ice-link'));
                                    if(this.isATemplateLink) {
                                        this.required = false;
                                    }
                                    this.allowOnChange = true;

                                },
                                commit: function(data) {
                                    // IE will not trigger the onChange event if the mouse has been used
                                    // to carry all the operations #4724
                                    this.onChange();


                                    var el = this.getInputElement(),
                                        tokenList = $(el.$).data('tokenInputObject'),
                                        tokenData = tokenList && tokenList.getTokens()[0];

                                    data.tokenData = tokenData;

                                    //data.url.url = this.getValue();
                                    this.allowOnChange = false;
                                }
                            }]
                        }, {
                            type: 'hbox',
                            widths: ['75%', '25%'],
                            children: [{
                                type: 'select',
                                id: 'target',
                                label: 'Target', //commonLang.target,
                                required: true,
                                items: [ [ 'Empty / No value', ' ' ], [ 'New window', '_blank' ], [ 'Same frame', '_self' ], [ 'Parent frame', '_parent' ], [ 'Entire window', '_top' ] ],
                                'default': ' ',
                                onLoad: function() {
                                    this.allowOnChange = true;
                                },
                                onSelect: function( data ) {
                                    if (this.allowOnChange && !this.isHidden)
                                        data.target = this.getValue();
                                },
                                onShow: function () {
                                    removeValidationErrors(this.getDialog().getElement().$);
                                    $('.token-input-input-token select').css('width', '100%');
                                },
                                setup: function(data) {
                                    if (data.el && !data.el.hasAttribute("target")) {
                                        this.getElement().$.style.display = 'none';
                                        this.isHidden = true;
                                    } else {
                                        var el = this.getInputElement();
                                        this.isHidden = false;
                                        $(el.$).val(data.target || this['default']);
                                    }
                                },
                                commit: function(data) {
                                    this.onSelect(data);
                                    //this.allowOnChange = false;
                                }
                            }]
                        }]
                    }]
            }],

            onShow: function(e, b) {
                var element = null, href = '', retval={}, urlMatch, title = '', target = '',
                    urlRegex = /^((?:http|https|ftp|news):\/\/)?(.*)$/;

                // when window is rezied blur the input token, so tester
                // field will go off and don't break the screen design.
                $($('.cke_resizer')[0]).mousedown(function (evt) {
                    $($('.token-input-input-token > input')[0]).blur();
                });

                // Fill in all the relevant fields if there's already one link selected.
                if ((element = CKEDITOR.plugins.iceMLink.getSelectedLink(editor)) && element.hasAttribute('href')){
                    href = element.getAttribute('href');
                    title = element.getAttribute('title');

                    retval.ref = element.data('ice-link-ref');
                    retval.el = element.$;
                    retval.target = element.getAttribute('target');
                }
                if ( href && ( urlMatch = href.match( urlRegex ) ) ) {
                    retval.type = 'url';
                    retval.url = {};
                    retval.url.protocol = urlMatch[ 1 ];
                    retval.url.url = urlMatch[ 2 ];
                }
                retval.title = title;
                this.setupContent(retval);
            },

            onLoad: function(){
                var $dialog = $(this.parts.dialog.$), This = this;
                $dialog.bdDrop({
                    drop: function(e, info){
                        This._.contents['Ice Link Info'].url.setup({ref: info.helper.bdDragData.link.uuid});
                        return;
                    }
                });
            },

            onOk: function() {
                var element = CKEDITOR.plugins.iceMLink.getSelectedLink(editor),
                    data = {},
                    editArea = editor.element.$,
                    // oWidget = b$.getVC(editArea),
                    params = {
                        attr: {},
                        editor: editArea
                    };

                this.commitContent(data);

                // new / existing
                if(element){ params.link = element.$; }

                params.attr.title = data.title;
                // handle target setting
                params.attr.target = data.target;

                // managed / unmanaged
                if(data.tokenData) {
                    if(data.tokenData.managed){
                        params.uuid = data.tokenData.id;
                    } else if(data.tokenData.id == '0') {
                        params.attr.href = data.tokenData.name;
                    }
                } else {
                    //remove link?
                    var ref = element.data('ice-link-ref');
                    if(!ref) return;
                    params.uuid = ref;
                    params.resetLink = true;
                }

                // console.log('onOk', params);
                $(editArea).trigger('ice.updatelink', params);

            }
        };
        return dialogDefinition;
    });

    CKEDITOR.plugins.iceMLink = {
        getSelectedLink : function( editor ) {
            var el = editor.element;
            if (el && $(el.$).is('a')){
                return el;
            }

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
        }
    };

    //add the ice link plugin
    CKEDITOR.config.extraPlugins = 'iceMLink' + (CKEDITOR.config.extraPlugins.length > 1 ? ',' + CKEDITOR.config.extraPlugins : '');


})(window.jQuery, window.CKEDITOR, window.be);


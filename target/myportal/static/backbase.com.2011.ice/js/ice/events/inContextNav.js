/**
 * Copyright © 2013 Backbase B.V.
 */
;(function (jQuery, utils, events) {
    /* In-context navigation */

    'use strict';

    // register widget event
    events.registerEventListener('incontextnav', function(domnode, widget) {

        enableInContextNav(widget);

    });


    //show link icon when mouse over/click the link
    var setDataForLinkIcon = function($target, $widgetBody, $linkArrowBox, queryStringMap){
        var offset = $target.offset(),
            topPos = $target.height() + offset.top + 8,
            leftPos = offset.left, //$target.width() + offset.left,
            widgetLeftPos = $widgetBody.offset()['left'] + $widgetBody.width(),
            linkTag = $target[0],
            href = $target.attr('href'),
            hrefTarget = '_self';

        if(leftPos > widgetLeftPos){
            leftPos = widgetLeftPos;
        }

        //open in new window when its external link
        if(location.host === linkTag.host && location.protocol === linkTag.protocol){
            //same domain
            hrefTarget = '_self';
        }else{
            hrefTarget = '_blank';
        }


        $linkArrowBox
        .css({
            top: topPos +'px',
            left: leftPos +'px'
        });

        if(href){ //set the enable/disable class
            if(hrefTarget === '_self'){
                //respect to design and dev mode on the manageable link only
                if(queryStringMap.designmode){ href += (href.indexOf('?') !== -1 ? '&' : '?' ) + 'designmode=true'; }
                if(queryStringMap.devmode){ href += (href.indexOf('?') !== -1 ? '&' : '?' ) + 'devmode=true'; }
            }
            $linkArrowBox.children('.bd-ice-linkIcon').attr({'href': href, 'target' : hrefTarget}).removeClass('bc-gradient-grey-disabled');
        }else{
            $linkArrowBox.children('.bd-ice-linkIcon').attr({'href': '#', 'target' : '_self'}).addClass('bc-gradient-grey-disabled');
        }

    };
    //check if the current element is inside "<a>" tag, and return <a> if true
    var getParentLinkElement = function(target, goal){
        if(!target || !target.parentNode || target === goal){ return false; }
        else if(target.nodeName === 'A'){ return target; }
        else{ return getParentLinkElement(target.parentNode, goal); }
    };
    var enableInContextNav = function (oGadget) {
        var $widgetBody = jQuery(oGadget.body),
            $body = jQuery('body'),
            $linkArrowBox = jQuery('<div class="bd-ice-arrow-box bc-roundcorner-3"><a class="bd-ice-linkIcon bc-button bc-gradient-grey bc-roundcorner-3" href="">GO TO LINK</a></div>'),
            timer = false;

        if(!$body.children('.bd-ice-arrow-box').length) $body.append($linkArrowBox);
        else $linkArrowBox = $body.children('.bd-ice-arrow-box');//.find('.bd-ice-linkIcon');

        // $linkArrowBox.click(function(e){
        //     window.location.href = jQuery(this).attr('data-href');
        // });

        $widgetBody.on('click.ice-enableInContextNav',  function (e) {
            //same as the keydown function, but the timing are different
            clearInterval(timer);
            if(!e.target) return;
            var cursorParentNode = e.target;//be.utils.getCursor(e.target).parentNode;
            if(!cursorParentNode) {clearInterval(timer);return;}
            var $this, target = cursorParentNode,
                parentLinkElement = getParentLinkElement(target, this),
                queryStringMap = utils.getQueryStringParam();

            if(parentLinkElement === false){
                clearInterval(timer);
                $linkArrowBox.hide();
                return;
            }else{
                target = parentLinkElement;
            }

            $this = jQuery(target);
            setDataForLinkIcon($this, $widgetBody, $linkArrowBox, queryStringMap);
            $linkArrowBox.show();

            timer = setInterval(function(){
                if(!$this.closest('body').length){//link removed
                    clearInterval(timer);
                    $linkArrowBox.hide();
                }else{
                    setDataForLinkIcon($this, $widgetBody, $linkArrowBox, queryStringMap);
                }
            }, 400);
        }).on('keydown.ice-enableInContextNav',  function (e) {
            //same as the click function, but the timing are different
            clearInterval(timer);
            if(!e.target) return;
            var This = this;
            timer = setInterval(function(){
                var cursorParentNode = be.utils.getCursor(e.target).getStartElement();
                if(!cursorParentNode) {clearInterval(timer);return;}
                var $this, target = cursorParentNode,
                    parentLinkElement = getParentLinkElement(target, This),
                    queryStringMap = utils.getQueryStringParam();

                if(parentLinkElement === false){
                    $linkArrowBox.hide();
                    clearInterval(timer);
                    return;
                }else{
                    target = parentLinkElement;
                }

                $this = jQuery(target);

                if(!$this.closest('body').length){//link removed
                    clearInterval(timer);
                    $linkArrowBox.hide();
                }else{
                    setDataForLinkIcon($this, $widgetBody, $linkArrowBox, queryStringMap);
                    $linkArrowBox.show();
                }
            }, 400);
        })
        .on('iceFocusOut',  function () {
            clearInterval(timer);
            $linkArrowBox.hide();
        });
    };

})(
    jQuery,
    be.utils,
    be.ice.events
);

if(window.bd==null){bd={}}bd.removeWhiteSpaceNodes=function(a){var c=a.firstChild,b;while(c){b=c.nextSibling;if(c.nodeType==3&&/^\s*$/.test(c.nodeValue)){a.removeChild(c)}else{if(c.hasChildNodes()){bd.removeWhiteSpaceNodes(c)}}c=b}return a};bd._parseXML=function(d){var a,b,c=!!(navigator.userAgent.match(/Trident/)&&!navigator.userAgent.match(/MSIE/));if(!d||typeof d!=="string"){return null}try{if(window.DOMParser&&!c){b=new DOMParser();a=b.parseFromString(d,"text/xml")}else{a=new ActiveXObject("Microsoft.XMLDOM");a.async="false";a.loadXML(d)}}catch(f){a=undefined}if(!a||!a.documentElement||a.getElementsByTagName("parsererror").length){throw new Error("Invalid XML: "+d)}return a};bd.xmlToJson=function(t){var l=["value","approvalMessage"];var c=t.dataFormatter;var d=bd.removeWhiteSpaceNodes(t.xml);if(typeof d==="string"){d=bd._parseXML(d)}var g={};if(d.nodeType==1){for(var n=0,q=d.attributes.length;n<q;n++){var h=d.attributes.item(n);if(h.nodeValue!=null&&h.nodeValue!=""){g[h.nodeName]=h.nodeValue}if(h.nodeName=="type"&&h.nodeValue.toLowerCase()=="string"&&!d.childNodes.length&&l.indexOf(d.nodeName)>-1){return null}}}else{if(d.nodeType==3&&d.nodeValue!=null&&d.nodeValue!=""){g=d.nodeValue}}if(d.hasChildNodes()){for(var o=0;o<d.childNodes.length;o++){var s=d.childNodes.item(o);var b=s.nodeName;if(b=="#text"){if(s.nodeValue!=null){g=s.nodeValue}break}else{if(b=="properties"){g.properties={};g.propertiesArray=[];for(var m=0;m<s.childNodes.length;m++){var u=s.childNodes.item(m);var f=u.getAttribute("name");var r=bd.xmlToJson({xml:u,dataFormatter:c});g.properties[f]=r;g.propertiesArray.push(r)}if(c!=null){c(g)}}else{if(b=="tags"){g.tags=[];g.tagArray=[];for(var m=0;m<s.childNodes.length;m++){var u=s.childNodes.item(m);var e=u.getAttribute("type");var k=u.getAttribute("manageable");k=k==="false"?false:true;var r=bd.xmlToJson({xml:u,dataFormatter:c});g.tagArray.push(r);g.tags.push({type:e,manageable:k,value:r})}if(c!=null){c(g)}}else{if(typeof(g[b])=="undefined"||g[b]===null){g[b]=bd.xmlToJson({xml:s,dataFormatter:c})}else{if(Object.prototype.toString.call(g[b])!=="[object Array]"){var a=g[b];g[b]=[];g[b].push(a)}g[b].push(bd.xmlToJson({xml:s,dataFormatter:c}))}}}}}}return g};
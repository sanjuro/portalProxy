b$.module("gadgets.config",function(){this.proxyUrl="/proxy";this.register=function(){}});b$.module("gadgets.json",function(){var b=JSON.stringify;var a=function(c){sTtext=c.replace(/\\x(..)/g,"\\u00$1");try{c=JSON.parse(c)}catch(d){d.message+=". Source: "+c;throw d}return c};this.stringify=b;this.parse=a});b$.module("gadgets.io",function(){var b=b$.Class;var d=gadgets.config;var l=gadgets.json;var g={};g.METHOD="method";g.CONTENT_TYPE="type";g.POST_DATA="data";g.HEADERS="headers";g.AUTHORIZATION="authorization";g.NUM_ENTRIES="NUM_ENTRIES";g.GET_SUMMARIES="GET_SUMMARIES";g.TIMEOUT="timeout";var f={};f.GET="GET";f.POST="POST";f.PUT="PUT";f.DELETE="DELETE";f.HEAD="HEAD";var e={};e.TEXT="text";e.DOM="xml";e.JSON="json";e.FEED="feed";var j={};j.NONE="NONE";j.SIGNED="SIGNED";j.OAUTH="OAUTH";var k={};k.REFRESH_INTERVAL="refresh";k.BACKBASE_PTC_PIPE="pipe";function c(m){var n=[],p="";for(var o in m){if(m.hasOwnProperty(o)){p=m[o];if(typeof p=="object"&&p.length){for(var q=0;q<p.length;q++){n.push(encodeURIComponent(o)+"="+encodeURIComponent(p[q]))}}else{n.push(encodeURIComponent(o)+"="+encodeURIComponent(p))}}}return n.join("&")}function h(m,n){n=n||{};n.url=m||n.url;return d.proxyUrl+(d.proxyUrl.indexOf("?")==-1?"?":"&")+c(n)}var a=b.extend(function(p,o,q,m,s){this.text=o;this.data=null;this.errors=[];this.status=q;this.headers={};for(var r=0;r<s.length;r++){var n=s[r].replace(/^\s*|\s*$/g,"").split(": ");if(n.length>1){this.headers[n.shift()]=n.join(": ")}}if((q>=200&&q<300)||q==304||q==1223){switch(p){case e.DOM:this.data=new DOMParser().parseFromString(o,"application/xml");break;case e.JSON:try{this.data=l.parse(o)}catch(t){this.errors.push(t.message||t)}break;case e.FEED:this.errors.push("Not implemented");break;case e.TEXT:default:this.data=o;break}}else{if(q==0){this.errors.push("No connection to server")}else{this.errors.push("HTTP error:"+q);if(m){this.errors.push(m)}}}},{getHeader:function(n){n=String(n).toLowerCase();for(var m in this.headers){if(this.headers.hasOwnProperty(m)&&m.toLowerCase()==n){return this.headers[m]}}return null}});function i(m,t,p){p=p||{};var r=p[g.HEADERS]||{};var s=p[g.POST_DATA]||null;var q=Number(p[g.TIMEOUT])||30000;if(p[g.METHOD]===f.POST&&!r["Content-Type"]&&s){r["Content-Type"]="application/x-www-form-urlencoded"}var o=new XMLHttpRequest();o.open(p[g.METHOD]||f.GET,m,true);for(var n in r){if(r.hasOwnProperty(n)){o.setRequestHeader(n,r[n])}}if(q){q=setTimeout(function(){o.abort()},q)}o.onreadystatechange=function(){if(o.readyState==2){o._headersReceived=true}else{if(o.readyState==4){if(q){clearTimeout(q)}if(t){if(window.opera&&!o.status){o.status=204;o.statusText="No Content"}var u=new a(p[g.CONTENT_TYPE],o.responseText,o.status,o.statusText,o._headersReceived?String(o.getAllResponseHeaders()).split("\n"):[]);t(u)}}}};o.send(s);return o}this.encodeValues=c;this.getProxyUrl=h;this.makeRequest=i;this.RequestParameters=g;this.MethodType=f;this.ContentType=e;this.AuthorizationType=j;this.ProxyUrlRequestParameters=k});b$.module("gadgets.pubsub",function(){var f=b$._private.types.STRING;var i=b$._private.types.FUNCTION;var a=b$.Class;var d=a.extend(function(){this.callbacks=[]},{subscribe:function(j){this.callbacks.push(j)},unsubscribe:function(j){if(!j){this.callbacks=[]}else{this.callbacks=this.callbacks.filter(function(k){return k!=j})}},publish:function(j){this.callbacks.forEach(function(k){k(j)})}});var g=a.extend(function(){this.channels={}},{subscribe:function(j,k){if(!this.channels[j]){this.channels[j]=new d()}this.channels[j].subscribe(k)},unsubscribe:function(j,k){if(this.channels[j]){this.channels[j].unsubscribe(k)}},publish:function(j,k){if(this.channels[j]){this.channels[j].publish(k)}}});var e=new g();function b(j,k){e.publish(j,k)}function c(j,k){e.subscribe(j,k)}function h(j,k){e.unsubscribe(j,k)}this.publish=b;this.subscribe=c;this.unsubscribe=h});b$.module("gadgets.util",function(){var b=b$._private.uri.URI;var d={0:false,10:true,13:true,34:true,39:true,60:true,62:true,92:true,8232:true,8233:true};var e=f();function f(g){if(e&&g===undefined){return e}var i=new b(g||document.location.href),h={};(i.getQuery()||"").split("&").concat((i.getFragment()||"").split("&")).forEach(function(k){var j=k.split("=");if(j.length==2){h[j[0]]=decodeURIComponent(j[1].replace(/\+/g," "))}});return h}function a(g){return g&&g.replace(/[\s\S]/mg,function(h){var j=h.charCodeAt(0);var i=d[j];if(i===true){return"&#"+j+";"}else{if(i!==false){return h}}})}function c(g){return g&&g.replace(/&#([0-9]+);/g,function(h,i){return String.fromCharCode(i)})}this.getUrlParameters=f;this.escapeString=a;this.unescapeString=c});window.bp=window.bp||{};bp.api={};bp.api.getCurrentPortal=function(){return{name:b$.portal.portalName}};bp.api.getCurrentPage=function(){return{name:b$.portal.pageName}};
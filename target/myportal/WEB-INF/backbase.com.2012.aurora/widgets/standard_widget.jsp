<%-- Copyright © 2011 Backbase B.V. --%>
<!DOCTYPE html>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="b" uri="http://www.backbase.com/taglib" %>
<%@ taglib prefix="esapi" uri="http://www.owasp.org/index.php/Category:OWASP_Enterprise_Security_API" %>
<%@page import="com.backbase.portal.foundation.domain.conceptual.*"%>
<%@ page session="false"%>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="content-type" content="text/html;charset=utf-8"/>
    <title>Standard Widget Definition</title>
    <%
        if (request.getParameter("formsSessionId") != null) {
            Item item = (Item)request.getAttribute("item");
            PropertyDefinition property = new PropertyDefinition("formsSessionId", new StringPropertyValue(request.getParameter("formsSessionId").toString()));
            item.getPropertyDefinitions().put("formsSessionId", property);
        }
    %>

    <script type="text/javascript">
        if(window.bbAddionalStore == null) window.bbAddionalStore = {};
            window.bbAddionalStore['<esapi:encodeForJavaScript>${item.name}</esapi:encodeForJavaScript>'] =
            {'formsSessionId': '<esapi:encodeForJavaScript>${param.formsSessionId}</esapi:encodeForJavaScript>'};
    </script>

    <script  type="text/javascript">
        /*
        * call this from the onload handle of the widget using formsSessionId for g:include
        */
        var override = function(f, g) { return function() { return g(f); } };

        function bb_handlePreferenceForRefreshInclude(oWidget){
            oWidget.addFormsSessionIdToPreferences = function(){
				var formsSessionIdValue = window.bbAddionalStore[this.model.name].formsSessionId;
                if(formsSessionIdValue != null){
                    var p = {name: 'formsSessionId', type: 'string', value: formsSessionIdValue, viewHint: ''};
                    //so that the client doesn't send the delta and persist this temporary property/preference
                    this.model.originalItem.preferences['formsSessionId']  = p;
                    this.setPreference('formsSessionId', formsSessionIdValue);
                }
			};
            oWidget.refreshHTML = override(oWidget.refreshHTML, function(refreshHTMLOrig, callback, errCallback){
                var loadItemHTMLBackup = b$.portal.portalServer.loadItemHTML;
                This = oWidget;

                oWidget.addFormsSessionIdToPreferences();
                b$.portal.portalServer.loadItemHTML = function(item, callback, errCallback, pc, ps, off){
                    var ext = '.html';
                    var formsSessionId = This.getPreference('formsSessionId');
                    if (item.tag === 'widget'){
                        ext = formsSessionId ? '.html?formsSessionId=' + formsSessionId : ext;
                    }
                    return this._loadItem(item, callback, errCallback, ext, pc, ps, off);
                }
                refreshHTMLOrig.call(oWidget, callback, errCallback);
                b$.portal.portalServer.loadItemHTML = loadItemHTMLBackup;
            });
        }

    </script>
</head>
<body>
	<b:widget src='${item}'/>
</body>
</html>

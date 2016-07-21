<!DOCTYPE html>
<%@page import="com.backbase.portal.foundation.business.utils.context.ThreadLocalRequestContext"%>
<%@page import="com.backbase.portal.foundation.presentation.util.BuildConfigUtils"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="b" uri="http://www.backbase.com/taglib" %>
<%@ taglib prefix="esapi" uri="http://www.owasp.org/index.php/Category:OWASP_Enterprise_Security_API" %>
<%@page import="com.backbase.portal.foundation.domain.conceptual.Item,
com.backbase.portal.foundation.presentation.util.LayoutUtils" %>
<%@ page session="false"%>
<%String portalContextRoot = request.getContextPath();%>
<%String buildVersion = BuildConfigUtils.getBuildVersion();%>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="content-type" content="text/html;charset=utf-8"/>
    <title>Column Container Contents</title>
    <link type="text/css" rel="stylesheet" href="<%=portalContextRoot%>/static/backbase.com.2012.aurora/css/aurora.containers.css?v=<%=buildVersion%>" />
    <link type="text/css" rel="stylesheet" href="<%=portalContextRoot%>/static/backbase.com.2013.aurora/containers/ManageableArea/css/ManageableArea.css" />
    <script src="<%=portalContextRoot%>/static/backbase.com.2012.aurora/js/aurora.containers.js?v=<%=buildVersion%>"></script>
</head>
<body>
    <%
    try{

        Item item = (Item) request.getAttribute("item");

        String paddingValue = LayoutUtils.getPaddingValue(item);
        String tableStyle = LayoutUtils.getTableStyle(paddingValue);
        pageContext.setAttribute("paddingValue", paddingValue);
        pageContext.setAttribute("tableStyle", tableStyle);

        int columnCount = LayoutUtils.getColumnCount(item);

        String[] widths = LayoutUtils.getWidths(item, columnCount);
    %>
    <div class="bp-container bp-ColumnLayout bp-ui-dragRoot" data-pid="<esapi:encodeForHTMLAttribute>${item.name}</esapi:encodeForHTMLAttribute>">
        <table cellspacing="<esapi:encodeForHTMLAttribute>${paddingValue}</esapi:encodeForHTMLAttribute>px" class="bp-ColumnLayout-table" ${tableStyle}>
            <tbody>
                <tr class="bp-ColumnLayout-tr">
                    <% // parse the items:
                    for(int i=0; i<columnCount; i++) {
                        pageContext.setAttribute("areaNumber",Integer.toString(i));
                        if (i < widths.length && widths[i] != null) {
                            pageContext.setAttribute("style", String.format(" style='width:%s;'", widths[i]));
                        } else {
                            pageContext.setAttribute("style", "");
                        }%>
                        <td class="bp-area bp-align-top bp-ColumnLayout-td bp-ColumnLayout-column-<esapi:encodeForHTMLAttribute>${areaNumber}</esapi:encodeForHTMLAttribute>"${style}>
                            <c:forEach items="${item.children}" var="child">
                                <c:if test='${child.propertyDefinitions["area"].value.value == areaNumber}'>
                                    <b:include src="${child}"/>
                                </c:if>
                            </c:forEach>
                        </td>
                    <%}%>
                </tr>
            </tbody>
        </table>
    </div>
    <%}catch(Exception e){
        %>An error has occurred. This could be due to the preference values you have entered for this layout.<%
    }%>
</body>
</html>

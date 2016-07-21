<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="b" uri="http://www.backbase.com/taglib" %>
<%@ taglib prefix="esapi" uri="http://www.owasp.org/index.php/Category:OWASP_Enterprise_Security_API" %>
<%@page import="java.util.Collections,
                java.util.Comparator,
                com.backbase.portal.foundation.domain.conceptual.Item,
                com.backbase.portal.foundation.domain.model.BaseContainer" %>
<%@ page session="false"%>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="content-type" content="text/html;charset=utf-8"/>
    <title>Container Contents</title>

    <%--
             BorderLayout SSR container.
             It knows about areas and children.
             It also knows how to tell the client about the SSRed bits.

             For successful PHE on the client:
              * Client assumes the container id is set to item.name.
              * Client assumes a direct child of container is table.
              * Client assumes all td elements tagged with portal-area are viewports.
              * Client finds viewports by area name. north, west, center, east, south
              * Client expects all viewports to be there.
         --%>
</head>
<body>
<div style="width:100%;border:1px solid #FF0000" id="<esapi:encodeForHTMLAttribute>${item.name}</esapi:encodeForHTMLAttribute>">
    Container name: <esapi:encodeForHTML>${item.name}</esapi:encodeForHTML>
    <%
        BaseContainer item = (BaseContainer) request.getAttribute("item");

        Collections.sort(item.getChildren(), new Comparator<Item>() {
            public int compare(Item item1, Item item2) {
                String order1 = item1.getProperty("order").getValue().toString();
                String order2 = item2.getProperty("order").getValue().toString();
                return order1.compareTo(order2);
            }
        });
    %>

    <table cellpadding="0" cellspacing="0" width="100%">
        <tr>
            <td colspan="3" class="portal-area north">
                <c:forEach items="${item.children}" var="child">
                    <c:if test='${child.propertyDefinitions["area"].value.value == "north"}'>
                        <b:include src="${child}"/>
                    </c:if>
                </c:forEach>
            </td>
        </tr>
        <tr>
            <td class="portal-area west">
                <c:forEach items="${item.children}" var="child">
                    <c:if test='${child.propertyDefinitions["area"].value.value == "west"}'>
                        <b:include src="${child}"/>
                    </c:if>
                </c:forEach>
            </td>
            <td class="portal-area center">
                <c:forEach items="${item.children}" var="child">
                    <c:if test='${child.propertyDefinitions["area"].value.value == "center"}'>
                        <b:include src="${child}"/>
                    </c:if>
                </c:forEach>
            </td>
            <td class="portal-area east">
                <c:forEach items="${item.children}" var="child">
                    <c:if test='${child.propertyDefinitions["area"].value.value == "east"}'>
                        <b:include src="${child}"/>
                    </c:if>
                </c:forEach>
            </td>
        </tr>
        <tr>
            <td colspan="3" class="portal-area south">
                <c:forEach items="${item.children}" var="child">
                    <c:if test='${child.propertyDefinitions["area"].value.value == "south"}'>
                        <b:include src="${child}"/>
                    </c:if>
                </c:forEach>
            </td>
        </tr>
    </table>
</div>
</body>
</html>


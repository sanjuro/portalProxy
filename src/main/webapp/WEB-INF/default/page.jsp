<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<%@ page pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="b" uri="http://www.backbase.com/taglib" %>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="esapi" uri="http://www.owasp.org/index.php/Category:OWASP_Enterprise_Security_API" %>
<%@ page session="false"%>
<%@ page import="com.backbase.portal.foundation.presentation.util.SecurityUtils"%>
<%
	String authenticatedUserName = SecurityUtils.getAuthenticatedUserName();
%>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <title><c:out value="${item.name}"/></title>
    <meta http-equiv="content-type" content="text/html;charset=utf-8"/>
    <link rel="stylesheet" type="text/css" href="<c:url value="/static/default/css/backbaseportalserver.css"/>"/>

    <script src="/portalserver/static/ext-lib/jquery-1.8.3.js"></script>
    <script src="/portalserver/static/lib/bcf/5_0_0/bpc.js"></script>
    <script src="/portalserver/static/lib/portal/5_0_0/portal-all.js"></script>
</head>
<body id="${item.URI.path}">
<table>
    <tr>
        <td><img src="<c:url value="/static/default/media/BB_logo_.png"/>"/></td>
        <td>
            <% if(authenticatedUserName != null) { %><a href="<c:url value="/j_spring_security_logout"/>">logout</a>
            	<esapi:encodeForHTML><%=authenticatedUserName%></esapi:encodeForHTML>
            <% } %>
        </td>
    </tr>
</table>


<div style="width:100%;border:1px solid black">
    Page name: <esapi:encodeForHTML>${item.name}</esapi:encodeForHTML>
    <div style="width:100%">
        <table>
            <tr>
                <c:forEach items="${item.children}" var="child">
                    <td><b:include src="${child}"/></td>
                </c:forEach>
            </tr>
        </table>
    </div>
</div>
</body>
</html>

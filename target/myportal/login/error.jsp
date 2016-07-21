<%--
Copyright © 2011 Backbase B.V.
--%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ page session="false"%>
<%String portalContextRoot = request.getContextPath();%>
<%String buildVersion = com.backbase.portal.foundation.presentation.util.BuildConfigUtils.getBuildVersion();%>
<!DOCTYPE html>
<html>
    <head>
    	<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
      	<link rel="stylesheet" type="text/css" href="<%=portalContextRoot%>/static/dashboard/build/dashboard-all.min.css?v=<%=buildVersion%>" />
      	<link rel="shortcut icon" href="<%=portalContextRoot%>/static/dashboard/media/favicon.ico" />
    </head>
    <body class="dashboard">
        <div class="bd-errorContainer">
			<div class="bd-errorMsg">
			    <p class="bd-errorTitle">Server Error</p>
			    <p class="bd-errorDescription">
                    <c:choose>
                    <c:when test="${empty param.errorMessage}">
                        An unexpected error has occurred with the server.
                    </c:when>
                    <c:otherwise>
                        <c:out value="${param.errorMessage}" />
                    </c:otherwise>
                    </c:choose>
                </p>
			    <a href="<%=portalContextRoot%>/login/login.jsp">Return to login page.</a>
			</div>
        </div>
    </body>
</html>
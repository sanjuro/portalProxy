<%--
Copyright © 2011 Backbase B.V.
--%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ page import="org.springframework.security.web.savedrequest.*" %>
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
		<div class="bd-loginContainer">
			<form action="<%=portalContextRoot%>/j_spring_security_check" method="POST" name="f" class="bd-loginForm">
				<label style="margin-right: 20px;">You have successfully logged out.</label>
				<a href="login.jsp" id="bd-login-page">Return to login page.</a>
			</form>
		</div>
	</body>
</html>
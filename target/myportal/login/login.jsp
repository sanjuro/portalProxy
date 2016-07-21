<%--
Copyright © 2011 Backbase B.V.
--%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="esapi" uri="http://www.owasp.org/index.php/Category:OWASP_Enterprise_Security_API" %>
<%@ page import="org.springframework.security.web.savedrequest.*" %>
<%@ page session="false"%>
<%String portalContextRoot = request.getContextPath();%>
<%String buildVersion = com.backbase.portal.foundation.presentation.util.BuildConfigUtils.getBuildVersion();%>
<!DOCTYPE html>
<html>
	<head>
		<title>Portal Manager - Login</title>
		<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
	  	<link rel="stylesheet" type="text/css" href="<%=portalContextRoot%>/static/dashboard/build/dashboard-all.min.css?v=<%=buildVersion%>" />
	  	<script type="text/javascript" src="<%=portalContextRoot%>/static/ext-lib/jquery-1.8.3.js" ></script>
	    <script type="text/javascript" src="<%=portalContextRoot%>/static/dashboard/js/login/jquery.cookie.js"></script>
	  	<link rel="shortcut icon" href="<%=portalContextRoot%>/static/dashboard/media/favicon.ico" />
	</head>
	<body class="dashboard" onload="customOnload()">
		<div class="bd-loginContainer">
			<form action="<%=portalContextRoot%>/j_spring_security_check" method="POST" name="f" class="bd-loginForm">
				<label for="j_username" style="margin-right: 20px;">Username<input type="text"autocapitalize="off" name="j_username" id="j_username" class="bd-roundcorner-5 bd-login-font-color bd-autoTest-login-username"/></label>
				<label for="j_password">Password<input type="password" name="j_password" id="j_password" class="bd-roundcorner-5 bd-login-font-color bd-autoTest-login-password"/></label>
				<c:if test="${param.login_error eq 'accessdenied'}">
					<div class="spacer"></div>
					<div class="bd-error">
						<p class="bd-error-message">The requested page requires authorization.</p>
						<p class="bd-error-description">Please login with a valid Username and Password.</p>
					</div>
				</c:if>
				<c:if test="${param.login_error eq 'failure'}">
					<div class="spacer"></div>
					<div class="bd-error">
						<p class="bd-error-message">The Username or Password you entered is not correct.</p>
						<p class="bd-error-description">Please re-enter your Username and Password.</p>
					</div>
				</c:if>
				<c:if test="${param.login_error eq 'invalidDestination'}">
					<div class="spacer"></div>
					<div class="bd-error">
						<p class="bd-error-message">This user has no permissions to access this page.</p>
						<p class="bd-error-description">Please re-enter the URL to the page you want to see.</p>
					</div>
				</c:if>
				<c:if test="${not empty param.redirect}">
					<input type="hidden" name="redirect" value="<esapi:encodeForHTMLAttribute><esapi:encodeForURL>${param.redirect}</esapi:encodeForURL></esapi:encodeForHTMLAttribute>"/>
				</c:if>
				<div class="bd-buttons">
					  <button type="submit" class="bd-button bd-gradient-grey bd-roundcorner-5 bd-noshadow">Log in</button>
				</div>
				<input type="hidden" name="bbCSRF" value="${bbCSRF}" />	                     
			</form>
		</div>
		<script>
            function customOnload()
            {
				jQuery('.bd-loginForm').submit(function(){
					var portalName = jQuery.cookie('portalName');

					if(portalName && window != top){
						// if it's a preview window redirect to source portal
						jQuery.cookie('redirectPortal', portalName, { path: '/' });
					}
					return true;
				});
                document.f.j_username.focus();
            }
		</script>
	</body>
</html>

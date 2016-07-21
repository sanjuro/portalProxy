<%-- Copyright � 2011 Backbase B.V. --%>
<!DOCTYPE html>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="b" uri="http://www.backbase.com/taglib" %>
<%@ page import="com.backbase.portal.foundation.domain.conceptual.Item,
com.backbase.portal.foundation.domain.conceptual.BasePropertyValue,
java.util.Map,java.util.HashMap,java.util.List,java.util.ArrayList" %>
<%@ page session="false"%>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="content-type" content="text/html;charset=utf-8"/>
    <title>w3cWidgetImplementation</title>
</head>
<body>
	<b:w3cwidget src='${item}'/>
</body>
</html>

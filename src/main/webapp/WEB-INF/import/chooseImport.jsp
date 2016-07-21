<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="form" uri="http://www.springframework.org/tags/form" %>
<%@ taglib prefix="spring" uri="http://www.springframework.org/tags" %>
<%@ page import="com.backbase.portal.foundation.presentation.util.SecurityUtils" %>
<%@ page session="false" %>
<%String portalContextRoot = request.getContextPath();%>
<html xmlns="http://www.w3.org/1999/xhtml">

<head>
<meta http-equiv="content-type" content="text/html;charset=utf-8"/>
<style>
    /**
     * Copyright � 2011 Backbase B.V.
     */
xmp {
    display: none;
}

html, body {
    height: 100%;
    margin: 0px;
    padding: 0px;
}

body.dashboard {
    background: #bbb url('static/default/media/bg_pm.png') repeat;
    font-size: 13px;
    font-family: "Lucida Sans Unicode", "Lucida Grande", Garuda, sans-serif;
    min-height: 400px;
    min-width: 600px;
    margin: 0;
    padding: 0;
}

.bd-columnHeader {
    background-color: #ccc;
    margin: 0px 5px;
    padding: 10px;
    font-weight: bold;
    font-size: 12px;
    height: 14px;
    line-height: 14px;
    overflow: visible;
}

.bd-mainTitle {
    padding-bottom: 15px;
    font-weight: bold;
    font-size: 14px;
    text-transform: uppercase;
    height: 16px;
    line-height: 16px;
}

.bd-header {
    background: url('static/default/media/bb_ribbon.png') no-repeat 18px;
    height: 40px;
    padding-left: 20px;
}

.bd-popupForm {
    background: none repeat scroll 0 0 #ffffff;
    border: 2px solid #FFFFFF;
    box-shadow: 1px 1px 5px #999999;
    margin: 0;
    -webkit-border-radius: 5px;
    -ms-border-radius: 5px;
    border-radius: 5px;
    margin: 5px 20px;
    overflow: hidden;
    padding: 20px 20px;
}

.bd-footer {
    text-align: center;
}

body {
    background: #BBBBBB;
    font-family: "Lucida Grande", "Lucida Sans Unicode", Helvetica, Arial, sans-serif;
    font-size: 13px;
    margin: 0;
}

ul, li {
    display: block;
    list-style: none;
    list-style-type: none;
    margin: 0;
    padding: 0
}

ul {
    margin-right: 20px;
}

.bd-maincontainer {
    padding: 0 40px 0 0;
}

.error {
    color: #ff0000;
}

.errorblock {
    color: #000;
    background-color: #ffEEEE;
    border: 3px solid #ff0000;
    padding: 8px;
    margin: 16px;
}

fieldset {
    border: 0;
    padding: 0;
    margin: 0;
    margin-top: 20px;
    background: #f9f9f9;
    padding: 6px;
}

h2 {
    margin: 0;
    padding: 0;
    font-size: 16px;
    padding-bottom: 5px;
    line-height: 18px;
}

.bd-buttons {
    clear: both;
    font-size: 11px;
}

.bd-button {
    font-family: "Lucida Grande", "Lucida Sans Unicode", Helvetica, Arial, sans-serif;
    padding: 2px 8px;
    font-size: 12px;
    cursor: pointer;
    margin-right: 10px;
    text-transform: uppercase;
    text-decoration: none;
}

.bd-button {
    padding: 2px 6px;
    font-size: 12px;
    border: 1px solid #CCC;
    display: inline-block;
}

.bd-buttonText {
    font-size: 11px;
    text-transform: uppercase;
    color: #333;
    font-weight: bold;
    border-bottom: 1px solid #999;
    padding: 0;
    text-decoration: none;
    margin-left: 4px;
    margin-top: 8px;
    line-height: 1em;
}

.bd-button .bd-icon {
    height: 17px;
    line-height: 17px;
    width: 13px;
}

.bd-buttonGradientGrey,
.bd-buttonGradientGreen {
    -webkit-box-shadow: 0px 1px 1px 0px #ffffff;
    -moz-box-shadow: 0px 1px 1px 0px #ffffff;
    box-shadow: 0px 1px 1px 0px #ffffff;
    -moz-border-radius: 3px;
    -webkit-border-radius: 3px;
    -ms-border-radius: 3px;
    border-radius: 3px;
}

.bd-buttonGradientGrey {
    background: #ffffff url(../media/ie/bg_button_grey.png) 0 50% repeat-x; /* Old browsers */
    background: -moz-linear-gradient(top, #ffffff 0%, #eaeaea 100%); /* FF3.6+ */
    background: -webkit-gradient(linear, left top, left bottom, color-stop(0%, #ffffff), color-stop(100%, #eaeaea)); /* Chrome,Safari4+ */
    background: -webkit-linear-gradient(top, #ffffff 0%, #eaeaea 100%); /* Chrome10+,Safari5.1+ */
    background: -o-linear-gradient(top, #ffffff 0%, #eaeaea 100%); /* Opera11.10+ */
    background: -ms-linear-gradient(top, #ffffff 0%, #eaeaea 100%); /* IE10+ */
    /*filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#ffffff', endColorstr='#eaeaea',GradientType=0 );  /*IE6-9 */
    background: linear-gradient(top, #ffffff 0%, #eaeaea 100%);
    border: 1px solid #AAA;
    font-weight: bold;
    color: #444;
}

*html .bd-buttonGradientGrey {
    /* ie < 7 */
    background: #ffffff url(../media/ie/bg_button_grey.png) 0 50% repeat-x;
}

.bd-buttonGradientGrey:hover {
    background: #ffffff;
    color: #480;
}

.bd-buttonGradientGreen {
    background: #75b505; /* Old browsers */
    background: -moz-linear-gradient(top, #75b505 0%, #539000 100%); /* FF3.6+ */
    background: -webkit-gradient(linear, left top, left bottom, color-stop(0%, #75b505), color-stop(100%, #539000)); /* Chrome,Safari4+ */
    background: -webkit-linear-gradient(top, #75b505 0%, #539000 100%); /* Chrome10+,Safari5.1+ */
    background: -o-linear-gradient(top, #75b505 0%, #539000 100%); /* Opera 11.10+ */
    background: -ms-linear-gradient(top, #75b505 0%, #539000 100%); /* IE10+ */
    background: linear-gradient(top, #75b505 0%, #539000 100%); /* W3C */
    filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#75b505', endColorstr='#539000', GradientType=0); /* IE6-8 */
    border: 1px solid #6CA521;
    font-weight: bold;
    color: #fff;
}

.bd-buttonGradientGreen:hover {
    background: #75B505;
}

.bd-left {
    min-width: 600px;
}

.bd-top {
    padding: 10px 20px;
    background: #efefef;
    margin-top: 20px;
    -webkit-border-radius: 5px;
    -ms-border-radius: 5px;
    border-radius: 5px;
    margin-right: 10px;
}

.bd-importbutton {
    margin-top: 8px;
}
</style>

<script type="text/javascript" src="<%=portalContextRoot%>/static/ext-lib/jquery-1.8.3.js"></script>
<script>
    $(function () {
        $('.checkall').click(function () {
            checkboxes = $(this).parent().find(':checkbox').not('input.deletefirst').attr('checked', 'checked');
        });
        $('.uncheckall').click(function () {
            $(this).parent().find(':checkbox').not('input.deletefirst').removeAttr('checked');
        });
        $('.toggleall').click(function () {
            $(this).parents('fieldset:eq(0)').find(':checkbox').not('input.deletefirst').attr('checked', this.checked);
        });
    });

    function alert_clean() {
        $('.deletefirst').toggleClass('notChecked');
        if ($('.deletefirst').hasClass('notChecked')) {
            alert("If you select clean, an existing portal will be REMOVED before it is imported.\n" +
                    " Be sure you know what you are doing!");
        }
    }
    ;
</script>
</head>


<body class="dashboard">
<div class="bd-header"></div>
<div class="bd-portalManagement bd-popupForm">
    <table>
        <tr>
            <td valign="top" class="bd-left">
                <div class="bd-maincontainer">
                    <div class="bd-mainTitle"><span>IMPORT BACKBASE PORTAL OBJECTS</span></div>

                        <% if(SecurityUtils.isAdminAuthorized()) { %>

                    <form:form commandName="formObject" action="${pageContext.request.contextPath}/import/"
                               method="POST">
                    Select the objects you want to import: <input type="button"
                                                                  class="checkall bd-button bd-buttonGradientGrey"
                                                                  value="Check All">
                    <input type="button" class="uncheckall bd-button bd-buttonGradientGrey" value="Uncheck All">
                    <input type="hidden" name="bbCSRF" value="${bbCSRF}" />

                        <form:errors path="*" cssClass="errorblock" element="div" class="importform"/>
                    <c:forEach var="entry" items="${formObject.portals}">
                    <fieldset>
                        <table>
                            <tr>
                                <td><input type="checkbox" class="toggleall" checked=""></input></td>
                                <td><h2>Portals</h2></td>
                            </tr>
                            <tr>
                                <td>
                                    <spring:bind path="formObject.portals[${entry.key}].importIt">
                                        <form:checkbox path="${status.expression}"/>
                                    </spring:bind>
                                </td>
                                <td>${entry.key}
                                    <spring:bind path="formObject.portals[${entry.key}].deleteIt">
                                        <form:checkbox path="${status.expression}" class="deletefirst" checked=''
                                                       onclick="javascript:alert_clean();"/>
                                    </spring:bind>
                                    delete before import
                                </td>
                            </tr>
                        </table>
                    </fieldset>
                    </c:forEach>

                    <c:if test="${formObject.showGroupsImport}">
                    <fieldset>
                        <table>
                            <tr>
                                <td><input type="checkbox" class="toggleall" checked=""></input></td>
                                <td><h2>Groups and Users</h2></td>
                            </tr>
                            <tr>
                                <spring:bind path="formObject.importGroupsFlag">
                                    <td><form:checkbox path="${status.expression}"/></td>
                                </spring:bind>
                                <td>Import groups</td>
                            </tr>
                            </c:if>

                            <c:if test="${formObject.showUsersImport}">
                            <tr>
                                <spring:bind path="formObject.importUsersFlag">
                                <td><form:checkbox path="${status.expression}"/></td>
                                </spring:bind>
                                <td>Import users</td>
                        </table>
                    </fieldset>
                    </c:if>

                    <c:forEach var="items" items="${formObject.serverItems}">
                    <fieldset>
                        <table>
                            <tr>
                                <td><input type="checkbox" class="toggleall" checked=""></input></td>
                                <td><h2>${items.key}</h2></td>
                            </tr>
                            <c:forEach var="item" items="${items.value}">
                                <tr>
                                    <spring:bind path="formObject.serverItems[${items.key}][${item.key}]">
                                        <td><form:checkbox path="${status.expression}"/></td>
                                    </spring:bind>
                                    <td>${item.key}</td>
                                </tr>
                            </c:forEach>
                        </table>
                    </fieldset>
                    </c:forEach>


                    <table>
                        <tr>
                            <td><input type="submit" class="bd-button bd-buttonGradientGreen bd-importbutton"
                                       value="Import"/></td>
                        </tr>
                    </table>
                    </form:form>
                        <% } %>
            </td>
            <td valign="top" class="bd-right">
                <div class="bd-top">
                    <p>This tool will help you setup the server components for the Backbase portal.

                    <p/>

                    <p>On this page you find a set of server components and portals available for importing. Components
                        are grouped
                        together based on the XML file the components are imported from. If you do not want
                        to import components, you can deselect them. Portal components are always imported as a whole.
                        You cannot select
                        subcomponents of a portal.</p>

                    <p>When you import components that are already available in Backbase portal, they will be ignored.

                    <p/>

                    <p>When you select 'delete before import' on a portal <b>it will delete the existing portal</b> with
                        this name
                        and import the portal again.

                    <p/>
                </div>
            </td>
        </tr>
    </table>
</div>
</div>

<div class="bd-footer">
    <span class="bd-leftInline">Support@backbase.com</span>
</div>

</body>
</html>

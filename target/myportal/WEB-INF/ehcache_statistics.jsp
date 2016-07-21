<%--
This JSP is used to display the Cache Statistics for the configured EhCache and Hibernate Second level caches.
There is an option to clear a EhCache by clicking the link next to the cache.
@author: Ajit Skanda Kumaraswamy
@since: v5.2.3
--%>

<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%String portalContextRoot = request.getContextPath();%>
<html>
<head>
    <title>EhCache Statistics summary</title>
    <%-- resolve url to local jQuery resources --%>
    <script type="text/javascript" src="<%= portalContextRoot %>/static/ext-lib/jquery-1.8.3.js"></script>
    <script type="text/javascript">
        function clearCache(cacheName) {
            var sServiceUri = "<%= portalContextRoot %>/caches/" + cacheName;
            makeDeleteRequest(sServiceUri);
        }

        function clearAllEhcaches() {
            makeDeleteRequest("<%= portalContextRoot %>/caches/ehcache/");
        }

        function clearAllHibernateCaches() {
            makeDeleteRequest("<%= portalContextRoot %>/caches/hibernate/");
        }

        function makeDeleteRequest(url) {
            $.ajax({
                url: url,
                type: "DELETE",
                success: function () {
                    document.location.reload();
                }
            });
        }
    </script>
</head>
<body id="mainBody">
<h3>EhCache Statistics</h3>
<a href="#" onclick="clearAllEhcaches()">
    Clear all Ehcache caches
</a>
<form action="#" method="DELETE" id="cacheDeleteFrom" name="cacheDeleteForm">
    <table border="1">
        <tr>
            <td>Associated Cache Name</td>
            <td>No. of Cache Hits</td>
            <td>No. of Cache Misses</td>
            <td>Object Count</td>
            <td>Eviction Count</td>
            <td>Average Get time</td>
            <td>In Memory Cache Hits</td>
            <td>On-disk Cache Hits</td>
            <td>Clear Cache</td>
        </tr>
        <c:forEach items="${model['ehCacheStatistics']}" var="item">
            <tr>
                <td>${(item.cacheName != null)? item.cacheName:""}</td>
                <td>${(item.cacheHitCount != null)? item.cacheHitCount:""}</td>
                <td>${(item.cacheMissCount != null)? item.cacheMissCount:""}</td>
                <td>${(item.cachedObjectCount != null)? item.cachedObjectCount:""}</td>
                <td>${(item.cacheEvictionCount != null)? item.cacheEvictionCount:""}</td>
                <td>${(item.averageFetchTime != null)? item.averageFetchTime:""}</td>
                <td>${(item.inMemoryHitCount != null)? item.inMemoryHitCount:""}</td>
                <td>${(item.onDiskHitCount != null)? item.onDiskHitCount:""}</td>
                <td>
                    <c:choose>
                        <c:when test="${(item.cacheName != null)}">
                            <a href="#" onclick="clearCache('${item.cacheName}')">
                                Clear ${item.cacheName} cache
                            </a>
                        </c:when>
                    </c:choose>
                </td>
            </tr>
        </c:forEach>
    </table>
</form>
<h3>Hibernate Secondary cache Statistics</h3>
<a href="#" onclick="clearAllHibernateCaches()">
    Clear all Hibernate caches
</a>
<table border="1">
    <tr>
        <td>Associated Cache Name</td>
        <td>No. of Cache Hits</td>
        <td>No. of Cache Misses</td>
        <td>Object Count</td>
        <td>Eviction Count</td>
        <td>Average Get time</td>
        <td>In Memory Cache Hits</td>
        <td>On-disk Cache Hits</td>
    </tr>
    <c:forEach items="${model['foundationCacheStatistics']}" var="cacheItem">

        <tr>
            <td>${(cacheItem.cacheName != null)? cacheItem.cacheName:""}</td>
            <td>${(cacheItem.cacheHitCount != null)? cacheItem.cacheHitCount:""}</td>
            <td>${(cacheItem.cacheMissCount != null)? cacheItem.cacheMissCount:""}</td>
            <td>${(cacheItem.cachedObjectCount != null)? cacheItem.cachedObjectCount:""}</td>
            <td>${(cacheItem.cacheEvictionCount != null)? cacheItem.cacheEvictionCount:""}</td>
            <td>${(cacheItem.averageFetchTime != null)? cacheItem.averageFetchTime:""}</td>
            <td>${(cacheItem.inMemoryHitCount != null)? cacheItem.inMemoryHitCount:""}</td>
            <td>${(cacheItem.onDiskHitCount != null)? cacheItem.onDiskHitCount:""}</td>
        </tr>
    </c:forEach>
</table>
</body>
</html>

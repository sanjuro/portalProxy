define(["zenith/promise","zenith/http/portals","zenith/core/errors-handler","angular","backbase.com.2012.sabre/widgets/CatalogBrowser/items-library","dashboard/widgets/CatalogManager/CatalogManager","jquery","css!backbase.com.2012.sabre/widgets/CatalogBrowser/items-library.css","backbase.com.2014.components/modules/fileupload/scripts/app"],function(h,c,e,d,b,a,g){var f=function(i,k){var l=k.getPreference("portalName"),j;if(l&&l!=="_"){j=c.portalDetails(l);i.isPortalCatalog=true;h.all(j).then(function(m){if(m){bd.selectedPortalName=l;bd.selectedPortalTitle=m.getProperty("title");bd.selectedPortalOptimizedFor=m.getProperty("DefaultDevice");bd.selectedPortalTargetDevice=m.getProperty("TargetedDevice");var n=typeof bd.widgets!=="undefined"&&typeof bd.widgets.PortalCatalog!=="undefined";if(n){a.renderUI(k.body,undefined,true)}g(k.body).find(".pageDesignerWrapper").show();b.makeLibraryWidget(k,n)}},function(m){e.trigger(m)})}else{a.renderUI(k.body,undefined,false)}};return d.module("CatalogManager",["bbFileupload"]).run(["$rootScope","Widget",f])});
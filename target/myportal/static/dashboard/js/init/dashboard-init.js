bd.initPortalClient=function(){var l=document.location.pathname.split("/").lastIndexOf("portals");portal.config.serverRoot="/"+document.location.pathname.split("/")[l===-1?1:l-1]+"/";portal.config.serverRoot=portal.config.serverRoot.match(/^\/+$/)?"/":portal.config.serverRoot.replace(/\/{2,}/,"/");portal.config.resourceRoot=portal.config.serverRoot;jQuery(document).delegate(".clientRenderingContainer","remove",function(){});be.utils.ajaxOverwrite();bd.sessionHandler.init();var e=b$.require("portal.views.dnd.DragManager");var t=b$.require("portal.views.dnd.DropManager");var a=b$.require("portal.models.item.Portal");var k=b$.require("portal.models.item.Preference");var b=b$.require("portal.models.item.Preferences");var d=b$.require("portal.models.item.StringDataType");var o=b$.require("portal.views.item.ItemViewRegistry");var h=b$.require("portal.models.layout-examples.StackFlowLayoutModel");var j=b$.require("portal.models.layout-examples.ColumnLayoutModel");var f=b$.require("portal.DefaultHydrogenViewRegistry");var c=b$.require("portal.PortalClient");var i=b$.require("portal.com.PortalsDataSource");var s=bd.oParentRegistry=new f();var n=bd.oViewRegistry=new o(s);n.registerLayout("page",h);n.registerLayout("column-container",j);bd.registerPerspectiveHanlding(bd.oParentRegistry,n);var g=new a(null,null,bd.portalName,new b([new k("DefaultLandingPage","Default Landing Page",bd.pageName,new d())]),[],false);var q=bd.oPortalClient=new c(document,n,bd.pageName,g,bd.contextRoot+"/");q.errorHandler=be.utils.portalClientErrorHandler;q.params={contextRoot:bd.contextRoot,portalType:"dashboard"};var p=e.extend();p.prototype.findDraggableTarget=function(u){var v=e.prototype.findDraggableTarget.call(this,u);if(v&&v.getModel().getItem().getPreference("isDraggable")=="false"){v=null}return v};var r=function(v,z){var x,u,y,w;v=v||{};if(v.id==z){return v}else{w=v.children||[];for(x=0,u=w.length;x<u;x++){var y=r(w[x],z);if(y){return y}}}};var m=function(v){var u;if(v){u=r(v.model,"PublishApp");if(bd.currentPage=="launcher"){portal.config=portal.config||{};portal.config.isPublishAppAvailable=!!u}}};q.addObserver("PropertyModified",function(v){if(v.attrName=="pageView"){m(this.pageView);var u=new p(this.pageView,this.document);u.start(this.document);new t(u).start()}},q);bd.registerGagdgets(q);bd.loadPage=function(z,y){var v=".clientRenderingContainer";if(bd.currentPage==z){return}bd.currentPage=z;if(z=="index"){jQuery(".bd-portalList").show();jQuery("#launcherHolder").remove()}if(z=="launcher"){jQuery('<div id="launcherHolder" style="display: none; width: 100%;"></div>').appendTo("body");v="#launcherHolder";if(bd.selectedPortalName==null){bd.selectedPortalName="dashboard";bd.selectedPortalTitle="Portal Manager"}}var x=jQuery(v);var u=x[0];x.addClass("bd-page-"+z);u.innerHTML="";q.portalsDataSource=new i(bd.contextRoot+"/",z,g.getId(),{cache:false});q.start({synchronize:true,container:v});if(z=="launcher"){setTimeout(function(){jQuery("#launcherHolder").show();be.openDialog({event:y,htmlContent:document.getElementById("launcherHolder"),excludeShadow:true,callback:function(){jQuery(".bd-portalList").hide();jQuery(".clientRenderingContainer").hide()}})},10);var w=function(){if(be.dialogContainersStack.length==0){bd.closeLauncher()}};jQuery(".bd-closeIcon").click(w)}};bd.closeLauncher=function(){be.closeCurrentDialog();setTimeout(function(){jQuery(".clientRenderingContainer").show();jQuery(".bd-portalList").show();bd.loadPage("index")},400)};bd.loadHomePage=function(){if(bd.pageName=="index"){bd.createPortalList()}bd.loadPage(bd.pageName)};bd.loadHomePage();jQuery(".bd-homeIcon").click(function(){bd.loadPage(bd.pageName)});setTimeout(function(){be.utils.processHTMLTemplate("errors/serverError",{})},3000);bd.toggleDropdownInit()};jQuery(document).ready(bd.initPortalClient);
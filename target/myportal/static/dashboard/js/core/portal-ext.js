bd.portalClientExt=(function(){var c=null;var h=function(n,m){var B=b$.require("b$.mvc.View");var z=b$.require("portal.models.holder.WidgetHolder");var D=b$.require("portal.views.holder.WidgetHolder");var i=b$.require("portal.widget.UserPreferenceField");var w=b$.require("portal.views.widget.UserPreferenceField");var r=b$.require("portal.widget.UserPreferencesForm");var t=b$.require("portal.views.widget.UserPreferencesForm");var s=b$.require("packages.portal4gadgets.widget.UserPreferencesForm");var x=b$.require("portal.widget.UserPreferenceFields");var A=b$.require("b$.mvc.SimpleViewFactory");var q=b$.require("packages.portal4gadgets.widget.Widget");var v=b$.require("portal.models.item.BooleanDataType");var y=b$.require("portal.widget.PerspectiveType");var j=b$.require("portal.widget.PerspectiveParameters");var o=b$.require("portal.models.item.SecurityProfile");var k=D.extend(function(H,E){D.call(this,H,E);this.form=new l(H.getPreferencesForm(),E);H.getPreferencesForm().addObserver("active",this.hideForm,this);var G=H.getItem();var F=function(I){if(I.attrName=="widgetChrome"){c=this}if(I.attrName.toLowerCase()=="title"){var J=G.getTitle();jQuery(".bd-widgetTitle",this.html).html(J);jQuery(".bd-editbarTitle",this.html).html(J)}};G.addObserver("PropertyModified",F,this);G.addObserver("PrefModified",F,this)});k.prototype.createHTML=function(K){var N=(bd.designMode=="true");var O=this.itemView;var P=this.getModel().getItem().getPreference("widgetChrome");if(P==null||P==""){P="$(contextRoot)/static/dashboard/templates/html/widgetChrome/defaultWidgetChrome.html"}var M=O.getHTML(K);var R=null;var S=o.CONSUMER;if(this.getModel().getItem().getSecurityProfile!=null){S=this.getModel().getItem().getSecurityProfile()}var F=(S==o.CONTRIBUTOR||S==o.COLLABORATOR||S==o.CREATOR||S==o.ADMIN);var J=F;var E=(S==o.CREATOR||S==o.ADMIN);var L=true;var I=true;if(N){J=false;E=false;I=false}if(bd.ssr==true){J=true;E=true;I=true}var G={contextRoot:bd.contextRoot,widgetTitle:this.getModel().getItem().getPreference("title"),widgetInstanceId:this.getModel().item.id,showEdit:J,showDelete:E,enableDND:I,showMaximize:L,ssr:(bd.ssr==true),designMode:N,widgetContent:""};var H=be.utils.replaceParams(P,bd.oPortalClient.params);var Q=be.utils.processHTMLTemplateByUrl(H,G);R=jQuery(Q,K);R.find(".bd-widgetBody").append(M);if(N&&bd.ssr!=true){R=u(this.getModel(),R)}this.addControls(R,K);if(bd.ssr==true){if(P=="$(contextRoot)/static/dashboard/templates/html/widgetChrome/noWidgetChrome.html"){R.hover(function(){jQuery(this).addClass("bd-widgetHover")},function(){jQuery(this).removeClass("bd-widgetHover")})}}return R.get(0)};var u=function(G,H){H.find(".bd-dragHandle").removeClass("bd-dragHandle");H.removeAttr("id");var F={widgetTitle:G.getItem().getPreference("title"),widgetInstanceId:G.item.id,widgetHTMLContent:""};var I=be.utils.processHTMLTemplate("itemDecorators/widgetEditBar",F);var E=jQuery(I);E.find(".bd-widgetPlaceholder").replaceWith(H);return E};k.prototype.getElementByHint=function(E){if(E=="draghandle"){var F=jQuery(".bd-dragHandle",this.html);var G=F.get(0);return G}else{return D.prototype.getElementByHint.call(this,E)}};k.prototype.addControls=function(K,E){var G=this;var J=this.getModel();var I=(bd.designMode=="true");K.find(".bd-maximizeButton").unbind();K.find(".bd-maximizeButton").click(function(){J.setCurrentPerspective(J.createPerspective(new y("Canvas"),new j()));G.loadMaximizedWidget(E)});K.find(".bd-refreshButton").unbind();K.find(".bd-refreshButton").click(function(){bd.oPortalClient.refreshWidget(G)});if(!I||bd.ssr==true){if(!this.isItemDraggable()){K.find(".bd-dragHandle").removeClass("bd-dragHandle")}K.find(".bd-deleteButton").unbind();K.find(".bd-deleteButton").bind("click",function(){be.utils.confirm({title:"Delete Widget",message:"Are you sure you want to delete this widget?",okBtnText:"Delete",cancelBtnText:"Cancel",yesCallback:function(){G.deleteButtonClicked();var L=J.getItem().getPreference("title");if(L=="Rich Content"||L=="Image Viewer"||L=="Image and Text"){bd.nicEditToolbar.removeContent(J.getItem().id)}},closeIcon:false})});K.find(".bd-showPreferences").unbind();K.find(".bd-showPreferences").click(jQuery.proxy(function(){this.showForm(1)},this))}else{var H=K;if(!K.hasClass("bd-widgetEditContainer")){H=K.parent()}if(H.hasClass("bd-widgetEditContainer")){var F=(H.data("events")!=undefined)||null;if(F==null){H.unbind();H.bind("mouseover",function(M){var L=jQuery(this).find(".bd-editOrClose-icon");if(L.is(":visible")){return}L.show()});H.bind("mouseout",function(M){var L=jQuery(this).find(".bd-editOrClose-icon");if(!L.is(":visible")||L.parent().hasClass("bd-editbarOpen")){return}L.hide()});H.find(".bd-editOrClose-icon").unbind();H.find(".bd-editOrClose-icon").bind("click",function(){var M=jQuery(this),L=M.parent();g(L,M)});H.find(".bd-icon-trash").unbind();H.find(".bd-icon-trash").bind("click",function(){be.utils.confirm({title:"Delete Widget",message:"Are you sure you want to delete this widget?",okBtnText:"Delete",cancelBtnText:"Cancel",yesCallback:function(){G.deleteButtonClicked();var L=J.getItem().getPreference("title");if(L=="Rich Content"||L=="Image Viewer"||L=="Image and Text"){bd.nicEditToolbar.removeContent(J.getItem().id)}},closeIcon:false})});H.find(".bd-icon-edit").unbind();H.find(".bd-icon-edit").click(jQuery.proxy(function(){this.showForm(1)},this));H.find(".bd-icon-permissions").unbind();H.find(".bd-icon-permissions").click(jQuery.proxy(function(){this.showForm(2)},this))}}}};k.prototype.bindControls=function(G,E){var F=(bd.designMode=="true");if(bd.ssr==true&&!F){this.addControls(G,E)}else{D.prototype.bindControls.call(this,G,E)}};k.prototype.showForm=function(E){oHtml=jQuery(this.form.getHTML(document));var F=this;oHtml.removeClass("portal-userPreferencesForm-active portal-userPreferencesForm-inactive").addClass("portal-userPreferencesForm-active");f(jQuery(this.html),oHtml);var G=jQuery("#flip3DContainer");G.find(".bd-tabLabels .bd-tab2").click(function(){if(!jQuery("#editWidgetTabs_Permissions .bd-permissionForm").length){bd.portalClientExt.loadWidgetPermission(F)}});if(E){G.find(".bd-tabLabels .bd-tab"+E.toString()).trigger("click")}};k.prototype.hideForm=function(E){if(!E.target.isActive()){var F=jQuery(this.html);e(F);this.form.release()}};k.prototype.loadMaximizedWidget=function(E){var G=this;var I=this.getModel();var H=jQuery(be.utils.processHTMLTemplate("widgetMaximized"),E).get(0);var F="width: "+(jQuery(E).width()-100)+"px; height: "+(jQuery(E).height()-100)+"px;";be.openDialog({htmlContent:H,closeIcon:true,wrapper:jQuery(".pageContainer").first(),callback:function(J){window.bd.oPortalClient.refreshWidget(G,function(M){jQuery(".bd-dialog-closeIcon",J).bind("click",function(){I.setCurrentPerspective(I.createPerspective(new y("Dashboard"),new j()));window.bd.oPortalClient.refreshWidget(G)});G.getItemView().release();var K=G.getFactory().getViewClass(M);var N=new K(M,G.getModel(),G.getFactory());var L=jQuery("#widgetContent",H);L.append(N.getHTML(E))})}})};var C=w.extend();C.prototype.createHTML=function(F){var E=this.model.getPreference().getName();var G=this.model.getPreference().getLabel()?this.model.getPreference().getLabel():E;var H=jQuery("<tr><td>"+G+'\n</td><td class="portalManagerPreferenceField-fieldHolder"></td><td></td></tr>',F);H.find(".portalManagerPreferenceField-fieldHolder").append(this.createFieldHTML(F));return H.get(0)};C.prototype.createUserInputElement=function(I){var K=this.model;var E=K.getPreference().getName();var N=bd.uiEditingOptions&&bd.uiEditingOptions.widgetPreferenceSelections?bd.uiEditingOptions.widgetPreferenceSelections[E]:null;var M=K.getValue();if(K.getPreference().getDataType() instanceof v){var F=jQuery('<input id="'+E+'_checkbox" type="checkbox"'+(M?' checked="checked"':"")+' name="'+E+'" />');var J=bd.enableSwitch(F,function(P){var Q=P.get(0).checked;setTimeout(function(){K.setValue(Q)},200)});return J}else{if(N){this.refresh=true;var O=[],L=M;for(option in N){if(N[option]==M){L=option}O.push({title:option,val:N[option],selected:N[option]==M})}var G={name:E,value:L,options:O};var H=be.utils.processHTMLTemplate("widgetDropdown",G);var J=jQuery(H);J.find(".bd-option").click(function(){var Q=jQuery(this);var P=Q.parent(".bd-dropdown");P.children().removeClass("bd-option-selected");Q.addClass("bd-option-selected");var S=Q.find(".bd-dropdown-label").text();var R=Q.attr("title");var T=jQuery("."+P.attr("for"),J).val(R);jQuery("."+P.attr("forlabel"),J).text(S);setTimeout(function(){K.setValue(R)},200)});return J}else{return w.prototype.createUserInputElement.call(this,I)}}};C.prototype.update=function(E,F){if(this.model.getPreference().getDataType() instanceof v||this.refresh){B.prototype.update.call(this,E,F)}else{w.prototype.update.call(this,E,F)}};var p=r.extend(function(E,F){r.call(this,E,F);var H=this;var G=[];E.getPreferences().each(function(J){var I=null;if(J.getViewHint()!=null&&J.getViewHint()!=""){I=H.createFieldFromUserPreference(J)}if(I){I.addObserver("value",H.fieldsValueChanged,H);G.push(I)}});this.fields=new x(G)});var l=t.extend(function(F,E){t.call(this,F,new A(i,C,E))});l.prototype.createHTML=function(){var I=this.model;var L=(bd.designMode=="true");var O=o.CONSUMER;if(this.model.widget.securityProfile!=null){O=this.model.widget.securityProfile}if(bd.designMode!="true"){if(I.fields.items!=null){var H=I.fields.items;var M=[];for(var N in H){var P=H[N].getPreference();var K=P.getName();var E="";if(P.getViewHint!=undefined){E=P.getViewHint()||""}if(E.indexOf("designModeOnly")==-1){M.push(H[N])}}}I.fields.items=M}var F={status:(I.isActive()?"active":"inactive"),showPermissionAndTargeting:L};var G=be.utils.processHTMLTemplate("preferenceEditor",F);var J=jQuery(G);this.fields.updateViews(I.getFields().getIterator());this.fields.render(J.find(".portalManagerPreferenceFieldView").get(0),J.find(".fieldsGoAfterMe").get(0),J.find(".fieldsGoBeforeMe").get(0));this.attachHandlers(J);return J.get(0)};l.prototype.attachHandlers=function(F){var H=this.model;var E=F.find(".portal-userPreferencesForm-okButton");var G=F.find(".portal-userPreferencesForm-cancelButton");E.click(function(){H.apply();H.deactivate()});G.click(function(){H.reset();H.deactivate()});if(!H.hasChanges()){E.addClass("bd-gradient-grey-disabled").get(0).disabled=true}};l.prototype.registerObservers=function(){var E=this;this.model.getFields().each(function(F){F.addObserver("value",E.valueChanged,E)})};bd.oParentRegistry.registerView(z,k);bd.oViewRegistry.setUserPreferencesFormFactory({createUserPreferencesFormForWidget:function(E){if(E instanceof q){return new s(E)}else{return new p(E)}}});l.prototype.valueChanged=function(E){var F=jQuery(this.html);if(E.target instanceof i){var G=this.model.hasChanges()&&this.model.isValid();var H=F.find(".portal-userPreferencesForm-okButton");H.get(0).disabled=!G;if(G){H.removeClass("bd-gradient-grey-disabled")}else{H.addClass("bd-gradient-grey-disabled")}}}};var f=function(j,n,m,i){var k=jQuery("#overlay");if(!k.length){jQuery("body").append('<div id="overlay" class="overlay"></div>');k=jQuery("#overlay")}k.css({opacity:0}).show().animate({opacity:0.5},800);if(m==null){m==""}var p=jQuery("#flip3DContainer");if(!p.length){jQuery("body").append('<div class="bd-FlipBoxContainer" id="flip3DContainer" style="display: none; '+m+'"></div>');p=jQuery("#flip3DContainer")}p.html(n);var l=function(){var q=(jQuery(window).height()-p.height())/2;p.css({left:(jQuery(window).width()-p.width())/2,top:(q>10?q:10)})};l();jQuery(window).bind("resize",l);var o=j.add(p).canvasFlip({radius:0,duration:1000,before:function(r,q){r.css({visibility:"hidden"})},after:function(r,q){q.show().css({visibility:""});if(i){i()}}});j.data("flip",o.next());bd.currentWidgetBox=j};var e=function(i){var j=jQuery("#overlay");j.animate({opacity:0},1000,function(){j.hide();j.remove()});if(i.data("flip")){i.data("flip").next({duration:800,after:function(l,k){l.remove();if(c){bd.oPortalClient.refreshWidget(c);c=null}else{k.show().css({visibility:""})}}});i.removeData("flip")}};var b=function(i){e(bd.currentWidgetBox);bd.currentWidgetBox=null;return false};var a=function(j){var k=j.getModel().getItem().getId();var i="#editWidgetTabs_Permissions";var l={portalName:bd.portalName,itemName:k,itemType:"widget",context:bd.contextRoot+"/portals/"+bd.portalName+"/widgets/"+k,domParent:i,closeCallback:function(){if(bd.portalName=="dashboard"){var m=jQuery("#editWidgetTabs_Permissions");if(m.length>0){be.closeCurrentDialog();m.hide();m.remove()}}else{j.form.getModel().deactivate()}}};bd.Permission.loadPermissionsAndGroups(l)};var d=null;var g=function(i,m){var j=i.find(".bd-editbarInner"),l=m,n=200;i.toggleClass("bd-editbarOpen");if(i.hasClass("bd-editbarOpen")){i.addClass("bd-dragHandle");j.fadeIn();l.attr("title","close menu bar");i.animate({width:"100%",top:"-=22px","margin-left":"0"},{duration:n});if(d!=null){var k=jQuery(d.find(".bd-editOrClose-icon").get(0));g(d,k);k.hide()}d=i}else{i.removeClass("bd-dragHandle");j.fadeOut();l.attr("title","open edit menu");i.animate({width:"20px",top:"+=22px","margin-left":"0"},{duration:n});d=null}};return{registerCustomSkin:h,closeMaximizedWidget:b,loadWidgetPermission:a}}());
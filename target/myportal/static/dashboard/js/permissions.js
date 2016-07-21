bd.Permission=(function(){var V="cannot be updated because it is locked";var F="CANNOT CHANGE PORTAL PERMISSIONS";var j="Some pages that need to be updated appear to be locked.";var m=null;var i=null;var u;var x={};var O="NONE";var E={sProfileToText:{ADMIN:"Can Administer",CREATOR:{ADMIN:"Can Edit",MANAGER:"Can Edit",USER:"Can Personalize",DEFAULT:"Can Personalize"},COLLABORATOR:"COLLABORATOR",CONTRIBUTOR:"CONTRIBUTOR",CONSUMER:"Can View"},TextToSProfile:{"Can Administer":"ADMIN","Can Edit":"CREATOR","Can Personalize":"CREATOR",COLLABORATOR:"COLLABORATOR",CONTRIBUTOR:"CONTRIBUTOR","Can View":"CONSUMER"}};E.sProfileToText[O]="No Access";E.TextToSProfile["No Access"]=O;var L=bd.isAdmin||window.top.bd.isAdmin,g="rights.xml",K="advancedrights.xml",b="advancedrights.xml",q="masterpage_root",Q="Yes",R="No",J=[{name:"manager",role:"MANAGER",securityProfile:"ADMIN"},{name:"master page designer",role:"MANAGER",securityProfile:"ADMIN"},{name:"user",role:"USER",securityProfile:"CONSUMER"}];var U=function(ac,ad,ab,Z){var af,ae="";if(ab){ae=ab}else{ae=m.context}var X=ae+"/"+g;if(X.indexOf("/links/")!=-1){X=ae+"/"+K}else{if(!ab&&m&&m.itemType==="portal"){X=ae+"/"+b}}try{var Y=be.utils.processXMLTemplate("portalRights",ac);af=be.utils.ajax({url:X,data:Y,type:"PUT",async:false,success:function(){M({showMsg:ad,successCallback:Z,defaultPortalRights:Y,templateData:ac})}})}catch(aa){console.log("setPermission exception",aa)}return af};var M=function(X){if(X.showMsg==null){if(m&&m.savedCallback){m.savedCallback(X.defaultPortalRights,X.templateData)}bc.component.notify({uid:"9985",icon:"checkbox",message:"Permissions have been applied successfully."})}if(X.successCallback){X.successCallback()}if(window!=window.top&&bd){bd.refreshPageTree(500)}else{if(bd&&bd.pm&&bd.pm.view&&bd.pm.observer&&bd.PageMgmtTree){bd.pm.view.refreshLinksAndDetails(bd.PageMgmtTree.selectedLink.uuid,true)}}};var W=function(Z){var X={title:"ERROR",message:jQuery(Z.xhr.responseText).find("message").text(),closeIcon:true,respondToEscKey:true,buttons:[{title:"OK",type:"white",callback:function(){}}]};var Y=Z.xhr;bc.component.dialog(X)};var a=function(ab){var Z=bc.component.dropdown({target:".bd-add-group-dd",label:"Add Group",uid:"8256",minWidth:"120px",icon:"group"});$groupDropDown=Z[0].dropdownOptions;var Y=function(aj){var ai=jQuery(".bd-permission-groupName",ab.$domParent);for(var ah=0,af=ai.length;ah<af;ah++){var ag=ai[ah].getAttribute("sid");if(ag=="group_"+aj){return true}}return false};var ae="";var ad=0;for(var X in ab.templateData.groupHashMap){var aa=ab.templateData.groupHashMap[X];var ac=aa.name;if(!Y(ac)){if(!L){if(aa.role!="ADMIN"&&aa.role!="MANAGER"&&aa.role!="SYS2SYS"){ae+='<a href="#" sid="group_'+ac+'" class="bc-dropdown-item bc-ellipsis" onclick="return false;" title="'+ac+'"><span class="bc-option-label">'+ac+"</span></a>";ad++}}else{ae+='<a href="#" sid="group_'+ac+'" class="bc-dropdown-item bc-ellipsis" onclick="return false;" title="'+ac+'"><span class="bc-option-label">'+ac+"</span></a>";ad++}}}$groupDropDown.html(ae);if(ad==0){jQuery(".bd-add-group-dd .bc-selectbox").addClass("bd-groups-empty");jQuery(".bd-groupsEmptyMsg").show()}$groupDropDown.undelegate("a","click").delegate("a","click",function(af){af.preventDefault();w(jQuery(this),ab)})};var d=function(){var X=(m.itemType=="portal");if(X){v(function(Y){t({masterPageRootRights:Y,isPortal:true})})}else{t({masterPageRootRights:null,isPortal:false})}};var t=function(Y){var X=X?X:top.bd;Y.linkTitle=m.linkTitle||null;Y.$domParent=jQuery(m.domParent);if(m==null||m.listOfGroupsForCurrentUser==null){m=m||{};m.listOfGroupsForCurrentUser={};be.utils.ajax({url:X.contextRoot+"/users/"+X.loggedInUserId+"/groups.xml?ps=0",success:function(Z){s(Y,Z)},dataType:"xml"})}else{r(Y)}};var s=function(Z,Y){var ab=be.utils.xpathNodes(Y,"/groups/group/name/text()");for(var X=0;X<ab.length;X++){var aa=ab[X].nodeValue;m.listOfGroupsForCurrentUser["group_"+aa]="group_"+aa}r(Z)};var r=function(Y){var X;if(m.context){X=m.context+"/"+g+"?lastModifiedTimestamp(dsc)"}if(X.indexOf("/links/")!=-1){X=m.context+"/"+K+"?lastModifiedTimestamp(dsc)"}if(X){be.utils.ajax({url:X,cache:false,dataType:"xml",success:function(Z){Y.responseDataXML=Z;p(Y)}})}};var p=function(X){jQuery(document).unbind("click.permissionDropDownList");be.utils.ajax({url:bd.contextRoot+"/groups.xml?ps=0",success:function(Y){o(X,Y)},error:function(Y){be.utils.alert({message:Y.responseText});n(X)},cache:false,data:null,dataType:"xml",type:"GET"})};var o=function(ab,aa){var Y=bd.xmlToJson({xml:aa});x={};for(var Z=0,X=Y.groups.group.length;Z<X;Z++){x[Y.groups.group[Z].name]=Y.groups.group[Z]}n(ab)};var n=function(ag){try{var al=bd.xmlToJson({xml:ag.responseDataXML});delete ag.responseDataXML;var X=false;var ah="No Access";var aa=al.rights.itemRight;var ae=true;var ab={},ak={};if(!aa.length||aa.length<1){aa=al.rights;ae=aa.itemRight.inherited=="false"?false:true}else{ae=aa[0].inherited=="false"?false:true}var aj=[];$.each(aa,function(am,an){an.role=an.sid.substring(6);an.role_anonymous=an.sid=="role_anonymous";an.can_change=(an.sid!="group_admin"&&!m.listOfGroupsForCurrentUser[an.sid]);if(typeof(E.sProfileToText[an.securityProfile])=="object"){if(x[an.role]){an.can=E.sProfileToText[an.securityProfile][x[an.role].role];if(an.can===undefined){an.can=E.sProfileToText[an.securityProfile]["DEFAULT"]}}else{if(an.role_anonymous){ah=E.sProfileToText[an.securityProfile]["USER"]}else{}}}else{if(an.role_anonymous){ah=E.sProfileToText[an.securityProfile]}else{an.can=E.sProfileToText[an.securityProfile]}}if(an.securityProfile=="CONSUMER"&&an.role_anonymous){X=true}ab[an.sid]={sid:an.sid,securityProfile:an.securityProfile};ak[an.sid]={sid:an.sid,securityProfile:an.securityProfile};if(!L&&x[an.role]){if(x[an.role].role=="MANAGER"||x[an.role].role=="ADMIN"||x[an.role].role=="SYS2SYS"){aj.push(am)}}if(!x[an.role]){aj.push(am)}});for(var ai=aj.length-1;ai>=0;ai--){al.rights.itemRight.splice(aj[ai],1)}var ad={data:al.rights,contextRoot:bd.contextRoot,isPortal:ag.isPortal,isPortalStyle:ag.isPortal&&L?"bc-1-3":"bc-1-2",masterPageRootRights:ag.masterPageRootRights,isAdmin:L,linkTitle:ag.linkTitle,itemIcon:m.itemIcon,CONSUMER_role_anonymous:X,anonymousRight:ah,isChecked:ae,currentDialogPrefix:m.itemType,hideEditButtons:m.hideEditButtons,hideCloseButtons:m.hideCloseButtons};ad.groupHashMap=x;x={};var ac=jQuery(be.utils.processHTMLTemplate("permissions/permissionsUI",ad));ac=A(ac,{templateData:ad},false);var Y=ag.$domParent;var af=jQuery("<div/>").append(ac).html();Y.html(af);Y.undelegate(".bd-permissionsEditButton","click").delegate(".bd-permissionsEditButton","click",function(am){am.preventDefault();B({templateData:ad,$domParent:Y,savedPermissionView:af,savedPermissionList:ab,originalPermissionList:ak})});Y.undelegate(".bd-permissionsCloseButton","click").delegate(".bd-permissionsCloseButton","click",function(am){am.preventDefault();l()});bc.component.addKeyboardAccess(Y)}catch(Z){console.log("Permissions: "+Z)}};var e=function(Y,X){m=Y;P(J,X)};var c=function(X){m=X;d();if(X.itemType=="portal"){i=X}be.closeCurrentDialogCallback=function(){try{if(i){bd.Permission.loadPermissionsAndGroups(i)}}catch(Y){console.log(Y)}}};var f=function(Y,aa){if(aa.sid=="anonymous"){var ab=Y.find(".bd-anonymous-dd")}else{var ab=Y.find(".bd-group-dd-"+aa.sid)}var X=bc.component.dropdown({target:ab,label:aa.label,uid:"9875",minWidth:"90px",options:aa.options,sid:aa.sid});var Z=X[0].dropdownOptions};var w=function(ac,aa){var ab=jQuery(".bd-permissionForm-list",aa.$domParent),ad=jQuery(".bd-permission-groupTable",aa.$domParent),Z={can:"Can View",can_change:(ac.attr("sid")!="group_admin"),isAdmin:L,sid:ac.attr("sid"),role:ac.attr("title"),securityProfile:"CONSUMER",contextRoot:bd.contextRoot,checkRole:aa.templateData.checkRole,isPortalStyle:aa.templateData.isPortalStyle},ae=ad.parents(".aa-activeTab, .bd-activeTab");aa.savedPermissionList[ac.attr("sid")]={sid:ac.attr("sid"),securityProfile:"CONSUMER"};var Y=$(be.utils.processHTMLTemplate("permissions/permissionGroup",Z));var X=k(Z.sid);f(Y,aa.templateData.optionsList[X]);A(Y,aa,true);ad.append(Y);ab.animate({scrollTop:ad.height()-24});var af=$(".bd-add-group-dd .bc-selectbox");if(ac.siblings().length<=0){af.addClass("bd-groups-empty");$(".bd-groupsEmptyMsg").show()}ac.remove();bc.component.addKeyboardAccess(ae);setTimeout(function(){af.focus()},400);return false};var z=function(ac,Z,ab){var X=$.trim(ac.text());var aa=ac.closest(".bc-permissions-dd");var ae=aa.attr("data-sid");var af=null;var ad=$(".bc-dd-sid-"+ae).parents(".tr-permission");var Y;if(ab){af=ab.parents(".tr-permission").find(".bd-permission-groupName")}else{af=ad.find(".bd-permission-groupName")}if(af.length>0){Y=af.attr("sid");Z.savedPermissionList[Y]={sid:Y,securityProfile:E.TextToSProfile[X]};if(Z.templateData.isPortal){C(ad.find(".td-permissionOpts-privileges").siblings(".td-permissionOpts-design-mp"),E.TextToSProfile[X],Y,Z)}}else{Z.savedPermissionList.role_anonymous={sid:"role_anonymous",securityProfile:E.TextToSProfile[X]}}return false};var l=function(){if(m.closeCallback!=null){try{m.closeCallback()}catch(X){console.log(X)}m=null}return false};var h=function(Z,aa){var X=Z.parents(".tr-permission");var Y=X.find(".bd-permission-groupName");var ab='<a onclick="return false;" class="bc-dropdown-item bc-ellipsis" sid="'+Y.attr("sid")+'" href="#" title="'+Y.attr("title")+'"><span class="bc-option-label">'+Y.text()+"</span></a>";$groupDropDown.append(ab).hide();jQuery(".bd-add-group-dd .bc-selectbox").removeClass("bd-groups-empty");jQuery(".bd-groupsEmptyMsg").hide();X.remove();if(aa.savedPermissionList[Y.attr("sid")]){aa.savedPermissionList[Y.attr("sid")].securityProfile=O}G(Y.attr("sid"),aa);return false};var T=function(X){X.$domParent.html(X.savedPermissionView);jQuery(document).unbind("click.permissionDropDownList")};var D=function(Z){var Y=[],aa=Z.templateData.groupHashMap,ac=jQuery(".bd-sameParentCheckbox",Z.$domParent).prop("checked")?true:false,ab=ac?Z.originalPermissionList:Z.savedPermissionList;for(var ae in ab){var ad=ab[ae];Y.push({sid:ad.sid,securityProfile:ac?O:ad.securityProfile})}if(ac){U({rightData:Y}).done(d)}else{var ag=function(){var ai=function(){if(m&&m.isMasterPage){bd.masterpage.setMPPermission(Y,aa,m.pageName).done(d)}else{d()}};U({rightData:Y}).done(ai)};if(Z.templateData.isPortal&&Z.templateData.masterPageRootRights){var af=[];for(var ah in Z.designMasterPagePermissions){var X=Z.designMasterPagePermissions[ah];af.push({sid:X.sid,securityProfile:X.securityProfile})}U({rightData:af},"",bd.contextRoot+"/portals/"+bd.selectedPortalName+"/links/"+q).done(ag)}else{ag()}}};var H=function(ab){var ad=ab.templateData.isChecked,aa=ab.$domParent,X=$(".bc-form-body",aa),ac=$(".bd-permissionsEditRegion",aa),Y=$(".bd-permission-dd,.bd-add-group-dd",aa).find(".bc-selectbox"),Z=aa.parents(".aa-activeTab");X.toggleClass("bd-whiteWrapper",!ad);ac.toggleClass("bd-permissionsEditDisabled",ad);Y.toggleClass("bc-gradient-grey",!ad).toggleClass("bd-gradient-grey-disabled",ad);if(Z.length==0){Z=aa}if(ad){$(".bd-permissionCaution, .tr-permissionGroup, .bd-permission-deleteGroup",ab.$domParent).css("display","none")}else{$(".bd-permissionCaution, .tr-permissionGroup",ab.$domParent).css("display","block");$(".bd-permission-deleteGroup",ab.$domParent).attr("style","")}bc.component.addKeyboardAccess(Z)};var B=function(ac){ac.templateData.checkRole=function(){return function(ao,ae){var ak={name:"Can Administer",href:"javascript:void(0);"};var ag={name:"Can Edit",href:"javascript:void(0);"};var an={name:"Can View",href:"javascript:void(0);"};var ah={name:"Can Personalize",href:"javascript:void(0);"};var aj={name:"No Access",href:"javascript:void(0);"};var af=this;var ap=[];var al=af.can?af.can:af.anonymousRight;var ad=this.sid?k(this.sid):"anonymous";var am=this.sid?'<div class="bd-permission-dd bd-group-dd-'+ad+'"></div>':'<div class="bd-permission-dd bd-anonymous-dd"></div>';if(af.role){if(ac.templateData.groupHashMap[af.role]){var ai=ac.templateData.groupHashMap[af.role].role;if(ai=="ADMIN"){ap.push(ak,ag,an)}else{if(ai=="MANAGER"){ap.push(ak,ag,an)}else{ap.push(ah,an)}}}else{if(ac.savedPermissionList[af.sid]){ac.savedPermissionList[af.sid].securityProfile=O}}}else{ap.push(ah,an,aj)}ac.templateData.optionsList[ad]={label:al,options:ap,sid:ad};return ae(am)}};if(!ac.templateData.optionsList){ac.templateData.optionsList={}}var Y=$(be.utils.processHTMLTemplate("permissions/editPermissions",ac.templateData));var Z=Y.find(".bd-sameParentWrapper");var ab=bc.component.toggleSwitch({target:Z,uid:"1227",name:"bd-sameParentCheckbox",checked:ac.templateData.isChecked,callback:function(){ac.templateData.isChecked=!ac.templateData.isChecked;H(ac);top.$(".bd-iframeContainer").height(top.$(".bd-iframeContainer").height()-1);setTimeout(function(){top.$(".bd-iframeContainer").height("")},100)}});ab.find("input").addClass("bd-sameParentCheckbox");for(var X in ac.templateData.optionsList){var aa=ac.templateData.optionsList[X];f(Y,aa)}A(Y,ac,true);ac.$domParent.html(Y);$(".bd-permissionForm-list").scroll(function(){if(jQuery(".bc-dropdown-items").length>0){jQuery(".bc-dropdown-items").slideUp("fast",function(){jQuery(".bc-dropdown-items").detach();jQuery(".bc-selectbox.bc-open").removeClass("bc-open")})}});a(ac);H(ac);ac.$domParent.undelegate(".bd-permission-savePermission","click").delegate(".bd-permission-savePermission","click",function(ad){ad.preventDefault();D(ac)});$("body").undelegate(".bc-permissions-dd a","click").delegate(".bc-permissions-dd a","click",function(ad){z(jQuery(this),ac)});ac.$domParent.undelegate(".bd-permission-deleteGroup","click").delegate(".bd-permission-deleteGroup","click",function(ad){ad.preventDefault();h(jQuery(this),ac)});ac.$domParent.undelegate(".bd-permission-cancelButton","click").delegate(".bd-permission-cancelButton","click",function(ad){ad.preventDefault();T(ac)});bc.component.addKeyboardAccess(Y)};var I=function(X){jQuery(".bd-permissionForm",X.$domParent).delegate(".bd-showInheritanceTree","click",function(){var Y=this;jQuery(this).parent().find(".bd-inheritanceTree").toggle(300,function(){var Z=jQuery(this).parent().find(".bd-inheritanceTree").is(":visible");jQuery(Y).html((Z?"Hide":"Show full inheritance tree."))})})};var S=function(Y){if(Y&&Y.role=="MANAGER"){m={context:bd.contextRoot+"/portals/"+bd.portalName};U({rightData:[{sid:"group_"+Y.name,securityProfile:"CONSUMER"}]});var X=function(ab){var Z=bd.xmlToJson({xml:ab});if(Z&&Z.templates){var aa=Z.templates.template;aa=aa.length?aa:[aa];$.each(aa,function(ac,ad){m={context:bd.contextRoot+"/templates/"+ad.name};U({rightData:[{sid:"group_"+Y.name,securityProfile:"ADMIN"}]})})}};be.utils.ajax({url:bd.contextRoot+"/templates.xml",cache:false,success:X,dataType:"xml"})}};var k=function(Y){var X=be.utils.replaceRefuzingChars(Y,"name");X=X.replace(/(\s)+/g,"");return X};var v=function(Z){var X=null,Y;be.utils.ajax({url:bd.contextRoot+"/portals/"+bd.selectedPortalName+"/links/"+q+"/rights.xml",cache:false,dataType:"xml",success:function(ac){Y=bd.xmlToJson({xml:ac});if(Y.rights&&Y.rights.itemRight){Y=Y.rights.itemRight}if(!Y.length){Y=[Y]}X={};var ab,aa,ad;for(ab=0,aa=Y.length;ab<aa;ab++){ad=Y[ab];X[ad.sid]=ad}Z(X)},error:function(ab,aa){var ac=ab.status;if(ac===403){}else{if(ac===404){X=null}}Z(X)}})};var A=function(Z,ac,af){if(!ac.templateData.masterPageRootRights){Z.find(".td-permissionOpts-design-mp").remove();return Z}var ah=Z.find(".bd-masterPageDesign-toggle-replacer"),ae,aa,X,ag,Y,ai,ad,ab=ac.templateData.isPortal;if(!ac.designMasterPagePermissions){ac.designMasterPagePermissions={}}for(ae=0,aa=ah.length;ae<aa;ae++){X=jQuery(ah[ae]);Y=X.attr("data-sid");ai=X.attr("data-securityProfile");ad=X.attr("data-role"),groupRole="COMSUMER",x=ac.templateData.groupHashMap,masterPageRootRights=ac.templateData.masterPageRootRights;if(ad){if(x[ad]){groupRole=x[ad].role}}if(Y==="group_admin"){ac.designMasterPagePermissions[Y]={sid:Y,securityProfile:"ADMIN"};X.html(Q);X.show()}else{if(groupRole==="MANAGER"){if(af){ag=bc.component.toggleSwitch({target:X,uid:"1257",name:"bd-designMasterPageCheckbox",checked:masterPageRootRights[Y]?true:false,callback:function(al,am){var ak=al.parent(),aj=ak.attr("data-sid");if(am.prop("checked")){N(aj,ac)}else{G(aj,ac)}}})}else{X.html(masterPageRootRights[Y]?Q:R)}if(ai==="ADMIN"){X.show()}}else{X.remove()}}}return Z};var C=function(aa,Y,X,Z){if(Y==="ADMIN"){aa.find(".bd-masterPageDesign-toggle-replacer").show()}else{aa.find(".bd-masterPageDesign-toggle-replacer").hide();G(X,Z)}};var N=function(X,Y){if(!Y.templateData.masterPageRootRights){return}if(!Y.designMasterPagePermissions[X]){Y.designMasterPagePermissions[X]={sid:X,securityProfile:"ADMIN"}}else{Y.designMasterPagePermissions[X].securityProfile="ADMIN"}};var G=function(X,Y){if(!Y.templateData.masterPageRootRights){return}if(Y.designMasterPagePermissions[X]){Y.designMasterPagePermissions[X].securityProfile=O}else{Y.designMasterPagePermissions[X]={sid:X,securityProfile:O}}};var y=function(ad){var ae,ac,ab,Y,af,X,Z={},aa=function(ag){ae=be.utils.xpathNodes(ag,"/groups/group/name/text()");ac=be.utils.xpathNodes(ag,"/groups/group/role/text()");for(ab=0,Y=ae.length;ab<Y;ab++){af=ae[ab].nodeValue;X=ac[ab].nodeValue;Z[af]={sid:"group_"+af,name:af,role:X}}if(ad){ad(Z)}};be.utils.ajax({url:bd.contextRoot+"/groups.xml?ps=0",success:aa,dataType:"xml"})};var P=function(X,Z,Y){y(function(af){var ad,ab,ag,aa,ae={},ac=[];for(ad=0,ab=X.length;ad<ab;ad++){ag=X[ad];aa=ag.name;if(af[aa]&&af[aa].role===ag.role){ac.push({sid:af[aa].sid,securityProfile:ag.securityProfile})}}if(!ac.length){return}ae.rightData=ac;U(ae,Z,Y)})};return{setDefaultPermission:e,loadPermissionsAndGroups:c,setDefaultGroupPermission:S,setPermission:U,setDefaultPermissionOnDemand:P}}());
b$.module("bd.widgets.GroupMgmt",function(){var b=b$.require("bd.DataSource"),a=b$.require("bd.PagedList"),e="",c=function(){};function d(g){if(!bd.uiEditingOptions.usersAndGroups.allowManagement){var f=[];if(g){f=jQuery(g).find(".bd-managedElement")}else{f=jQuery(".bd-managedElement")}jQuery.each(f,function(h,i){jQuery(i).remove()});return false}return true}this.Maximized=function(J){var g=jQuery(".bd-groupManagement",J)[0],W=e,K=e,k=e,aA=e,au=e,A=0,ay="admin",Z="manager",aG="admin",M="manager",n="sys2sys",al=jQuery(".bd-editUserFormContainer",J),ah=new R(),V=new R(),ae,O,aw,v,ab,ak,h,Y,x,C,F,aj,ag,l,ai,I,ac,w,p,L,ar,E,ad,am,u,H,av,P,y,az,N,aq,T=null,f=null,aB=null,m=null,B=null,o,af,aC,aa,s,S=null,Q,at,aJ,j,aK,r,aD,t,ap,aE,X,i,aH,ax,aI,U,G,q,D,z,ao,an,aF;ae=jQuery(".bd-column2Container",g);ae.undelegate(".bd-columnHeader .bd-tab1","click").delegate(".bd-columnHeader .bd-tab1","click",function(){O();ai()});ae.undelegate(".bd-columnHeader .bd-tab2","click").delegate(".bd-columnHeader .bd-tab2","click",function(){aw();o()});O=function(){var aM="",aL=ae.find(".bd-tabLabel.bd-tab2"),aP=jQuery(".bd-selectall-list .bc-checkbox-select",ae)[0],aO,aN;if(!aP){aO=bc.component.dropdown({target:".bd-selectall-list",type:"all-select",uid:"4356"});aN=aO[0].dropdownOptions;aN.delegate(".bc-selectall","click",P);aN.delegate(".bc-selectnone","click",y);jQuery(".bc-custom-checkbox").click(function(){var aQ=jQuery(this).hasClass("c_on")?P:y;aQ()});aN.delegate("input","change",function(){var aQ=this.checked?P:y;aQ()})}if(W==="AllUsers"){aM="/users.xml?s=username(asc)&of="+ah.getOffSet()+"&ps="+ah.getPageSize();aL.hide();ae.find(".bd-openPaneButton").hide()}else{aM="/groups/"+W+"/users.xml?s=username(asc)&of="+ah.getOffSet()+"&ps="+ah.getPageSize();aL.show();ae.find(".bd-openPaneButton").show()}jQuery("#addUserTag-Wrapper").show();av(aM);aH("1",ae);aI("show")};aw=function(){var aL=function(){aH("2",ae);d(Y);jQuery("#addUserTag-Wrapper").hide();aI("hide")};if(W==="AllUsers"){O()}else{v("groupDetails",Y).done(aL)}};v=function(aM,aL){var aN=function(aO){var aT=aO.group.id||"",aQ={USER:"None",MANAGER:"Can manage portals",ADMIN:"Can create portals & manage global settings",SYS2SYS:"Not applicable"},aR=typeof aO.group.description==="object"?" ":aO.group.description,aP={id:aT,name:aO.group.name,role:aO.group.role,isAdminGroup:W===aG,isSys2sysGroup:W===n,roleText:aQ[aO.group.role],description:aR},aS=be.utils.processHTMLTemplate("groups/"+aM,aP);aL.html(aS);if((aM==="editGroup")&&(!aP.isSys2sysGroup)&&(!aP.isAdminGroup)){bc.component.dropdown({target:".bd-group-edit-dropdown",selected:aP.role,label:aP.roleText,forlabel:"bd-groupForm-role-dropdownbox",uid:"5436",options:[{name:"None",value:"USER"},{name:"Can manage portals",value:"MANAGER"},{name:"Not applicable",value:"SYS2SYS"}]})}};return aF("/groups/"+W+".xml",aN)};ab=jQuery(".bd-groups",g);ak=ab.find(".bd-viewportWrapper");h=jQuery(".bd-groupDetails",g);Y=h.find(".bd-groupDetailsViewport");x=function(aM){var aL,aN=function(aR){var aQ,aU,aO,aV="",aT,aS,aP;d(g);aQ=ak.find(".bd-listDataholder");aU={obj:aR,rootnode:"groups",childnode:"group"};aO=V.pageSizeControl(aU,ab);for(aP=0;aS=aO[aP];aP++){aV+='<a class="bd-listItem bd-autoTest-groupList-'+aS.name+'" itemid="'+aS.name+'" itemrole="'+aS.role+'"> '+aS.name+" </a>";aS=aO[aP]}if(aM&&aM.loadMore){aQ.append(aV)}else{aQ.html(aV)}aT=aQ.find('a[itemid="AllUsers"]');if(!aT||aT.length<=0){aQ.prepend('<a class="bd-listItem bd-autoTest-groupList-AllUsers" itemid="AllUsers"><i> All Users </i></a>')}jQuery("a",aQ).unbind("click").click(function(){C(this)})};if(!aM||!aM.loadMore){V.setOffSet(0)}aL="/groups.xml?s=name(asc)&of="+V.getOffSet()+"&ps="+V.getPageSize();aF(aL,aN)};C=function(aM){var aL;W=jQuery(aM).attr("itemid");K=jQuery(aM).attr("itemrole");jQuery(aM).addClass("bd-selected");jQuery(aM).siblings().removeClass("bd-selected");ah.setOffSet(0);aL=ae.find(".bd-tabLabel.bd-tab2");if(W){if(W===aG||W===M){h.find(".bd-deleteButton").hide()}else{h.find(".bd-deleteButton").show()}ae.find(".bd-columnHeader .bd-content").show();u();if(aL.hasClass("bd-activeTab")){aw()}else{O()}ai();h.find(".bd-buttons").show()}else{ae.find(".bd-columnHeader .bd-content").hide();ae.find(".bd-columnEditor").hide()}};h.undelegate(".bd-deleteButton","click").delegate(".bd-deleteButton","click",function(){var aL=function(){be.utils.ajax({url:bd.contextRoot+"/groups/"+W+".xml",success:function(){x();ak.find('a[itemid="'+W+'"]').removeClass("bd-selected");W=null;ax("2",ae);ae.find(".bd-columnHeader .bd-content").hide();u();bc.component.notify({uid:"1123",icon:"checkbox",message:"The group has been deleted."})},type:"DELETE"})};be.utils.confirm({title:"Remove Group",message:"This will remove the "+K+" group, '"+W+"', which cannot be undone. Group users will not be deleted. Are you sure you want to continue?",yesCallback:aL})});F=function(){var aL=function(aM){var aN={rules:{name:{validTitle:true}},messages:{name:{validTitle:"Group name can not contain any special characters"}}};aM.attr({action:"groups",method:"post",autocomplete:"off"});z(aM,aN);aM.find("input:first").focus()};ao({templateName:"createGroup",templateData:null,prepareForm:aL,form:{width:"650px",height:"300px",ok:"Save",cancel:"Cancel",content:"",title:"NEW GROUP",uid:"groups",cls:"bd-tCont-presetSelect-form",okCallback:ag}})};aj=function(){be.closeCurrentDialog()};ab.undelegate(".bd-openPaneButton","click").delegate(".bd-openPaneButton","click",F);ag=function(aN){var aP=jQuery("select",aN).attr("value"),aM={name:aN.name.value,description:aN.description.value,role:aP},aL=function(){bd.Permission.setDefaultGroupPermission(aM);x();aj();bc.component.notify({uid:"1113",icon:"checkbox",message:"Group was created successfully."})},aO=be.utils.processXMLTemplate("groups/createGroup",aM);be.utils.ajax({url:bd.contextRoot+"/groups.xml",data:aO,success:aL,error:function(aR){var aQ=jQuery("#groupCreateForm").validate();if(aR.responseText.indexOf("already exists")!==-1){aQ.showErrors({name:"This group name is already in use"})}if(aR.responseText.indexOf("150 characters")!==-1){aQ.showErrors({description:"Please enter no more than 149 characters."})}},type:"POST"})};l=h.find(".bd-editGroupFormContainer");h.undelegate(".bd-editDetails","click").delegate(".bd-editDetails","click",function(){var aL=function(){Y.hide();l.show();var aM={rules:{name:{validTitle:true}},messages:{name:{validTitle:"Group name can not contain any special characters"}},submitHandler:function(aN){I(aN)}};z("groupEditForm",aM);jQuery("#div-editGroupTitle").hide();jQuery(".bd-group-det-btn").hide()};v("editGroup",l).done(aL)});ai=function(){jQuery("#div-editGroupTitle").hide();jQuery(".bd-group-det-btn").show();l.hide();Y.show();h.find(".bd-buttons").show()};l.delegate(".bd-cancelButton","click",ai);I=function(aP){var aR=jQuery("select",aP).attr("value"),aO={id:aP.id.value,name:aP.name.value,description:aP.description.value,role:aR},aM=function(aX){var aV=jQuery("#groupEditForm").validate(),aW,aU,aS,aT="";if(aX.responseText.indexOf("150 characters")!==-1){aV.showErrors({description:"Please enter no more than 149 characters."});return false}aW=jQuery(aX.responseXML).find("message");if(aW!=null){aS=aW.length;for(aU=0;aU<aS;aU++){aT+="<p>"+aW[aU].textContent+"</p>"}if(aT.length>0){be.utils.alert({title:"Update Failed",message:aT,closeIcon:false})}}else{aV.showErrors({name:"This group name is already in use"})}},aN=function(){ai();bc.component.notify({uid:"9988",icon:"checkbox",message:"Group details updated successfully."})},aL=function(){bd.Permission.setDefaultGroupPermission(aO);var aS=aP.name.value;if(aS!==W){W=aS;x()}v("groupDetails",Y).done(aN)},aQ=be.utils.processXMLTemplate("groups/updateGroup",aO);be.utils.ajax({url:bd.contextRoot+"/groups/"+W+".xml",data:aQ,success:aL,error:aM,type:"PUT"});return false};ac=jQuery(".bd-column3Container",g);ac.on("click",".bd-columnHeader .bd-tab1",function(){am()}).on("click",".bd-columnHeader .bd-tab2",function(){aH("2",ac)});w=jQuery(".bd-users",g);p=w.find(".bd-viewport");L=jQuery(".bd-userDetails",g);ar=L.find(".bd-viewport");E=function(){var aL=function(aO){var aM,aP,aN,aQ;if(aO.groups){if(aO.groups.group){aM=aO.groups.group;aP="";if(aM.length){aA=aM[0].role;for(aN=0;aN<aM.length;aN++){aP+=aM[aN].name+", "}aP=aP.substring(0,aP.length-2)}else{aA=aM.role;aP=aM.name}aQ="<span>"+aP+"</span>";ar.find(".bd-userDetailsGroupList").html(aQ)}else{aA=""}}};d(ar);aF("/users/"+k+"/groups.xml",aL)};ad=function(){var aL=function(aN){var aM=aN.user,aO={username:aM.username,enabled:aM.enabled==="true"?"Yes":"No"},aP=be.utils.processHTMLTemplate("groups/usersDetails",aO);ar.html(aP);E();if(k===ay||k===Z||bd.loggedInUserId===k){L.find(".bd-deleteButton").hide();L.find(".bd-editGroups").hide()}else{L.find(".bd-deleteButton").show();L.find(".bd-editGroups").show()}};aF("/users/"+k+".xml",aL)};am=function(){if(k){ac.find(".bd-columnHeader .bd-content").show();ad();aH("1",ac);o()}};u=function(){if(k){if(A){aH("2",ac)}else{ax("1",ac);ac.find(".bd-columnHeader .bd-content").hide()}k=null}};H=function(aL){k=jQuery(aL).attr("itemid");jQuery(aL).addClass("bd-selected");jQuery(aL).siblings().removeClass("bd-selected");if(k){am()}else{ac.find(".bd-columnHeader .bd-content").hide()}U()};av=function(aM,aN){var aL,aO=function(aW){var aR,aP,aT,aV,aU,aQ,aS,aX;w.find(".bd-columnEditor").show();w.find(".bd-columnHeader .bd-content").show();aR={obj:aW,rootnode:"users",childnode:"user"};aP=ah.pageSizeControl(aR,w);if(aP.length){for(aT=0,aV=aP.length;aT<aV;aT++){aU="";if(aP[aT].groups.group){if(aP[aT].groups.group.length){aU=aP[aT].groups.group[0].role}else{aU=aP[aT].groups.group.role}}else{aU=null}aP[aT].role=aU}}else{if(aP.totalSize!=="0"){if(aP.groups.group.length){aU=aP.groups.group[0].role}else{aU=aP.groups.group.role}}aP.role=aU}aQ={users:aP.totalSize==="0"?false:aP};aS=be.utils.processHTMLTemplate("groups/users",aQ);if(aN&&aN.loadMore){p.find(".bd-listDataholder").append(aS)}else{p.find(".bd-listDataholder").html(aS);p.find('.bd-listItem[itemid="'+k+'"]').addClass("bd-selected")}aX=aQ.users;if(aQ.users!==false&&!aQ.users.length){aX=[aQ.users]}jQuery("a",p).each(function(aY){if(jQuery('[itemid="'+this.getAttribute("itemid")+'"]',t).length){jQuery(".bd-listCheckbox",this)[0].checked=true}if(aX.length&&aX[aY]){if(!aX[aY].groups){aX[aY].groups=[]}if(!aX[aY].groups.group){aX[aY].groups.group=[]}else{if(!aX[aY].groups.group.length&&aX[aY].groups.group.id){aX[aY].groups.group=[aX[aY].groups.group]}}this.groups=aX[aY].groups.group}}).unbind("click").click(function(){H(this)});U();o();d(p.find(".bd-listDataholder")[0])};if(!aN||!aN.loadMore){ah.setOffSet(0)}aL=aM||"/groups/"+W+"/users.xml?s=username(asc)&of="+ah.getOffSet()+"&ps="+ah.getPageSize();if(W==="AllUsers"){aL="/users.xml?s=username(asc)&of="+ah.getOffSet()+"&ps="+ah.getPageSize()}aF(aL,aO)};P=function(){jQuery(this).parents(".bd-dropdowncheckbox").find(".bd-checkbox").each(function(){this.checked=true});k=null;jQuery(".bd-listCheckbox",p).each(function(){this.checked=true;i.call(this)})};y=function(){jQuery(this).parents(".bd-dropdowncheckbox").find(".bd-checkbox").each(function(){this.checked=false});k=null;jQuery(".bd-listCheckbox",p).each(function(){this.checked=false;i.call(this)})};az=function(){var aL=function(aM){var aN={rules:{username:{validTitle:true},passwordAgain:{equalTo:"#userCreateForm_password"}},messages:{username:{validTitle:"Username can not contain any special characters"},passwordAgain:{equalTo:"Please enter the same password as above"}}};z(aM,aN);aM.attr({action:"users",method:"post",autocomplete:"off"});bd.enableSwitch("activateNewUser");aM.find("input:first").focus()};ao({templateName:"createUser",templateData:{groupname:W,groupdescription:""},prepareForm:aL,form:{width:"650px",height:"300px",ok:"Save",cancel:"Cancel",content:"",title:"NEW USER",uid:"groups",cls:"bd-tCont-presetSelect-form",disableValidation:true,okCallback:aq}})};N=function(){be.closeCurrentDialog()};w.undelegate(".bd-openPaneButton","click").delegate(".bd-openPaneButton","click",az);aq=function(aO){if(!$(aO).valid()){return false}var aN=function(){var aQ=jQuery("#userCreateForm").validate();aQ.showErrors({username:"This username is already in use"})},aL=function(){N();A=0;k=null;av(null);bc.component.notify({uid:"9975",icon:"checkbox",message:"User was created successfully."});ax("2",ac);ac.find(".bd-tabLabel.bd-tab2").hide()},aM={username:aO.username.value,password:aO.password.value,enabled:String(aO.enabled.checked),groupname:aO.groupname.value,groupdescription:""},aP=be.utils.processXMLTemplate("groups/createUser",aM);be.utils.ajax({url:bd.contextRoot+"/users.xml",data:aP,success:aL,error:aN,type:"POST"});ax("1",ac)};L.undelegate(".bd-deleteButton","click").delegate(".bd-deleteButton","click",function(){var aL=function(){be.utils.ajax({url:bd.contextRoot+"/users/"+k+".xml",success:function(){av(null);var aM=k;u();X(aM)},type:"DELETE"})};be.utils.confirm({title:"Remove User",message:"This will remove the user and cannot be undone. Are you sure you want to continue?",yesCallback:aL})});L.undelegate(".bd-editDetails","click").delegate(".bd-editDetails","click",function(){var aM="/users/"+k+".xml",aL=function(){var aO;T=al.find(".bd-userEditForm-passwordNew");f=al.find(".bd-userEditForm-passwordAgain");aB=al.find(".bd-userEditForm-trPassword");m=al.find(".bd-userEditForm-trPasswordNew");B=al.find(".bd-userEditForm-trPasswordAgain");aO={rules:{username:{validTitle:true},passwordAgain:{equalTo:"#userEditForm_passwordNew"}},messages:{username:{validTitle:"Username can not contain any special characters"},passwordAgain:{equalTo:"Please enter the same password as above"}},submitHandler:function(aP){al.find(".bd-userEditForm-password").val(T.val());af(aP)}};z("userEditForm",aO);q();ar.hide();L.find(".bd-buttons").show();bd.enableSwitch("activateExistingUser");al.show();jQuery("#div-editUserTitle").hide();jQuery(".bd-btns-hide").hide()},aN=function(aO){var aS=aO.user.username,aQ=(aO.user.enabled==="true"),aP={action:"users/"+k,id:aO.user.id,username:aS,enabled:(aQ?"checked":""),activeStatus:(aQ?"Yes":"No"),activeRight:(bd.loggedInUserId===ay),editPasswordButton:(bd.loggedInUserId===ay||bd.loggedInUserId===aS)},aR=be.utils.processHTMLTemplate("groups/editUser",aP);al.html(aR);aL()};aF(aM,aN)});o=function(){al.hide();jQuery("#div-editUserTitle").hide();ar.show();L.find(".bd-buttons").show()};al.delegate(".bd-cancelButton","click",o);af=function(aN){var aM={id:aN.id.value,username:aN.username.value,password:aN.password.value,enabled:(aN.enabled.checked===true?"true":"false")},aP=be.utils.processXMLTemplate("groups/updateUser",aM),aL=function(aQ){if(aQ.responseText.indexOf("validation.user.noGroups, parameters:{}")>-1){be.utils.alert({message:"User update failed because this user is not in any groups."})}else{ad();o();bc.component.notify({uid:"1112",icon:"checkbox",message:"User has been updated successfully."})}},aO=function(){var aQ=aN.username.value;if(aQ!==k){k=aQ;av(null)}ad();o();bc.component.notify({uid:"1008",icon:"checkbox",message:"User has been updated successfully."})};be.utils.ajax({url:bd.contextRoot+"/users/"+aN.username.value+".xml",data:aP,success:aO,error:aL,type:"PUT"});return false};aC=jQuery(".bd-groupsSelectorPane",g);aa=new b();s=new b();Q=function(aN){var aO,aM,aL;aa.setURL("groups.xml?s=name(asc)");aa.setPageSize(100);aa.requestPage();aO=jQuery(aN).offset();aM=aO.top+20;aL=aO.left;S={css:{opacity:0.2,top:aM,left:aL},open:{opacity:1,top:"+=10"},openDuration:200,openEasing:"swing",close:{opacity:0.2,top:"+=10"},closeDuration:200,closeEasing:"swing"}};aa.addObserver("change",function(){aJ(aa.getJSON())});at=function(aT,aP,aM){var aO=aT.groups.group,aL="",aN="",aR,aQ,aS;if(aO==null){aO=[]}else{if(aO.constructor!==Array){aO=[aO]}}for(aR=aO.length-1;aR>=0;aR--){aO[aR].name=aO[aR].name["#text"];aO[aR].role=aO[aR].role["#text"];aO[aR].descr=aO[aR].description&&aO[aR].description["#text"]}if(au==="add"){aL="Add selection to the following groups";aN="Save"}else{if(au==="edit"){aL="Group Membership for "+k;aN="Save"}else{if(au==="remove"){aL="Remove selection from the following groups";aN="Remove"}}}if(aO.length&&aM.length){for(aR=0,aS=aO.length;aR<aS;aR++){for(aQ=aM.length-1;aQ>=0;aQ--){if(aO[aR].name===aM[aQ].name){aO[aR].isChecked=true;aM.splice(aQ,1);break}}}}aC=ao({templateName:"groupselector",templateData:{groupSelectorTitle:aL,groupSelectorSaveButton:aN,groups:aO},form:{width:"650px",height:"300px",ok:"Save",cancel:"Cancel",content:"",title:aL,uid:"groups",cls:"bd-tCont-presetSelect-form",okCallback:aK}});if(au==="edit"){aC.find(".bd-listCheckbox").change(function(){r(this)})}};aJ=function(aM){var aL=[];s.userList=[];if(au==="edit"){s.userList.push({userName:k,userRole:aA})}else{if(A>0){t.find("div.bd-listItem").each(function(){if(this.groups){aL=aL.concat(this.groups)}s.userList.push({userName:jQuery(this).attr("itemid"),userRole:jQuery(this).attr("itemrole")})})}}at(aM,au,aL);if(au==="edit"){jQuery.each(s.userList,function(){if(this.userName===ay||this.userName===Z){aC.find('[itemid="'+this.userName+'"] input')[0].disabled=true}s.setURL("users/"+this.userName+"/groups.xml");s.requestPage()})}};s.addObserver("change",function(){var aM,aN,aL=s.getJSON().groups.group;if(aL==null){aL=[]}else{if(aL.constructor!==Array){aL=[aL]}}aa.currentSelectedGroups=[];for(aM=0;aM<aL.length;aM++){aN=aL[aM].name["#text"];if(aN){aC.find('[itemid="'+aN+'"]').each(function(){jQuery(".bd-listCheckbox",this)[0].checked=true})}}aC.find(".bd-listItem .bd-listCheckbox:checked").each(function(){aa.currentSelectedGroups.push(jQuery(this).val())})});j=function(aP,aU){var aM=aU.groups.slice(0),aO=bd.contextRoot+"/users/"+aP.userName+"/groups",aQ={},aS="",aL=0,aR,aT,aN;aR=function(){var aV,aW;aQ.groups=[];aV=function(){if(au==="edit"){E()}aN(aP.userName,aM);bc.component.notify({uid:"9186",icon:"checkbox",message:"Group memberships have been updated."})};aW=be.utils.processXMLTemplate("groups/updateUserGroups",{groups:aM});be.utils.ajax({url:aO+".xml",data:aW,success:aV,type:"POST",dataType:"xml"})};aT=function(a1){var aY=null,aZ=function(a3){aN(aP.userName,a3,true)},aW,aV,a2,aX;if(a1!=null){aY=a1.deleteGroupArray}else{aY=aM}aX={title:"COULD NOT REMOVE USER FROM GROUP",message:' The following users could not be removed from their group:<br/>- user "manager" (from the group "manager")<br/>- user "admin" (from the group "admin")',closeIcon:true,uid:"8172",respondToEscKey:true,buttons:[{title:"OK",type:"white",callback:c}]};function a0(a3){return{url:aO+"/"+a3+".xml",success:function(){aZ(a3)},type:"DELETE"}}for(aW=0,aV=aY.length;aW<aV;aW++){a2=aY[aW];if((a2.groupName===aG&&aP.userName===ay)||(a2.groupName===M&&aP.userName===Z)){bc.component.dialog(aX)}else{be.utils.ajax(a0(a2.groupName))}}};aN=function(aW,aX,aZ){var a1,aY,aV,a0;a1=t.find('.bd-listItem[itemid="'+aW+'"]');aV=aX.length;if(!a1.length){return}if(!aZ){a1[0].groups=[];for(aY=0;aY<aV;aY++){a1[0].groups.push({description:aX[aY].groupDescription,name:aX[aY].groupName,role:aX[aY].groupRole})}}else{for(aY=a1[0].groups.length-1;aY>=0;aY--){a0=a1[0].groups[aY];if(a0.name===aX){a1[0].groups.splice(aY,1);break}}}};if(au==="add"||au==="edit"){aR()}else{if(au==="remove"){aT()}}return aS};L.undelegate(".bd-editGroups","click").delegate(".bd-editGroups","click",function(){au="edit";Q(this)});aK=function(aP){var aL=jQuery(aP),aN={},aO="",aM={};aN.groups=[];aN.allGroups=[];aL.find(".bd-listItem .bd-listCheckbox").each(function(){var aQ=jQuery(this);if(this.checked){aN.groups.push({groupName:aQ.val(),groupRole:aQ.attr("itemrole"),groupDescription:aQ.siblings('[name="description"]').val()})}aN.allGroups.push({groupName:aQ.val(),groupRole:aQ.attr("itemrole"),groupDescription:aQ.siblings('[name="description"]').val()})});if(!aN.groups||aN.groups.length<=0){be.utils.alert({message:"User must belong to at least one group."});return}be.closeCurrentDialog();jQuery.each(s.userList,function(){aO+=j(this,aN)+"<br/>"});av(null);if(aO.replace(/<br\/>/gi,"")!==""){be.utils.alert({message:aO})}};r=function(aL){if(aA!==jQuery(aL).attr("itemrole")){aC.find(".bd-listCheckbox").attr("checked",false);jQuery(aL).attr("checked",true);aA=jQuery(aL).attr("itemrole")}};aD=jQuery(".bd-bucket",g);t=aD.find(".bd-viewport");aD.undelegate(".bd-addToGroups","click").delegate(".bd-addToGroups","click",function(){au="add";Q(this)});aD.undelegate(".bd-removeFromGroups","click").delegate(".bd-removeFromGroups","click",function(){au="remove";Q(this)});aD.delegate(".bd-clearBucket","click",function(){A=0;t.html("");jQuery(".bd-listCheckbox",p).each(function(){this.checked=false});ap()});t.delegate(".bd-listItem .bd-icon","click",function(){var aL=this.parentNode;X(aL.getAttribute("itemid"))});ap=function(){A=A<0?0:A;if(A>0){aD.find(".bd-columnEditor").show()}else{aD.find(".bd-columnEditor").hide();am()}ac.find(".bd-columnHeader .bd-content").show();ac.find(".bd-usersSelected").html(A);U()};aE=function(aN,aM,aL){var aO=jQuery('<div class="bd-listItem" itemid="'+aN+'" itemrole="'+aM+'"><div class="bd-text-overFlow">'+aN+"</div></div>");aO[0].groups=aL;t.append(aO);A++;ap()};X=function(aL){jQuery('[itemId="'+aL+'"]',t).remove();jQuery('[itemid="'+aL+'"] input',p).each(function(){this.checked=false;w.find(".bc-selectbox input")[0].checked=false});A--;ap()};i=function(aM){var aN=this.parentNode.getAttribute("itemid"),aL=jQuery('[itemid="'+aN+'"]',t);if(this.checked){if(aL.length===0){aE(this.parentNode.getAttribute("username"),this.parentNode.getAttribute("itemrole"),this.parentNode.groups)}}else{X(aN)}if(aM){aM.stopPropagation()}p.find(".bd-selected").removeClass("bd-selected");if(k){k=aN;jQuery(this.parentNode).addClass("bd-selected")}if(A>0){aH("2",ac);ac.find(".bd-tabLabel.bd-tab2").show()}else{ax("2",ac)}};p.delegate(".bd-listCheckbox","change",i);aH=function(aM,aL){jQuery(".bd-tabLabel, .bd-tab",aL).removeClass("bd-activeTab");jQuery(".bd-tab"+aM,aL).addClass("bd-activeTab")};ax=function(aM,aL){jQuery(".bd-tab"+aM,aL).removeClass("bd-activeTab")};aI=function(aL){var aN=ac.find(".bd-columnHeader"),aM=ac.find(".bd-groupMgmt-column3Body");if(aL==="show"){aN.find(".bd-tab1").removeClass("bd-hideTab");aN.find(".bd-tab2").removeClass("bd-hideTab");aM.find(".bd-details").removeClass("bd-hideTab");aM.find(".bd-bucket").removeClass("bd-hideTab")}else{aN.find(".bd-tab1").addClass("bd-hideTab");aN.find(".bd-tab2").addClass("bd-hideTab");aM.find(".bd-details").addClass("bd-hideTab");aM.find(".bd-bucket").addClass("bd-hideTab")}};U=function(){if(A<=0){ax("2",ac);ac.find(".bd-tabLabel.bd-tab2").hide()}else{aH("2",ac);ac.find(".bd-tabLabel.bd-tab2").show()}if(k){ac.find(".bd-tabLabel.bd-tab1").show()}else{ac.find(".bd-tabLabel.bd-tab1").hide()}};G=function(){if(!T||!f){T=al.find(".bd-userEditForm-passwordNew");f=al.find(".bd-userEditForm-passwordAgain");aB=al.find(".bd-userEditForm-trPassword");m=al.find(".bd-userEditForm-trPasswordNew");B=al.find(".bd-userEditForm-trPasswordAgain")}T.addClass("required");f.addClass("required");D();aB.hide();m.show();B.show()};al.delegate(".bd-userEditForm-editPasswordButton","click",function(aL){aL.preventDefault();G()});al.delegate(".bd-userEditForm-passwordCancelButton","click",function(aL){aL.preventDefault();q()});q=function(){T.removeClass("required valid error");f.removeClass("required valid error");al.find('label[for="userEditForm_passwordAgain"],label[for="userEditForm_passwordNew"] ').remove();D();aB.show();m.hide();B.hide()};D=function(){T.val("");f.val("")};z=function(aN,aM){var aL;if(typeof aN==="string"){aN=jQuery("#"+aN)}be.utils.addCustomMethodToValidator(["validTitle"]);aL=window.validator=aN.validate(aM);aL.resetForm();aN.find(".valid").removeClass("valid")};ao=function(aM){var aN,aL;aM.form.content=be.utils.processHTMLTemplate("groups/"+aM.templateName,aM.templateData);aL=aM.form.okCallback;aM.form.okCallback=function(aP){var aO=aL(aP[0]);if(aO!==false){aN.hide()}else{return false}};aN=bc.component.modalform(aM.form);if(aM.prepareForm){aM.prepareForm(aN.find("form"))}if(aM.templateName==="createGroup"){bc.component.dropdown({target:".bd-groupForm-dropdownbox",label:"None",forlabel:"bd-groupForm-role-dropdownbox",uid:"5436",options:[{name:"None",value:"USER"},{name:"Can manage portals",value:"MANAGER"}]})}return aN};an=function(aL){return bd.xmlToJson({xml:aL})};function R(){var aO=50,aN=0,aL=null,aM=function(aP){return aP.slice(0,aO)};this.getPageSize=function(){return aO};this.getOffSet=function(){return aN};this.setPageSize=function(aP){aO=aP};this.setOffSet=function(aP){aN=aP};this.pageSizeControl=function(aR,aS){var aT=null,aP,aQ;if(aR.obj[aR.rootnode]){aL=Number(aR.obj[aR.rootnode].totalSize);aP=aR.obj[aR.rootnode];aQ=aP[aR.childnode];if(aQ){if(aQ.length>aO||(aO+aN)<aL){aT=aM(aQ);aS.find(".bd-listLoadMoreButton").removeClass("bd-disabled")}else{aT=aQ;aS.find(".bd-listLoadMoreButton").addClass("bd-disabled")}}else{aT=aP;aS.find(".bd-listLoadMoreButton").addClass("bd-disabled")}}if(aT.id&&aT.name){aT=[aT]}return aT};this.loadMore=function(aP){aN+=aO;if(aP){aP()}}}aF=function(aL,aM){return be.utils.ajax({url:bd.contextRoot+aL,dataType:"xml",success:function(aO){var aN=an(aO);if(aM){aM(aN)}},cache:false,type:"GET"})};x();ab.delegate(".bd-listLoadMoreButton","click",function(){V.loadMore(function(){x({loadMore:true})})});w.delegate(".bd-listLoadMoreButton","click",function(){ah.loadMore(function(){av(null,{loadMore:true})})})};this.Dashboard=function(h){var g,f;jQuery(".bd-widgetContent",h).html('<div class="bd-groups"></div><div class="bd-users"></div>');g=new b({restURL:"groups.xml"});g.addObserver("pagechange",function(){jQuery(".bd-groups",h).html('Groups <span class="bd-outcome-right">'+g.getTotalRecordCount()+"</span>")});f=new b({restURL:"users.xml"});f.addObserver("pagechange",function(){jQuery(".bd-users",h).html('Users <span class="bd-outcome-right">'+f.getTotalRecordCount()+"</span>")})};this.startWidget=function(f){this.Maximized(f.body.firstChild)}});
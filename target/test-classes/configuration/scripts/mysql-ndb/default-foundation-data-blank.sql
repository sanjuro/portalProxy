-- Do not add a user before admin user as some unit tests rely on the id of admin user to be equal to 1 (one)
insert into users (username, password, enabled) values ('admin', '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', true);
SET @admin_user_id = LAST_INSERT_ID();
insert into groups (name, role, description) values ('admin', 'ADMIN', 'Admin Group');
set @admin_group_id = LAST_INSERT_ID();
insert into users_groups (users_id, groups_id) values (@admin_user_id, @admin_group_id);

insert into acl_sid (id, principal, sid) values (1, true, 'admin');
SET @admin_sid = 1;
insert into acl_sid (id, principal, sid) values (3, false, 'group_admin');
SET @group_admin_sid = 3;

-- Add the system to system role and user for orchestrator - portal server communications
insert into users (username, password, enabled) values ('sys2sys', 'ac2e9f96dc73314df3e7c554751ed8e4d0b962428fcdbf1252cdaa452a8cc9a9', true);
SET @sys2sys_user_id = LAST_INSERT_ID();
insert into groups (name, role, description) values ('sys2sys', 'SYS2SYS', 'Sys2Sys');
set @sys2sys_group_id = LAST_INSERT_ID();
insert into users_groups (users_id, groups_id) values (@sys2sys_user_id, @sys2sys_group_id);

insert into acl_sid (principal, sid) values (true, 'sys2sys');
insert into acl_sid (principal, sid) values (false, 'group_sys2sys');
SET @group_sys2sys_sid = LAST_INSERT_ID();



INSERT INTO items (discriminator,state,name,parentitemname,template_id,contextItemName,subtype,type,userid,extendeditem_id,createdtimestamp,lastmodifiedtimestamp, uuid, publicationStatus)
VALUES ('PortalFoundation','INSTANTIATED','[BBHOST]',null,null,'[BBHOST]',null,'PORTALFOUNDATION',null,null,now(), now(), '413c44e2-59b8-47b3-997a-427f224b14a7', 'NOT_PUBLISHED');
SET @item_id = LAST_INSERT_ID();


insert into acl_class (id, class) values (1, 'com.backbase.portal.foundation.domain.model.Portal');
insert into acl_class (id, class) values (2, 'com.backbase.portal.foundation.domain.model.Page');
insert into acl_class (id, class) values (3, 'com.backbase.portal.foundation.domain.model.Container');
insert into acl_class (id, class) values (4, 'com.backbase.portal.foundation.domain.model.Widget');
insert into acl_class (id, class) values (5, 'com.backbase.portal.foundation.domain.conceptual.PropertyDefinition');
insert into acl_class (id, class) values (6, 'com.backbase.portal.foundation.domain.model.Template');
insert into acl_class (id, class) values (7, 'com.backbase.portal.foundation.domain.model.PortalFoundation');
insert into acl_class (id, class) values (8, 'com.backbase.portal.commons.api.publishing.ContentItemRef');
insert into acl_class (id, class) values (9, 'com.backbase.portal.foundation.domain.model.Link');
insert into acl_class (id, class) values (10, 'com.backbase.portal.foundation.domain.model.ContentType');
insert into acl_class (id, class) values (11, 'com.backbase.portal.foundation.domain.model.ContentRepository');
insert into acl_class (id, class) values (12, 'com.backbase.portal.foundation.domain.model.Feature');

INSERT INTO acl_object_identity (object_id_class, object_id_identity, owner_sid, entries_inheriting) VALUES (7, @item_id, @group_admin_sid, false);
SET @oid = LAST_INSERT_ID();
INSERT INTO acl_entry (acl_object_identity, ace_order, sid, mask, granting, audit_success, audit_failure) VALUES (@oid, 1, @group_admin_sid, 1, true, false, false);
INSERT INTO acl_entry (acl_object_identity, ace_order, sid, mask, granting, audit_success, audit_failure) VALUES (@oid, 2, @group_admin_sid, 2, true, false, false);
INSERT INTO acl_entry (acl_object_identity, ace_order, sid, mask, granting, audit_success, audit_failure) VALUES (@oid, 3, @group_admin_sid, 4, true, false, false);
INSERT INTO acl_entry (acl_object_identity, ace_order, sid, mask, granting, audit_success, audit_failure) VALUES (@oid, 4, @group_admin_sid, 8, true, false, false);
INSERT INTO acl_entry (acl_object_identity, ace_order, sid, mask, granting, audit_success, audit_failure) VALUES (@oid, 5, @group_admin_sid, 16, true, false, false);

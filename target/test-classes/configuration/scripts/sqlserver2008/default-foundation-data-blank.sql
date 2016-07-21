declare @admin_user_id int  = 1
declare @admin_group_id int = 3
declare @sys2sys_user_id int
declare @sys2sys_group_id int

insert into users (username, password, enabled) values ('admin', '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', 1)
select @admin_user_id = @@IDENTITY
insert into groups (name, role, description) values ('admin', 'ADMIN', 'Admin Group')
set @admin_group_id = @@IDENTITY

insert into users_groups (users_id, groups_id) values (@admin_user_id, @admin_group_id)

insert into acl_sid (principal, sid) values (1, 'admin')
insert into acl_sid (principal, sid) values (0, 'group_admin')

-- add system to system group and user
insert into users (username, password, enabled) values ('sys2sys', 'ac2e9f96dc73314df3e7c554751ed8e4d0b962428fcdbf1252cdaa452a8cc9a9', 1)
select @sys2sys_user_id = @@IDENTITY
insert into groups (name, role, description) values ('sys2sys', 'SYS2SYS', 'System to System Group')
set @sys2sys_group_id = @@IDENTITY

insert into users_groups (users_id, groups_id) values (@sys2sys_user_id, @sys2sys_group_id)

insert into acl_sid (principal, sid) values (1, 'sys2sys')
insert into acl_sid (principal, sid) values (0, 'group_sys2sys')

insert into acl_class (class) values ('com.backbase.portal.foundation.domain.model.Portal')
insert into acl_class (class) values ('com.backbase.portal.foundation.domain.model.Page')
insert into acl_class (class) values ('com.backbase.portal.foundation.domain.model.Container')
insert into acl_class (class) values ('com.backbase.portal.foundation.domain.model.Widget')
insert into acl_class (class) values ('com.backbase.portal.foundation.domain.conceptual.PropertyDefinition')
insert into acl_class (class) values ('com.backbase.portal.foundation.domain.model.Template')
insert into acl_class (class) values ('com.backbase.portal.foundation.domain.model.PortalFoundation')
insert into acl_class (class) values ('com.backbase.portal.commons.api.publishing.ContentItemRef');
insert into acl_class (class) values ('com.backbase.portal.foundation.domain.model.Link')
insert into acl_class (class) values ('com.backbase.portal.foundation.domain.model.ContentType')
insert into acl_class (class) values ('com.backbase.portal.foundation.domain.model.ContentRepository')
insert into acl_class (class) values ('com.backbase.portal.foundation.domain.model.Feature')

insert into items (discriminator,state,name,parentitemname,template_id,contextItemName,subtype,type,userid,extendeditem_id,createdtimestamp,lastmodifiedtimestamp, uuid, publicationStatus)
values ('PortalFoundation','INSTANTIATED','[BBHOST]',null,null,'[BBHOST]',null,'PORTALFOUNDATION',null,null,null,null, '413c44e2-59b8-47b3-997a-427f224b14a7', 'NOT_PUBLISHED')
GO

insert into acl_object_identity (object_id_class, object_id_identity, owner_sid, entries_inheriting) values ((select id from acl_class where class='com.backbase.portal.foundation.domain.model.PortalFoundation'), (select id from items where discriminator='PortalFoundation'), (select id from acl_sid where sid='group_admin'), 0)
GO

declare @oid int = 2
set @oid = (select id from acl_object_identity where object_id_identity = (select id from items where discriminator='PortalFoundation'))

declare @sys2sys_group_sid int = 1
set @sys2sys_group_sid = (select id from acl_sid where sid = 'group_sys2sys')

insert into acl_entry (acl_object_identity, ace_order, sid, mask, granting, audit_success, audit_failure) values (@oid, 1, (select id  from acl_sid where sid='group_admin'), 1, 1, 0, 0);
insert into acl_entry (acl_object_identity, ace_order, sid, mask, granting, audit_success, audit_failure) values (@oid, 2, (select id  from acl_sid where sid='group_admin'), 2, 1, 0, 0);
insert into acl_entry (acl_object_identity, ace_order, sid, mask, granting, audit_success, audit_failure) values (@oid, 3, (select id  from acl_sid where sid='group_admin'), 4, 1, 0, 0);
insert into acl_entry (acl_object_identity, ace_order, sid, mask, granting, audit_success, audit_failure) values (@oid, 4, (select id  from acl_sid where sid='group_admin'), 8, 1, 0, 0);
insert into acl_entry (acl_object_identity, ace_order, sid, mask, granting, audit_success, audit_failure) values (@oid, 5, (select id  from acl_sid where sid='group_admin'), 16, 1, 0, 0);
GO


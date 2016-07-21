REM Script to populate Oracle database with foundation blank dataset.

delete from users_groups;
delete from users;
delete from groups;
delete from acl_entry;
delete from acl_object_identity;
delete from acl_class;
delete from acl_sid;
delete from property_definition;
delete from items;

declare
admin_user_id NUMBER;
admin_group_id NUMBER;
sys2sys_user_id NUMBER;
sys2sys_group_id NUMBER;
item_id NUMBER;
oid NUMBER;

group_admin_sid NUMBER;
group_sys2sys_sid NUMBER;
pf_acl_id NUMBER;

begin

select hibernate_sequence.nextVal into admin_user_id from dual;
select hibernate_sequence.nextVal into admin_group_id from dual;
insert into users (username, password, enabled,id) values ('admin', '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', 1,admin_user_id);
insert into groups (name, role, description,id) values ('admin', 'ADMIN', 'Admin Group',admin_group_id);
insert into users_groups (users_id, groups_id) values (admin_user_id, admin_group_id);

insert into acl_sid (principal, sid) values (1, 'admin');
insert into acl_sid (principal, sid) values (0, 'group_admin');

select hibernate_sequence.nextVal into sys2sys_user_id from dual;
select hibernate_sequence.nextVal into sys2sys_group_id from dual;
insert into users (username, password, enabled,id) values ('sys2sys', 'ac2e9f96dc73314df3e7c554751ed8e4d0b962428fcdbf1252cdaa452a8cc9a9', 1, sys2sys_user_id);
insert into groups (name, role, description,id) values ('sys2sys', 'SYS2SYS', 'System to System Group', sys2sys_group_id);
insert into users_groups (users_id, groups_id) values (sys2sys_user_id, sys2sys_group_id);

insert into acl_sid (principal, sid) values (1, 'sys2sys');
insert into acl_sid (principal, sid) values (0, 'group_sys2sys');
select id  into group_sys2sys_sid from acl_sid where sid='group_sys2sys';

insert into acl_class (class) values ('com.backbase.portal.foundation.domain.model.Portal');
insert into acl_class (class) values ('com.backbase.portal.foundation.domain.model.Page');
insert into acl_class (class) values ('com.backbase.portal.foundation.domain.model.Container');
insert into acl_class (class) values ('com.backbase.portal.foundation.domain.model.Widget');
insert into acl_class (class) values ('com.backbase.portal.foundation.domain.conceptual.PropertyDefinition');
insert into acl_class (class) values ('com.backbase.portal.foundation.domain.model.Template');
insert into acl_class (class) values ('com.backbase.portal.foundation.domain.model.PortalFoundation');
insert into acl_class (class) values ('com.backbase.portal.commons.api.publishing.ContentItemRef');
insert into acl_class (class) values ('com.backbase.portal.foundation.domain.model.Link');
insert into acl_class (class) values ('com.backbase.portal.foundation.domain.model.ContentType');
insert into acl_class (class) values ('com.backbase.portal.foundation.domain.model.ContentRepository');
insert into acl_class (class) values ('com.backbase.portal.foundation.domain.model.Feature');

select hibernate_sequence.nextVal into item_id from dual;
insert into items (id,discriminator,state,name,parentitemname,template_id,contextItemName,subtype,type,userid,extendeditem_id,createdtimestamp,lastmodifiedtimestamp, uuid, publicationStatus)
values (item_id,'PortalFoundation','INSTANTIATED','[BBHOST]',null,null,'[BBHOST]',null,'PORTALFOUNDATION',null,null,null,null, '413c44e2-59b8-47b3-997a-427f224b14a7', 'NOT_PUBLISHED');

select id into item_id from items where discriminator='PortalFoundation';
select id  into pf_acl_id from acl_class where class='com.backbase.portal.foundation.domain.model.PortalFoundation';
select id  into group_admin_sid from acl_sid where sid='group_admin';
insert into acl_object_identity (object_id_class, object_id_identity, owner_sid, entries_inheriting) values (pf_acl_id, item_id, group_admin_sid, 0);

select id into item_id from items where discriminator='PortalFoundation';
select id  into group_admin_sid from acl_sid where sid='group_admin';
select id into oid from acl_object_identity where object_id_identity=item_id;
insert into acl_entry (acl_object_identity, ace_order, sid, mask, granting, audit_success, audit_failure) values (oid, 1, group_admin_sid, 1, 1, 0, 0);
insert into acl_entry (acl_object_identity, ace_order, sid, mask, granting, audit_success, audit_failure) values (oid, 2, group_admin_sid, 2, 1, 0, 0);
insert into acl_entry (acl_object_identity, ace_order, sid, mask, granting, audit_success, audit_failure) values (oid, 3, group_admin_sid, 4, 1, 0, 0);
insert into acl_entry (acl_object_identity, ace_order, sid, mask, granting, audit_success, audit_failure) values (oid, 4, group_admin_sid, 8, 1, 0, 0);
insert into acl_entry (acl_object_identity, ace_order, sid, mask, granting, audit_success, audit_failure) values (oid, 5, group_admin_sid, 16, 1, 0, 0);

commit;

end;
/
exit;

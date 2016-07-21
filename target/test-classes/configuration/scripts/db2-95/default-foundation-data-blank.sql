-- Switch delimiter to create stored procedures
--#SET TERMINATOR @

delete from users_groups@
delete from users@
delete from groups@
delete from property_definition@
delete from items@
delete from acl_entry@
delete from acl_object_identity@
delete from acl_class@
delete from acl_sid@

BEGIN ATOMIC
DECLARE admin_user_id INTEGER;
DECLARE admin_group_id INTEGER;
DECLARE admin_sid INTEGER;
DECLARE group_admin_sid INTEGER;
DECLARE sys2sys_user_id INTEGER;
DECLARE sys2sys_group_id INTEGER;
DECLARE sid_sys2sys_group INTEGER;
DECLARE item_id INTEGER;
DECLARE oid INTEGER;
DECLARE pf_acl_id INTEGER;

    SET (admin_user_id) = (hibernate_sequence.nextVal);
    SET (admin_group_id) = (hibernate_sequence.nextVal);
    INSERT INTO users (username,password,enabled,id) VALUES ('admin','8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',1,admin_user_id);
    INSERT INTO groups (name, role, description,id) VALUES ('admin','ADMIN','Admin Group',admin_group_id);
    INSERT INTO users_groups (users_id, groups_id) VALUES (admin_user_id,admin_group_id);

    INSERT INTO acl_sid (principal, sid) VALUES (1,'admin');
    SET (admin_sid) = (select id from acl_sid where sid = 'admin');
    INSERT INTO acl_sid (principal, sid) VALUES (0,'group_admin');
    SET (group_admin_sid) = (select id from acl_sid where sid = 'group_admin');

    SET (sys2sys_user_id) = (hibernate_sequence.nextVal);
    SET (sys2sys_group_id) = (hibernate_sequence.nextVal);
    INSERT INTO users (username,password,enabled,id) VALUES ('sys2sys','ac2e9f96dc73314df3e7c554751ed8e4d0b962428fcdbf1252cdaa452a8cc9a9',1,sys2sys_user_id);
    INSERT INTO groups (name, role, description,id) VALUES ('sys2sys','SYS2SYS','System to System Group',sys2sys_group_id);
    INSERT INTO users_groups (users_id, groups_id) VALUES (sys2sys_user_id,sys2sys_group_id);

    INSERT INTO acl_sid (principal, sid) VALUES (1,'sys2sys');
    INSERT INTO acl_sid (principal, sid) VALUES (0,'group_sys2sys');
    SET (sid_sys2sys_group) = (select id from acl_sid where sid = 'group_sys2sys');

    INSERT INTO acl_class (class) VALUES ('com.backbase.portal.foundation.domain.model.Portal');
    INSERT INTO acl_class (class) VALUES ('com.backbase.portal.foundation.domain.model.Page');
    INSERT INTO acl_class (class) VALUES ('com.backbase.portal.foundation.domain.model.Container');
    INSERT INTO acl_class (class) VALUES ('com.backbase.portal.foundation.domain.model.Widget');
    INSERT INTO acl_class (class) VALUES ('com.backbase.portal.foundation.domain.conceptual.PropertyDefinition');
    INSERT INTO acl_class (class) VALUES ('com.backbase.portal.foundation.domain.model.Template');
    INSERT INTO acl_class (class) VALUES ('com.backbase.portal.foundation.domain.model.PortalFoundation');
    INSERT INTO acl_class (class) values ('com.backbase.portal.commons.api.publishing.ContentItemRef');
    INSERT INTO acl_class (class) VALUES ('com.backbase.portal.foundation.domain.model.Link');
	  INSERT INTO acl_class (class) VALUES ('com.backbase.portal.foundation.domain.model.ContentType');
	  INSERT INTO acl_class (class) VALUES ('com.backbase.portal.foundation.domain.model.ContentRepository');
	  INSERT INTO acl_class (class) VALUES ('com.backbase.portal.foundation.domain.model.Feature');

    SET (item_id) = (hibernate_sequence.nextVal);
    INSERT INTO items (id,discriminator,state,name,parentitemname,template_id,contextItemName,subtype,type,userid,extendeditem_id,createdtimestamp,lastmodifiedtimestamp, uuid, publicationStatus) VALUES (item_id,'PortalFoundation','INSTANTIATED','[BBHOST]',NULL,NULL,'[BBHOST]',NULL,'PORTALFOUNDATION',NULL,NULL,NULL,NULL, '413c44e2-59b8-47b3-997a-427f224b14a7', 'NOT_PUBLISHED');

    SET (item_id) = (SELECT id FROM items WHERE discriminator = 'PortalFoundation');

    SET (pf_acl_id) = (SELECT id FROM acl_class WHERE class = 'com.backbase.portal.foundation.domain.model.PortalFoundation');

    SET (group_admin_sid) = (SELECT id FROM acl_sid WHERE sid = 'group_admin');

    INSERT INTO acl_object_identity (object_id_class, object_id_identity, owner_sid, entries_inheriting) VALUES (pf_acl_id,item_id,group_admin_sid,0);

    SET (item_id)
       = (SELECT id
          FROM items
          WHERE discriminator = 'PortalFoundation');

    SET (group_admin_sid) = (SELECT id FROM acl_sid WHERE sid = 'group_admin');

    SET (oid)  = (SELECT id FROM acl_object_identity WHERE object_id_identity = item_id);

    INSERT INTO acl_entry (acl_object_identity, ace_order, sid, mask, granting, audit_success, audit_failure) VALUES (oid,1,group_admin_sid,1,1,0,0);

    INSERT INTO acl_entry (acl_object_identity, ace_order, sid, mask, granting, audit_success, audit_failure) VALUES (oid,2,group_admin_sid,2,1,0,0);

    INSERT INTO acl_entry (acl_object_identity, ace_order, sid, mask, granting, audit_success, audit_failure) VALUES (oid,3,group_admin_sid,4,1,0,0);

    INSERT INTO acl_entry (acl_object_identity, ace_order, sid, mask, granting, audit_success, audit_failure) VALUES (oid,4,group_admin_sid,8,1,0,0);

    INSERT INTO acl_entry (acl_object_identity, ace_order, sid, mask, granting, audit_success, audit_failure) VALUES (oid,5,group_admin_sid,16,1,0,0);

END@

--#SET TERMINATOR ;

-- DO NOT RUN THIS SCRIPTS AS PART OF THE MIGRATION !!!
-- THE CONTENT OF THIS SCRIPT IS ALREADY INCLUDED IN upgrade-5.1.2-to-5.2.0.dml !!!

-- Script to add a default Link tree for existing Portals

-- Steps
-- Create root link for main navigation menu
-- Add properties on root link for main navigation menu
-- - TemplateName	link-default
-- - Description	empty
-- - title			Main Navigation
-- - itemType		menuHeader
-- - Order			10
-- Create root link for not in menu
-- Add properties on root link for not in navigation menu
-- - TemplateName	link-default
-- - Description	empty
-- - title			Not in Navigation
-- - itemType		menuHeader
-- - Order			20
-- Create a Link item for every page. (use the page name in the link name for easy reference)
-- Add properties on each page Link
-- - TemplateName	link-default
-- - Description	emmpty
-- - title			the page title
-- - itemType		page
-- - Order			increment (or use e.g. item id of the page)
-- - ItemRef		the page name
-- Secure new Links and new Properties.
--  The security of the referencing item will be copied.


-- Create root link for main navigation menu
INSERT INTO ITEMS
(
  ID
, DISCRIMINATOR
, CONTEXTITEMNAME
, CREATEDBY
, CREATEDTIMESTAMP
, ITEMHANDLERBEANNAME
, LASTMODIFIEDBY
, LASTMODIFIEDTIMESTAMP
, LASTPUBLICATIONTIMESTAMP
, NAME
, PARENTITEMNAME
, STATE
, SUBTYPE
, TRANSFORMERBEANNAME
, TYPE
, USERID
, EXTENDEDITEM_ID
, TEMPLATE_ID
, LOCKED
, HIDDEN
, PUBLICATIONSTATUS
, NEXTPUBLISHACTION
, UUID
)
SELECT
  hibernate_sequence.nextVal
, 'Link'
, NAME
, 1
, sysdate
, 'linkInstanceHandler'
, 1
, sysdate
, null
, 'navroot_mainmenu'
, NAME
, 'INSTANTIATED'
, null
, null
, 'LINK'
, null
, null
, (select id from items where CONTEXTITEMNAME = '[BBHOST]' and name = 'link-default')
, 0
, 0
, 'NOT_PUBLISHED'
, null
, hibernate_sequence.currVal
FROM ITEMS
WHERE TYPE = 'PORTAL'
;

-- Add properties on root link for main navigation menu
INSERT INTO PROPERTY_DEFINITION
(
  ID
, NAME
, INTERNALVALUE
, TYPE
, ITEM_ID
)
SELECT 
  hibernate_sequence.nextVal
, 'title'
, 'Main Navigation'
, 'string'
, ID
FROM   ITEMS
WHERE  NAME = 'navroot_mainmenu'
;

INSERT INTO PROPERTY_DEFINITION
(
  ID
, NAME
, INTERNALVALUE
, TYPE
, ITEM_ID
)
SELECT 
  hibernate_sequence.nextVal
, 'TemplateName'
, 'link-default'
, 'string'
, ID
FROM   ITEMS
WHERE  NAME = 'navroot_mainmenu'
;

INSERT INTO PROPERTY_DEFINITION
(
  ID
, NAME
, INTERNALVALUE
, TYPE
, ITEM_ID
)
SELECT 
  hibernate_sequence.nextVal
, 'Order'
, '10'
, 'string'
, ID
FROM   ITEMS
WHERE  NAME = 'navroot_mainmenu'
;

INSERT INTO PROPERTY_DEFINITION
(
  ID
, NAME
, INTERNALVALUE
, TYPE
, ITEM_ID
)
SELECT 
  hibernate_sequence.nextVal
, 'Description'
, null
, 'string'
, ID
FROM   ITEMS
WHERE  NAME = 'navroot_mainmenu'
;

INSERT INTO PROPERTY_DEFINITION
(
  ID
, NAME
, INTERNALVALUE
, TYPE
, ITEM_ID
)
SELECT 
  hibernate_sequence.nextVal
, 'itemType'
, 'menuHeader'
, 'string'
, ID
FROM   ITEMS
WHERE  NAME = 'navroot_mainmenu'
;



-- Create root link for not in menu
INSERT INTO ITEMS
(
  ID
, DISCRIMINATOR
, CONTEXTITEMNAME
, CREATEDBY
, CREATEDTIMESTAMP
, ITEMHANDLERBEANNAME
, LASTMODIFIEDBY
, LASTMODIFIEDTIMESTAMP
, LASTPUBLICATIONTIMESTAMP
, NAME
, PARENTITEMNAME
, STATE
, SUBTYPE
, TRANSFORMERBEANNAME
, TYPE
, USERID
, EXTENDEDITEM_ID
, TEMPLATE_ID
, LOCKED
, HIDDEN
, PUBLICATIONSTATUS
, NEXTPUBLISHACTION
, UUID
)
SELECT
  hibernate_sequence.nextVal
, 'Link'
, NAME
, 1
, sysdate
, 'linkInstanceHandler'
, 1
, sysdate
, null
, 'navroot_notinmenu'
, NAME
, 'INSTANTIATED'
, null
, null
, 'LINK'
, null
, null
, (select id from items where CONTEXTITEMNAME = '[BBHOST]' and name = 'link-default')
, 0
, 0
, 'NOT_PUBLISHED'
, null
, hibernate_sequence.currVal
FROM ITEMS
WHERE TYPE = 'PORTAL'
;

-- Add properties on root link for not in navigation menu
INSERT INTO PROPERTY_DEFINITION
(
  ID
, NAME
, INTERNALVALUE
, TYPE
, ITEM_ID
)
SELECT 
  hibernate_sequence.nextVal
, 'title'
, 'Not in Navigation'
, 'string'
, ID
FROM   ITEMS
WHERE  NAME = 'navroot_notinmenu'
;

INSERT INTO PROPERTY_DEFINITION
(
  ID
, NAME
, INTERNALVALUE
, TYPE
, ITEM_ID
)
SELECT 
  hibernate_sequence.nextVal
, 'TemplateName'
, 'link-default'
, 'string'
, ID
FROM   ITEMS
WHERE  NAME = 'navroot_notinmenu'
;

INSERT INTO PROPERTY_DEFINITION
(
  ID
, NAME
, INTERNALVALUE
, TYPE
, ITEM_ID
)
SELECT 
  hibernate_sequence.nextVal
, 'Order'
, '20'
, 'string'
, ID
FROM   ITEMS
WHERE  NAME = 'navroot_notinmenu'
;

INSERT INTO PROPERTY_DEFINITION
(
  ID
, NAME
, INTERNALVALUE
, TYPE
, ITEM_ID
)
SELECT 
  hibernate_sequence.nextVal
, 'Description'
, null
, 'string'
, ID
FROM   ITEMS
WHERE  NAME = 'navroot_notinmenu'
;

INSERT INTO PROPERTY_DEFINITION
(
  ID
, NAME
, INTERNALVALUE
, TYPE
, ITEM_ID
)
SELECT 
  hibernate_sequence.nextVal
, 'itemType'
, 'menuHeader'
, 'string'
, ID
FROM   ITEMS
WHERE  NAME = 'navroot_notinmenu'
;




-- Create a Link item for every page.
INSERT INTO ITEMS
(
  ID
, DISCRIMINATOR
, CONTEXTITEMNAME
, CREATEDBY
, CREATEDTIMESTAMP
, ITEMHANDLERBEANNAME
, LASTMODIFIEDBY
, LASTMODIFIEDTIMESTAMP
, LASTPUBLICATIONTIMESTAMP
, NAME
, PARENTITEMNAME
, STATE
, SUBTYPE
, TRANSFORMERBEANNAME
, TYPE
, USERID
, EXTENDEDITEM_ID
, TEMPLATE_ID
, LOCKED
, HIDDEN
, PUBLICATIONSTATUS
, NEXTPUBLISHACTION
, UUID
)
select
  hibernate_sequence.nextVal
, 'Link'
, CONTEXTITEMNAME
, 1
, sysdate
, 'linkInstanceHandler'
, 1
, sysdate
, null
, 'link_' || name
, 'navroot_mainmenu'
, 'INSTANTIATED'
, null
, null
, 'LINK'
, null
, null
, (select id from items where CONTEXTITEMNAME = '[BBHOST]' and name = 'link-default')
, 0
, 0
, 'NOT_PUBLISHED'
, null
, hibernate_sequence.currVal
from items
where type = 'PAGE'
and   state = 'INSTANTIATED'
;

-- Add properties on each page Link
INSERT INTO PROPERTY_DEFINITION
(
  ID
, NAME
, INTERNALVALUE
, TYPE
, ITEM_ID
)
SELECT 
  hibernate_sequence.nextVal
, 'title'
, (select internalvalue 
   from    property_definition pdn
   ,       items ite
   where ite.id = pdn.item_id
   and   ite.name = substr(ite0.name,6)
   and   ITE.CONTEXTITEMNAME = ITE0.CONTEXTITEMNAME
   and   lower(pdn.name) = 'title'
  )
, 'string'
, ID
FROM   ITEMS ite0
WHERE TYPE = 'LINK' 
AND   NAME LIKE 'link%'
;

INSERT INTO PROPERTY_DEFINITION
(
  ID
, NAME
, INTERNALVALUE
, TYPE
, ITEM_ID
)
SELECT 
  hibernate_sequence.nextVal
, 'TemplateName'
, 'link-default'
, 'string'
, ID
FROM   ITEMS
WHERE TYPE = 'LINK' 
AND   NAME LIKE 'link%'
;

INSERT INTO PROPERTY_DEFINITION
(
  ID
, NAME
, INTERNALVALUE
, TYPE
, ITEM_ID
)
SELECT 
  hibernate_sequence.nextVal
, 'Order'
, ID
, 'string'
, ID
FROM   ITEMS
WHERE TYPE = 'LINK' 
AND   NAME LIKE 'link%'
;

INSERT INTO PROPERTY_DEFINITION
(
  ID
, NAME
, INTERNALVALUE
, TYPE
, ITEM_ID
)
SELECT 
  hibernate_sequence.nextVal
, 'Description'
, null
, 'string'
, ID
FROM   ITEMS
WHERE TYPE = 'LINK' 
AND   NAME LIKE 'link%'
;

INSERT INTO PROPERTY_DEFINITION
(
  ID
, NAME
, INTERNALVALUE
, TYPE
, ITEM_ID
)
SELECT 
  hibernate_sequence.nextVal
, 'itemType'
, 'page'
, 'string'
, ID
FROM   ITEMS
WHERE TYPE = 'LINK' 
AND   NAME LIKE 'link%'
;

INSERT INTO PROPERTY_DEFINITION
(
  ID
, NAME
, INTERNALVALUE
, TYPE
, ITEM_ID
)
SELECT 
  hibernate_sequence.nextVal
, 'ItemRef'
, substr(name,6)
, 'string'
, ID
FROM   ITEMS
WHERE TYPE = 'LINK' 
AND   NAME LIKE 'link%'
;

-- Secure new Links
-- Create ACL_OBJECT_IDENTITY entries for the root links
insert into acl_object_identity
(
  ID
, OBJECT_ID_CLASS
, OBJECT_ID_IDENTITY
, PARENT_OBJECT
, OWNER_SID
, ENTRIES_INHERITING
)
select hibernate_sequence.nextVal
,      (select id from acl_class where class = 'com.backbase.portal.foundation.domain.model.Link')
,      ite.id
,      (select obj.id
       from acl_object_identity obj
       ,    items ite2
       where OBJ.OBJECT_ID_IDENTITY = ite2.id
       and   obj.object_id_class = (select id from acl_class where class = 'com.backbase.portal.foundation.domain.model.Portal')
       and   ite2.type = 'PORTAL'
       and   ITE2.NAME = ite.CONTEXTITEMNAME 
       )
,      (select id from acl_sid where sid = 'admin')
,      1 
from   items ite
where  ite.name not like 'link%'
and    ite.type = 'LINK'
;

-- Create ACL_OBJECT_IDENTITY entries for the pages
insert into acl_object_identity
(
  ID
, OBJECT_ID_CLASS
, OBJECT_ID_IDENTITY
, PARENT_OBJECT
, OWNER_SID
, ENTRIES_INHERITING
)
select hibernate_sequence.nextVal
,      (select id from acl_class where class = 'com.backbase.portal.foundation.domain.model.Link')
,      (select ite2.id 
        from items ite1
        ,    items ite2
        where ite1.id = object_id_identity
        and   ITE1.CONTEXTITEMNAME = ite2.CONTEXTITEMNAME
        and   ITE2.NAME = 'link_' || ite1.name
       ) 
,      parent_object
,      owner_sid
,      entries_inheriting 
from   acl_object_identity obj
,      acl_class cls
where  obj.object_id_identity in (select id 
                              from items 
                              where type = 'PAGE' 
                              and   state = 'INSTANTIATED'
                             )
and    obj.object_id_class = cls.id
and    cls.class = 'com.backbase.portal.foundation.domain.model.Page'
;

-- Copy ACL_ENTRY records in case security is not inherited from the Portal anymore.
insert into acl_entry
(
  ID
, ACL_OBJECT_IDENTITY
, ACE_ORDER
, SID
, MASK
, GRANTING
, AUDIT_SUCCESS
, AUDIT_FAILURE
)
select 
  hibernate_sequence.nextVal
, (select obj_link.id
   from   acl_object_identity obj_page
   ,      acl_class cls_page
   ,      items ite_page
   ,      acl_object_identity obj_link
   ,      acl_class cls_link
   ,      items ite_link
   where 1=1
   and    obj_page.object_id_class = cls_page.id
   and    cls_page.class = 'com.backbase.portal.foundation.domain.model.Page'
   and    obj_link.object_id_class = cls_link.id
   and    cls_link.class = 'com.backbase.portal.foundation.domain.model.Link'
   and    OBJ_PAGE.OBJECT_ID_IDENTITY = ite_page.id
   and    obj_link.OBJECT_ID_IDENTITY = ite_link.id
   and    ite_link.name = 'link_'||ite_page.name
   and    ite_link.CONTEXTITEMNAME = ite_page.CONTEXTITEMNAME
   and    OBJ_PAGE.ID = obj.ID
   )
, ace.ACE_ORDER
, ace.SID
, ace.MASK
, ace.GRANTING
, ace.AUDIT_SUCCESS
, ace.AUDIT_FAILURE
from   acl_entry ace
,      acl_object_identity obj
,      acl_class cls
where  ACE.ACL_OBJECT_IDENTITY = obj.id
and    object_id_identity in (select id 
                              from items 
                              where type = 'PAGE' 
                              and   state = 'INSTANTIATED'
                             )
and    obj.object_id_class = cls.id
and    cls.class = 'com.backbase.portal.foundation.domain.model.Page'
;


-- Secure new Link properties (will inherit from the Link item).
insert into acl_object_identity
(
  ID
, OBJECT_ID_CLASS
, OBJECT_ID_IDENTITY
, PARENT_OBJECT
, OWNER_SID
, ENTRIES_INHERITING
)
select hibernate_sequence.nextVal
,      (select id from acl_class where class = 'com.backbase.portal.foundation.domain.conceptual.PropertyDefinition')
,      pdn.id
,      (select id
        from acl_object_identity
        where OBJECT_ID_IDENTITY = ite.id
        and   object_id_class = (select id from acl_class where class = 'com.backbase.portal.foundation.domain.model.Link')
       )
,      (select owner_sid
        from acl_object_identity
        where OBJECT_ID_IDENTITY = ite.id
        and   object_id_class = (select id from acl_class where class = 'com.backbase.portal.foundation.domain.model.Link')
       )
,      1
from   acl_object_identity obj
,      acl_class           cls
,      items               ite
,      property_definition pdn
where  OBJ.OBJECT_ID_IDENTITY = ite.id
and    obj.object_id_class = cls.id
and    cls.class = 'com.backbase.portal.foundation.domain.model.Link'
and    ite.id = PDN.ITEM_ID
and    ite.type = 'LINK'
;



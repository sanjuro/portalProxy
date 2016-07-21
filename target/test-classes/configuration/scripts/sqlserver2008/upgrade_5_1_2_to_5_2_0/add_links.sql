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

if exists (select 1 from sysobjects where name='create_links_for')
    drop procedure create_links_for;
go

create procedure create_links_for
(
    @name nvarchar(255)
)
as
begin
    INSERT INTO items
    (
      discriminator
    , contextItemName
    , createdBy
    , createdTimestamp
    , itemHandlerBeanName
    , lastModifiedBy
    , lastModifiedTimestamp
    , lastPublicationTimestamp
    , name
    , parentItemName
    , state
    , subType
    , transformerBeanName
    , type
    , userId
    , extendedItem_id
    , template_id
    , locked
    , hidden
    , publicationStatus
    , nextPublishAction
    , uuid
    )
    SELECT
      'Link'
    , name
    , 1
    , getdate()
    , 'linkInstanceHandler'
    , 1
    , getdate()
    , null
    , @name
    , name
    , 'INSTANTIATED'
    , null
    , null
    , 'LINK'
    , null
    , null
    , (select id from items where contextItemName = '[BBHOST]' and name = 'link-default')
    , 0
    , 0
    , 'NOT_PUBLISHED'
    , null
    , '-1'
    FROM items
    WHERE type = 'PORTAL'
end
go

if exists (select 1 from sysobjects where name='insert_prop_for')
    drop procedure insert_prop_for;
go

create procedure insert_prop_for
(
    @itemName nvarchar(255),
    @itemType nvarchar(255),
    @propertyName nvarchar(255),
    @propertyValue nvarchar(756),
    @propertyType nvarchar(255)
)
as
begin
    INSERT INTO property_definition(name,internalValue,type,item_id)
    select @propertyName,@propertyValue,@propertyType, id
    from items
    where name LIKE @itemName
    and @itemType in ('',type)
end
go

if exists (select 1 from sysobjects where name='insert_props_for')
    drop procedure insert_props_for;
go
create procedure insert_props_for
(
    @itemName nvarchar(255),
    @itemType nvarchar(255),
    @title nvarchar(255),
    @orderParam nvarchar(2)
)
as
begin
    execute insert_prop_for @itemName,@itemType,'title',@title,'string'
    execute insert_prop_for @itemName,@itemType,'TemplateName','link-default','string'
    execute insert_prop_for @itemName,@itemType,'Order',@orderParam,'string'
    execute insert_prop_for @itemName,@itemType,'Description',null,'string'
    execute insert_prop_for @itemName,@itemType,'itemType','menuHeader','string'
end
go

-- Create root link for main navigation menu
execute create_links_for 'navroot_mainmenu'

-- Add properties on root link for main navigation menu
execute insert_props_for 'navroot_mainmenu','','Main Navigation','10'

-- Create root link for not in menu
execute create_links_for 'navroot_notinmenu'

-- Add properties on root link for not in navigation menu
execute insert_props_for 'navroot_notinmenu','','Not in Navigation','20'

-- Create a Link item for every page.
INSERT INTO ITEMS
(
  discriminator
, contextItemName
, createdBy
, createdTimestamp
, itemHandlerBeanName
, lastModifiedBy
, lastModifiedTimestamp
, lastPublicationTimestamp
, name
, parentItemName
, state
, subType
, transformerBeanName
, type
, userId
, extendedItem_id
, template_id
, locked
, hidden
, publicationStatus
, nextPublishAction
, uuid
)
select
 'Link'
, contextItemName
, 1
, getdate()
, 'linkInstanceHandler'
, 1
, getdate()
, null
, 'link_' + name
, 'navroot_mainmenu'
, 'INSTANTIATED'
, null
, null
, 'LINK'
, null
, null
, (select id from items where contextItemName = '[BBHOST]' and name = 'link-default')
, 0
, 0
, 'NOT_PUBLISHED'
, null
, '-1'
from items
where type = 'PAGE'
and   state = 'INSTANTIATED'
;

-- Add properties on each page Link
INSERT INTO property_definition(name,internalValue,type,item_id)
SELECT
  'title'
, (select internalvalue
   from    property_definition pdn
   ,       items ite
   where ite.id = pdn.item_id
   and   ite.name = right(ite0.name,len(ite0.name)-5)
   and   ite.contextItemName = ite0.contextItemName
   and   lower(pdn.name) = 'title'
  )
, 'string'
, ID
FROM   items ite0
WHERE type = 'LINK'
AND name LIKE 'link%'
;

execute insert_prop_for 'link%','LINK','TemplateName','link-default','string'
execute insert_prop_for 'link%','LINK','Description',null,'string'
execute insert_prop_for 'link%','LINK','itemType','page','string'

INSERT INTO property_definition(name,internalValue,type,item_id)
SELECT
  'Order'
, id
, 'string'
, id
FROM   items
WHERE type = 'LINK'
AND name LIKE 'link%'
;

INSERT INTO property_definition(name,internalValue,type,item_id)
SELECT
  'ItemRef'
, right(name,len(name)-5)
, 'string'
, id
FROM   items
WHERE type = 'LINK'
AND   name LIKE 'link%'
;

-- Secure new Links
-- Create ACL_OBJECT_IDENTITY entries for the root links
insert into acl_object_identity
(
  object_id_class
, object_id_identity
, parent_object
, owner_sid
, entries_inheriting
)
select
       (select id from acl_class where class = 'com.backbase.portal.foundation.domain.model.Link')
,      ite.id
,      (select obj.id
       from acl_object_identity obj
       ,    items ite2
       where obj.object_id_identity = ite2.id
       and   obj.object_id_class = (select id from acl_class where class = 'com.backbase.portal.foundation.domain.model.Portal')
       and   ite2.type = 'PORTAL'
       and   ite2.name = ite.contextItemName
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
  object_id_class
, object_id_identity
, parent_object
, owner_sid
, entries_inheriting
)
select
       (select id from acl_class where class = 'com.backbase.portal.foundation.domain.model.Link')
,      (select ite2.id
        from items ite1
        ,    items ite2
        where ite1.id = object_id_identity
        and   ite1.contextItemName = ite2.contextItemName
        and   ite2.name = 'link_' + ite1.name
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
  acl_object_identity
, ace_order
, sid
, mask
, granting
, audit_success
, audit_failure
)
select
  (select obj_link.id
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
   and    obj_page.object_id_identity = ite_page.id
   and    obj_link.object_id_identity = ite_link.id
   and    ite_link.name = 'link_' + ite_page.name
   and    ite_link.contextItemName = ite_page.contextItemName
   and    obj_page.id = obj.id
   )
, ace.ace_order
, ace.sid
, ace.mask
, ace.granting
, ace.audit_success
, ace.audit_failure
from   acl_entry ace
,      acl_object_identity obj
,      acl_class cls
where  ace.acl_object_identity = obj.id
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
  object_id_class
, object_id_identity
, parent_object
, owner_sid
, entries_inheriting
)
select
       (select id from acl_class where class = 'com.backbase.portal.foundation.domain.conceptual.PropertyDefinition')
,      pdn.id
,      (select id
        from acl_object_identity
        where object_id_identity = ite.id
        and   object_id_class = (select id from acl_class where class = 'com.backbase.portal.foundation.domain.model.Link')
       )
,      (select owner_sid
        from acl_object_identity
        where object_id_identity = ite.id
        and   object_id_class = (select id from acl_class where class = 'com.backbase.portal.foundation.domain.model.Link')
       )
,      1
from   acl_object_identity obj
,      acl_class           cls
,      items               ite
,      property_definition pdn
where  obj.object_id_identity = ite.id
and    obj.object_id_class = cls.id
and    cls.class = 'com.backbase.portal.foundation.domain.model.Link'
and    ite.id = pdn.item_id
and    ite.type = 'LINK'
go

update items set uuid = convert(nvarchar,id) where uuid='-1';


if exists (select 1 from sysobjects where name='acl_entry')
    drop table acl_entry;
GO
if exists (select 1 from sysobjects where name='acl_object_identity')
    drop table acl_object_identity;
GO
if exists (select 1 from sysobjects where name='acl_sid')
    drop table acl_sid;
GO
if exists (select 1 from sysobjects where name='acl_class')
    drop table acl_class;
GO

if exists (select 1 from sysobjects where name='user_property_definition')
    drop table user_property_definition;
GO

if exists (select 1 from sysobjects where name='property_definition')
    drop table property_definition;
GO
if exists (select 1 from sysobjects where name='content_references')
    drop table content_references;
GO
if exists (select 1 from sysobjects where name='item_tags')
    drop table item_tags;
GO
if exists (select 1 from sysobjects where name='tags')
    drop table tags;
GO
if exists (select 1 from sysobjects where name='items')
    drop table items;
GO
if exists (select 1 from sysobjects where name='users_groups')
    drop table users_groups;
GO
if exists (select 1 from sysobjects where name='users')
    drop table users;
GO
if exists (select 1 from sysobjects where name='groups')
    drop table groups;
GO
if exists (select 1 from sysobjects where name='deleted_page_item')
    drop table deleted_page_item;
GO


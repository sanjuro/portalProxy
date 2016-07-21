-- add user_property_definition table, setup constraints and add index on name

create table user_property_definition (
    id numeric(19,0) identity not null,
    label nvarchar(255) null,
    name nvarchar(255) not null,
    internalValue nvarchar(756) null,
    type nvarchar(255) null,
    versioning nvarchar(255) null,
    viewHint nvarchar(255) null,
    user_id numeric(19,0) null,
    item_id numeric(19,0) null,
    primary key (id))
GO

alter table user_property_definition add constraint FK_USER_PROP_DEF_USER_ID foreign key (user_id) references users
GO

CREATE NONCLUSTERED INDEX IDX_USER_PROP_DEF_NAME on user_property_definition (name)
GO

CREATE NONCLUSTERED INDEX IDX_USER_PROP_DEF_USER_ID on user_property_definition(user_id)
GO

create table deleted_page_item  (
	id numeric(19,0) identity not null,
	uuid nvarchar(255) not null,
    pageUuid nvarchar(255) not null,
    itemName nvarchar(255) not null,
    itemTitle nvarchar(255),
    itemType nvarchar(255) not null
)
GO

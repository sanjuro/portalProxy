create table acl_class (
	id bigint not null IDENTITY(1,1),
	class nvarchar(100) not null,
	primary key (id)
)
alter table acl_class add constraint unique_uk_2 unique(class)
GO

  create table acl_entry (
	id bigint not null IDENTITY(19,1),
	acl_object_identity bigint not null,
	ace_order int not null,
	sid bigint not null,
	mask int not null,
	granting bit not null,
	audit_success bit not null,
	audit_failure bit not null,
	primary key (id)
)
alter table acl_entry add constraint unique_uk_4 unique(acl_object_identity,ace_order)
GO


  create table acl_object_identity (
	id bigint not null IDENTITY(1,1),
	object_id_class bigint not null,
	object_id_identity bigint not null,
	parent_object bigint,
	owner_sid bigint not null,
	entries_inheriting bit not null,
	primary key (id)
)
alter table acl_object_identity add constraint unique_uk_3 unique(object_id_class,object_id_identity)
GO

  create table acl_sid (
	id bigint not null IDENTITY(19,1),
	principal bit not null,
	sid nvarchar (100) not null,
	primary key (id)
)
alter table acl_sid add constraint unique_uk_1 unique(principal,sid)
GO

--------------------------------------------------------
-- Relationships
--------------------------------------------------------
alter table acl_entry  add constraint fk_acl_entry_acl_object_id foreign key (acl_object_identity)
	references acl_object_identity(id)
GO

alter table acl_entry  add constraint fk_acl_entry_sid foreign key(sid) references acl_sid(id)
GO

alter table acl_object_identity  add constraint fk_acl_obj_id_class foreign key (object_id_class) references acl_class(id)
GO

alter table acl_object_identity  add constraint fk_acl_obj_id_sid foreign key (owner_sid) references acl_sid(id)
GO

CREATE INDEX IDX_OBJ_01 ON acl_object_identity(parent_object)
GO

--------------------------------------------------------
-- Triggers    TODO No triggers? Native id like H2 and MySQL????
--------------------------------------------------------



create table groups (id numeric(19,0) identity not null, deleted tinyint null, deletedTimeStamp datetime null, description nvarchar(255) null, name nvarchar(255) null, role nvarchar(255) null, primary key (id))
GO

create table tags (
	id  numeric(19,0) identity not null,
	name nvarchar(255) not null,
	type nvarchar(255) not null,
	contextItemName nvarchar(150),
	primary key (id)
)
GO

create table items (
    discriminator nvarchar(31) not null,
    id numeric(19,0) identity not null,
    contextItemName nvarchar(150) not null,
    createdBy nvarchar(255) null,
    createdTimestamp datetime null,
    lastModifiedBy nvarchar(255) null,
    lastModifiedTimestamp datetime null,
    lastPublicationTimestamp datetime null,
    name nvarchar(150) not null,
    parentItemName nvarchar(150) null,
    state nvarchar(255) not null,
    subType nvarchar(255) null,
    transformerBeanName nvarchar(255) null,
    type nvarchar(255) not null,
    userId nvarchar(255) null,
    extendedItem_id numeric(19,0) null,
    template_id numeric(19,0) null,
    lockCounter numeric(19,0) not null default 0,
    hidden bit not null default 0,
    publicationStatus nvarchar(25) not null,
    nextPublishAction nvarchar(25) default null,
    uuid nvarchar(40) not null,
    page_id numeric(19,0),
    manageable bit null,
    primary key (id)
    )
GO

alter table items add constraint UQ_ITM_01 unique(name, contextItemName)
GO

create table item_tags (
	id numeric(19,0) identity not null,
	item_id numeric(19,0) not null,
	tag_id numeric(19,0) not null,
  blacklist bit not null default 0,
  manageable bit not null default 1,
	primary key (id)
)
GO

create table property_definition (
id numeric(19,0) identity not null,
  label nvarchar(255) null,
  name nvarchar(255) not null,
  internalValue nvarchar(2000) null,
  type nvarchar(255) null,
  versioning nvarchar(255) null,
  viewHint nvarchar(255) null,
  user_id numeric(19,0) null,
  item_id numeric(19,0) null,
  manageable bit not null default 1,
  primary key (id)
  )
GO

create table user_property_definition (
    id numeric(19,0) identity not null,
    label nvarchar(255) null,
    name nvarchar(255) not null,
    internalValue nvarchar(2000) null,
    type nvarchar(255) null,
    versioning nvarchar(255) null,
    viewHint nvarchar(255) null,
    user_id numeric(19,0) null,
    item_id numeric(19,0) null,
    primary key (id))
GO

create table deleted_page_item  (
	id numeric(19,0) identity not null,
	uuid nvarchar(255) not null,
    pageUuid nvarchar(255) not null,
    itemName nvarchar(150) not null,
    itemTitle nvarchar(255),
    itemType nvarchar(255) not null
)
GO

create table users (id numeric(19,0) identity not null, lastLoggedIn datetime null, enabled tinyint not null, password nvarchar(255) null, username nvarchar(255) null, primary key (id))
GO

create table users_groups (users_id numeric(19,0) not null, groups_id numeric(19,0) not null)
GO

alter table property_definition add constraint FKF00C25FDA6F68767 foreign key (user_id) references users
GO

alter table property_definition add constraint FKF00C25FDA7A14068 foreign key (item_id) references items
GO

alter table item_tags
	add constraint FK_ITA_ITE_ID
	 foreign key (item_id)
	 references items (id)
GO

alter table item_tags
	add constraint FK_ITA_TAG_ID
	 foreign key (tag_id)
	 references tags (id)
GO


alter table users_groups add constraint FKD034EFEB9FE7600A foreign key (users_id) references users
GO

alter table users_groups add constraint FKD034EFEBEE9B51F8 foreign key (groups_id) references groups
GO



CREATE NONCLUSTERED INDEX IDX_USERS_GROUPS_USERS_ID on users_groups(users_id)
GO

CREATE NONCLUSTERED INDEX IDX_USERS_GROUPS_GROUPS_ID on users_groups(groups_Id)
GO

CREATE NONCLUSTERED INDEX IDX_ITEMS_USER_ID on items(userId)
GO

CREATE NONCLUSTERED INDEX IDX_ITEMS_PARENTITEMNAME on items(parentItemName)
GO

CREATE NONCLUSTERED INDEX IDX_ITEMS_EXTENDEDITEM_ID on items(extendedItem_id)
GO

CREATE NONCLUSTERED INDEX IDX_ITEMS_DISCRIMINATOR on items(discriminator)
GO

CREATE NONCLUSTERED INDEX IDX_PROPERTY_DEFINITIONS_ITEM_ID on property_definition(item_id)
GO

CREATE UNIQUE NONCLUSTERED INDEX IDX_PROPERTY_DEFINITIONS_NAME_ITEM_ID ON property_definition(name, item_id)
GO

CREATE NONCLUSTERED INDEX IDX_PROPERTY_DEFINITIONS_USER_ID on property_definition(user_id)
GO

CREATE NONCLUSTERED INDEX IDX_ITA_01 on item_tags (item_id)
GO

CREATE NONCLUSTERED INDEX IDX_ITA_02 on item_tags (tag_id)
GO

CREATE NONCLUSTERED INDEX IDX_ITE_01 on items (uuid)
GO

CREATE NONCLUSTERED INDEX IDX_ITE_02 on items (template_id)
GO

CREATE NONCLUSTERED INDEX IDX_ITE_03 on items (userId, parentItemName, contextItemName)
GO


CREATE NONCLUSTERED INDEX IDX_PDN_01 on property_definition (name)
GO

CREATE NONCLUSTERED INDEX IDX_USER_PROP_DEF_USER_ID on user_property_definition(user_id)
GO

CREATE NONCLUSTERED INDEX IDX_USER_PROP_DEF_NAME on user_property_definition (name)
GO
CREATE UNIQUE NONCLUSTERED index IDX_USER_USERNAME on users (username)
GO
CREATE UNIQUE NONCLUSTERED index IDX_TAG_NAME_CTX_TYPE on tags (name, contextItemName, type)
GO
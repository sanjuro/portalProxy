drop all objects;

create table users_groups (
	users_id bigint not null,
	groups_id bigint not null,
	primary key (users_id, groups_id)
);

create table property_definition (
	id bigint not null auto_increment,
	label varchar(255),
	viewHint varchar(255),
	type varchar(255) not null,
	name varchar(255) not null,
	internalValue varchar(2000),
	versioning varchar(255),
	item_id bigint,
	user_id bigint,
  manageable bit not null default 1,
	primary key (id)
);

create table user_property_definition (
	id bigint not null auto_increment,
	label varchar(255),
	viewHint varchar(255),
	type varchar(255) not null,
	name varchar(255) not null,
	internalValue varchar(2000),
	versioning varchar(255),
	item_id bigint,
	user_id bigint,
	primary key (id)
);

create table groups (
	id bigint not null auto_increment,
	name varchar(255),
	role varchar(255) not null,
	description varchar(255),
	deleted bit default 0,
	deletedTimestamp TIMESTAMP null,
	primary key (id)
);

create table item_tags (
	id bigint not null auto_increment,
	item_id bigint not null,
	tag_id bigint not null,
  blacklist bit not null default 0,
  manageable bit not null default 1,
	primary key (id)
);

create table tags (
	id bigint not null auto_increment,
	name varchar(255) not null,
	type varchar(255) not null,
	--H2 does not support function on indexes, so creating the upper version of 'name'
	upper_name varchar as UPPER(name),
	contextItemName varchar(255),
	primary key (id)
);

create table items (
	discriminator varchar(31) not null,
	id bigint not null auto_increment,
	state varchar(255) not null,
	name varchar(255) not null,
	parentItemName varchar(255),
	template_id bigint,
	contextItemName varchar(255) not null,
	subType varchar(255),
	type varchar(255) not null,
	userId varchar(255),
	extendedItem_id bigint,
	createdBy varchar(255),
	createdTimestamp TIMESTAMP,
	lastModifiedBy varchar(255),
	lastModifiedTimestamp TIMESTAMP,
	lastPublicationTimestamp TIMESTAMP,
    lockCounter int not null default 0,
    hidden bit not null default 0,
    publicationStatus varchar(25) not null,
    nextPublishAction varchar(25) default null,
    uuid varchar(40) not null,
    page_id bigint,
    manageable bit,
	primary key (id)
);

create table users (
	id bigint not null auto_increment,
	lastLoggedIn TIMESTAMP,
	enabled bit not null,
	password varchar(255),
	username varchar(255),
	primary key (id)
);

create table deleted_page_item  (
  id bigint not null auto_increment,
  uuid varchar(255) not null,
  pageUuid varchar(255) not null,
  itemName varchar(255) not null,
  itemTitle varchar(255),
  itemType varchar(255) not null,
  primary key(id)
);

create index IDX_ITE_01 on items (uuid);
create index IDX_ITE_02 ON items (template_id);
create index IDX_ITE_03 ON items (userId, parentItemName, contextItemName);

create index IDX_ITA_01 on item_tags (item_id);
alter table item_tags
	add constraint FK_ITA_ITE_ID
	 foreign key (item_id)
	 references items (id);

create index IDX_ITA_02 on item_tags (tag_id);
alter table item_tags
	add constraint FK_ITA_TAG_ID
	 foreign key (tag_id)
	 references tags (id);

create index FK5FDE7C0C7C251E2 on items (extendedItem_id);

alter table items add unique index(name, contextItemName);

create index FK82D73AFE506F736E on property_definition (item_id);
alter table property_definition
	add constraint FK82D73AFE506F736E
	 foreign key (item_id)
	 references items (id);
alter table property_definition add unique index (name, item_id);


create index FKD034EFEBEE9B51F8 on users_groups (groups_id);
alter table users_groups
	add constraint FKD034EFEBEE9B51F8
	foreign key (groups_id)
	references groups (id);

create index FKD034EFEB9FE7600A on users_groups (users_id);
alter table users_groups
	add constraint FKD034EFEB9FE7600A
	foreign key (users_id)
	references users (id);

create index FK59B5ED469FE7600A on property_definition(user_id);
alter table property_definition
	add constraint FK59B5ED469FE7600A
	foreign key (user_id)
	references users (id);

create index IDX_USER_PROP_DEF_USER_ID on user_property_definition(user_id);
alter table user_property_definition
	add constraint FK_USER_PROP_DEF_USER_ID
	foreign key (user_id)
	references users (id);

create table acl_sid (
	id bigint not null auto_increment,
	principal bit not null,
	sid varchar (100) not null,
	primary key (id)
);
alter table acl_sid add unique unique_uk_1(principal,sid);

create table acl_class (
	id bigint not null auto_increment,
	class varchar(100) not null,
	primary key (id)
);
alter table acl_class add unique unique_uk_2(class);

create table acl_object_identity (
	id bigint not null auto_increment,
	object_id_class bigint not null,
	object_id_identity bigint not null,
	parent_object bigint,
	owner_sid bigint,
	entries_inheriting bit not null,
	primary key (id)
);
alter table acl_object_identity add unique unique_uk_3(object_id_class,object_id_identity);

create table acl_entry (
	id bigint not null auto_increment,
	acl_object_identity bigint not null,
	ace_order int not null,
	sid bigint not null,
	mask int not null,
	granting bit not null,
	audit_success bit not null,
	audit_failure bit not null,
	primary key (id)
);
alter table acl_entry add unique unique_uk_4(acl_object_identity,ace_order);

create index IDX_PDN_01 on property_definition (name);
create index IDX_USER_PROP_DEF_NAME on user_property_definition (name);
create unique index IDX_USER_USERNAME on users (username);
create index IDX_OBJ_01 on acl_object_identity(parent_object);
create unique index IDX_TAG_NAME_CTX_TYPE on tags (upper_name, contextItemName, type);
/*!40101 SET NAMES utf8 */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

/*!drop procedure if exists identity */;
/*!create procedure identity() select last_insert_id() */;

create table groups (
	id bigint not null auto_increment,
	name varchar(150),
	role varchar(150) not null,
	description varchar(150),
	deleted smallint default 0,
	deletedTimestamp TIMESTAMP null,
	primary key (id)
) ENGINE=ndbcluster;

create table tags (
	id bigint not null auto_increment,
	name varchar(150) character set latin1 collate latin1_general_ci not null,
	type varchar(150) not null,
	contextItemName varchar(150),
	primary key (id)
) ENGINE=ndbcluster;

create table items (
	discriminator varchar(31) not null,
	id bigint not null auto_increment,
	state varchar(150) not null,
	name varchar(150) not null,
	parentItemName varchar(150),
	template_id bigint,
	contextItemName varchar(150) not null,
	subType varchar(150),
	type varchar(150) not null,
	userId varchar(150),
	extendedItem_id bigint,
	createdBy varchar(150),
	createdTimestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	lastModifiedTimestamp TIMESTAMP NOT NULL DEFAULT 0,
	lastModifiedBy varchar(150),
	lastPublicationTimestamp TIMESTAMP NULL DEFAULT NULL,
    lockCounter smallint not null default 0,
    hidden smallint not null default 0,
    publicationStatus varchar(25) not null,
    nextPublishAction varchar(25) default null,
    uuid varchar(40) not null,
    page_id bigint,
    manageable bit,
	primary key (id)
) ENGINE=ndbcluster;

create table item_tags (
	id bigint not null auto_increment,
	item_id bigint not null,
	tag_id bigint not null,
  blacklist smallint not null default 0,
  manageable bit not null default 1,
	primary key (id)
) ENGINE=ndbcluster;

create table property_definition (
	id bigint not null auto_increment,
	label varchar(150),
	viewHint varchar(150),
	type varchar(150) not null,
	name varchar(150) not null,
	internalValue varchar(2000),
	versioning varchar(150),
	item_id bigint,
	user_id bigint,
  manageable bit not null default 1,
	primary key (id)
) ENGINE=ndbcluster;

create table user_property_definition (
	id bigint not null auto_increment,
	label varchar(150),
	viewHint varchar(150),
	type varchar(150) not null,
	name varchar(150) not null,
	internalValue varchar(2000),
	versioning varchar(150),
	item_id bigint,
	user_id bigint,
	primary key (id)
) ENGINE=ndbcluster;


create table users (
	id bigint not null auto_increment,
	lastLoggedIn TIMESTAMP NULL DEFAULT NULL,
	enabled smallint not null,
	password varchar(150),
	username varchar(150),
	primary key (id)
) ENGINE=ndbcluster;

create table users_groups (
	users_id bigint not null,
	groups_id bigint not null,
	primary key (users_id, groups_id)
) ENGINE=ndbcluster;

create table deleted_page_item  (
  id bigint not null auto_increment,
  uuid varchar(255) not null,
  pageUuid varchar(255) not null,
  itemName varchar(150) not null,
  itemTitle varchar(255),
  itemType varchar(255) not null,
  primary key (id)
) ENGINE=ndbcluster;

drop table if exists acl_sid;
create table acl_sid (
	id bigint not null auto_increment,
	principal smallint not null,
	sid varchar (100) not null,
	primary key (id)
)ENGINE=ndbcluster;
alter table acl_sid add unique unique_uk_1(principal,sid);

create table acl_class (
	id bigint not null auto_increment,
	class varchar(100) not null,
	primary key (id)
)ENGINE=ndbcluster;
alter table acl_class add unique unique_uk_2(class);

create table acl_object_identity (
	id bigint not null auto_increment,
	object_id_class bigint not null,
	object_id_identity bigint not null,
	parent_object bigint,
	owner_sid bigint,
	entries_inheriting smallint not null,
	primary key (id)
)ENGINE=ndbcluster;
alter table acl_object_identity add unique unique_uk_3(object_id_class,object_id_identity);

create table acl_entry (
	id bigint not null auto_increment,
	acl_object_identity bigint not null,
	ace_order int not null,
	sid bigint not null,
	mask int not null,
	granting smallint not null,
	audit_success smallint not null,
	audit_failure smallint not null,
	primary key (id)
)ENGINE=ndbcluster;
alter table acl_entry add unique unique_uk_4(acl_object_identity,ace_order);

create index IDX_PDN_01 on property_definition (name);
create index IDX_USER_PROP_DEF_NAME on user_property_definition (name);
create unique index IDX_USER_USERNAME on users (username);
create INDEX idx_items_user_id ON items(userId);
create INDEX idx_items_parent_item_name ON items(parentItemName);
create INDEX idx_items_discriminator ON items(discriminator);
create INDEX IDX_ITE_01 ON items (uuid);
create INDEX IDX_ITE_02 ON items (template_id);
create index IDX_ITE_03 ON items (userId, parentItemName, contextItemName);
create index IDX_ITA_01 on item_tags (item_id);
create index IDX_ITA_02 on item_tags (tag_id);
create index FK5FDE7C0C7C251E2 on items (extendedItem_id);
alter table items add unique index(name, contextItemName);
create index FK82D73AFE506F736E on property_definition (item_id);
alter table property_definition add unique index (name, item_id);
create index FKD034EFEBEE9B51F8 on users_groups (groups_id);
create index FKD034EFEB9FE7600A on users_groups (users_id);
create index FK59B5ED469FE7600A on property_definition(user_id);
create index IDX_USER_PROP_DEF_USER_ID on user_property_definition(user_id);
CREATE INDEX IDX_OBJ_01 ON acl_object_identity(parent_object);
create unique index IDX_TAG_NAME_CTX_TYPE on tags (name, contextItemName, type);
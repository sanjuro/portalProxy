CREATE SEQUENCE ACL_CLASS_SEQ AS DECIMAL(27,0)
    INCREMENT BY 1
    START WITH 1
    MAXVALUE 999999
    NOCYCLE
    CACHE 20
    NO ORDER;

CREATE SEQUENCE ACL_ENTRY_SEQ AS DECIMAL(27,0)
    INCREMENT BY 1
    START WITH 1
    MAXVALUE 999999999999999999999999999
    NOCYCLE
    CACHE 100
    NO ORDER;

CREATE SEQUENCE ACL_OBJECT_IDENTITY_SEQ AS DECIMAL(27,0)
    INCREMENT BY 1
    START WITH 1
    MAXVALUE 999999999999999999999999999
    NOCYCLE
    CACHE 20
    NO ORDER;

CREATE SEQUENCE ACL_SID_SEQ AS DECIMAL(27,0)
    INCREMENT BY 1
    START WITH 1
    MAXVALUE 999999
    NOCYCLE
    CACHE 100
    NO ORDER;

CREATE TABLE ACL_CLASS(
    ID DECIMAL(19,0) NOT NULL,
    CLASS varchar(100) NOT NULL,
    PRIMARY KEY(ID),
    CONSTRAINT ACL_CLASS_CLASS_UQ UNIQUE(CLASS)
);


CREATE TABLE ACL_ENTRY(
    ID DECIMAL(19,0) NOT NULL,
    ACL_OBJECT_IDENTITY DECIMAL(19,0) NOT NULL,
    ACE_ORDER DECIMAL(19,0) NOT NULL,
    SID DECIMAL(19,0) NOT NULL,
    MASK DECIMAL(19,0) NOT NULL,
    GRANTING SMALLINT NOT NULL,
    AUDIT_SUCCESS SMALLINT NOT NULL,
    AUDIT_FAILURE SMALLINT NOT NULL,
    PRIMARY KEY(ID),
    CONSTRAINT ACL_ENTRY_IDENT_ORDER_UQ UNIQUE(ACL_OBJECT_IDENTITY,ACE_ORDER)
);


ALTER TABLE ACL_ENTRY
 ADD  CONSTRAINT ACL_ENTRY_GRANTING_CK CHECK (GRANTING IN (1,0));

ALTER TABLE ACL_ENTRY
 ADD  CONSTRAINT ACL_ENTRY_AUDIT_SUCCESS_CK CHECK (AUDIT_SUCCESS IN (1,0));

ALTER TABLE ACL_ENTRY
 ADD  CONSTRAINT ACL_ENTRY_AUDIT_FAILURE_CK CHECK (AUDIT_FAILURE IN (1,0));


CREATE TABLE ACL_OBJECT_IDENTITY(
    ID DECIMAL(19,0) NOT NULL,
    OBJECT_ID_CLASS DECIMAL(19,0) NOT NULL,
    OBJECT_ID_IDENTITY DECIMAL(19,0) NOT NULL,
    PARENT_OBJECT DECIMAL(19,0),
    OWNER_SID DECIMAL(19,0) NOT NULL,
    ENTRIES_INHERITING SMALLINT NOT NULL,
    PRIMARY KEY(ID),
    CONSTRAINT ACL_OBJ_ID_CLASS_IDENT_UQ UNIQUE(OBJECT_ID_CLASS,OBJECT_ID_IDENTITY)
);


ALTER TABLE ACL_OBJECT_IDENTITY
 ADD  CONSTRAINT ACL_OBJ_ID_ENTRIES_CK CHECK (ENTRIES_INHERITING IN (1,0));


CREATE TABLE ACL_SID(
    ID DECIMAL(19,0) NOT NULL,
    PRINCIPAL SMALLINT NOT NULL,
    SID varchar(100) NOT NULL,
    PRIMARY KEY(ID),
    CONSTRAINT ACL_SID_PRINCIPAL_SID_UQ UNIQUE(SID,PRINCIPAL)
);


ALTER TABLE ACL_SID
 ADD  CONSTRAINT ACL_SID_PRINCIPAL_CK CHECK (PRINCIPAL IN (1,0));


ALTER TABLE ACL_ENTRY
 ADD  CONSTRAINT FK_ACL_ENTRY_ACL_OBJECT_ID FOREIGN KEY(ACL_OBJECT_IDENTITY) REFERENCES ACL_OBJECT_IDENTITY(ID);


ALTER TABLE ACL_ENTRY
 ADD  CONSTRAINT FK_ACL_ENTRY_SID FOREIGN KEY(SID) REFERENCES ACL_SID(ID);

ALTER TABLE ACL_OBJECT_IDENTITY
 ADD  CONSTRAINT FK_ACL_OBJ_ID_CLASS FOREIGN KEY(OBJECT_ID_CLASS) REFERENCES ACL_CLASS(ID);

ALTER TABLE ACL_OBJECT_IDENTITY
 ADD  CONSTRAINT FK_ACL_OBJ_ID_SID FOREIGN KEY(OWNER_SID) REFERENCES ACL_SID(ID);

CREATE INDEX IDX_OBJ_01 ON ACL_OBJECT_IDENTITY(PARENT_OBJECT);

CREATE TRIGGER ACL_CLASS_ID
  NO CASCADE
  BEFORE INSERT ON ACL_CLASS
  REFERENCING NEW AS NEW_ACL_CLASS
  FOR EACH ROW MODE DB2SQL
  SET NEW_ACL_CLASS.ID = ACL_CLASS_SEQ.nextVal;

CREATE TRIGGER ACL_OBJECT_IDENTITY_ID NO CASCADE BEFORE INSERT ON ACL_OBJECT_IDENTITY REFERENCING NEW AS NEW_ACL_OBJECT_IDENTITY
  FOR EACH ROW MODE DB2SQL
  SET NEW_ACL_OBJECT_IDENTITY.ID = ACL_OBJECT_IDENTITY_SEQ.nextVal;

CREATE TRIGGER ACL_SID_ID NO CASCADE BEFORE INSERT ON ACL_SID REFERENCING NEW AS NEW_ACL_SID
  FOR EACH ROW MODE DB2SQL
  SET NEW_ACL_SID.ID = ACL_SID_SEQ.nextVal;

CREATE TRIGGER ACL_ENTRY_ID NO CASCADE BEFORE INSERT ON ACL_ENTRY REFERENCING NEW AS NEW_ACL_ENTRY
  FOR EACH ROW MODE DB2SQL
  SET NEW_ACL_ENTRY.ID = ACL_ENTRY_SEQ.nextVal;


create table groups (
  id bigint not null,
  deleted smallint,
  deletedTimestamp timestamp,
  description varchar(255),
  name varchar(255),
  role varchar(255),
  primary key (id)
);

create table tags (
  id bigint not null,
  name varchar(255) not null,
  type varchar(255) not null,
  contextItemName varchar(255),
  primary key (id)
);

create table items (
  discriminator varchar(31) not null,
  id bigint not null,
  contextItemName varchar(255) not null,
  createdBy varchar(255),
  createdTimestamp timestamp,
  lastModifiedBy varchar(255),
  lastModifiedTimestamp timestamp,
  lastPublicationTimestamp timestamp,
  name varchar(255) not null,
  parentItemName varchar(255),
  state varchar(255) not null,
  subType varchar(255),
  type varchar(255) not null,
  userId varchar(255),
  extendedItem_id bigint,
  template_id bigint,
    lockCounter smallint not null default 0,
    hidden smallint default 0,
    publicationStatus varchar(255) not null,
    nextPublishAction varchar(255) default null,
    uuid varchar(40) not null,
    page_id bigint,
    manageable smallint,
  primary key (id),
  unique (name, contextItemName)
);

create table item_tags (
  id bigint not null,
  item_id bigint not null,
  tag_id bigint not null,
  blacklist smallint default 0,
  manageable smallint not null default 1,
  primary key (id)
);

create table property_definition (
  id bigint not null,
  label varchar(255),
  name varchar(255) not null,
  internalValue varchar(2000),
  type varchar(255),
  versioning varchar(255),
  viewHint varchar(255),
  user_id bigint,
  item_id bigint,
  manageable smallint not null default 1,
  primary key (id)
);

create table user_property_definition (
  id bigint not null,
  label varchar(255),
  name varchar(255) not null,
  internalValue varchar(2000),
  type varchar(255),
  versioning varchar(255),
  viewHint varchar(255),
  user_id bigint,
  item_id bigint,
  primary key (id)
);

create table users (
  id bigint not null,
  lastLoggedIn timestamp,
  enabled smallint not null,
  password varchar(255),
  username varchar(255) not null,
  primary key (id)
);

create table users_groups (
  users_id bigint not null,
  groups_id bigint not null
);

create table deleted_page_item  (
  id bigint not null,
  uuid varchar(255) not null,
  pageUuid varchar(255) not null,
  itemName varchar(255) not null,
  itemTitle varchar(255),
  itemType varchar(255) not null,
  primary key(id)
);

alter table item_tags
  add constraint FK_ITA_ITE_ID
   foreign key (item_id)
   references items (id);

alter table item_tags
  add constraint FK_ITA_TAG_ID
   foreign key (tag_id)
   references tags (id);

alter table items add constraint FK5FDE7C09188310F foreign key (extendedItem_id) references items;
alter table property_definition add constraint FKF00C25FDA7A14068 foreign key (item_id) references items;
alter table property_definition add constraint FKF00C25FDA6F68767 foreign key (user_id) references users;

alter table user_property_definition add constraint FK_USER_PROP_DEF_USER_ID foreign key (user_id) references users;


alter table users_groups add constraint FKD034EFEBEE9B51F8 foreign key (groups_id) references groups;
alter table users_groups add constraint FKD034EFEB9FE7600A foreign key (users_id) references users;

create INDEX idx_items_extended_item_id ON items(extendedItem_id);
create INDEX idx_items_property_def_item_id ON property_definition(item_id);
CREATE UNIQUE INDEX idx_items_property_def_name_item_id ON property_definition (name, item_id);
create INDEX idx_users_groups_groups_id ON users_groups(groups_id);
create INDEX idx_users_groups_users_id ON users_groups(users_id);
create INDEX idx_items_property_def_user_id ON property_definition(user_id);

create INDEX idx_items_user_id ON items(userId);
create INDEX idx_items_parent_item_name ON items(parentItemName);
create INDEX idx_items_discriminator ON items(discriminator);

create index IDX_ITA_01 on item_tags (item_id);
create index IDX_ITA_02 on item_tags (tag_id);

create index IDX_ITE_01 on items (uuid);
create index IDX_ITE_02 ON items (template_id);
create index IDX_ITE_03 ON items (userId, parentItemName, contextItemName);

CREATE SEQUENCE hibernate_sequence AS DECIMAL(27,0)
INCREMENT BY 1
MAXVALUE 999999999999999999999999999
START WITH 1
CACHE 1000
NO ORDER
NOCYCLE;

create index IDX_PDN_01 on property_definition (name);

create index IDX_USER_PROP_DEF_USER_ID on user_property_definition(user_id);
create index IDX_USER_PROP_DEF_NAME on user_property_definition (name);
create unique index IDX_USER_USERNAME on users (username);


SET INTEGRITY FOR tags OFF;
alter table tags add COLUMN upperName GENERATED ALWAYS AS (UPPER(name));
SET INTEGRITY FOR tags IMMEDIATE CHECKED FORCE GENERATED;
CREATE unique INDEX IDX_TAG_NAME_CTX_TYPE ON tags (upperName, contextItemName, type);
SET INTEGRITY FOR ITEM_TAGS IMMEDIATE CHECKED;
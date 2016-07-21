-- add user_property_definition table, setup constraints and add index on name
create table user_property_definition (
  id number(19,0) not null,
  label nvarchar2(255),
  name nvarchar2(255) not null,
  internalValue nvarchar2(756),
  type nvarchar2(255),
  versioning nvarchar2(255),
  viewHint nvarchar2(255),
  user_id number(19,0),
  item_id number(19,0),
  primary key (id)
);

alter table user_property_definition add constraint FK_USER_PROP_DEF_USER_ID foreign key (user_id) references users;

CREATE INDEX IDX_USER_PROP_DEF_USER_ID ON user_property_definition (user_id)
LOGGING
NOPARALLEL;

CREATE index IDX_USER_PROP_DEF_USER_NAME ON user_property_definition (name)
LOGGING
NOPARALLEL;

create table deleted_page_item  (
  id number(19,0) not null,
  uuid nvarchar2(255) not null,
  pageUuid nvarchar2(255) not null,
  itemName nvarchar2(255) not null,
  itemTitle nvarchar2(255),
  itemType nvarchar2(255) not null,
primary key (id)
);

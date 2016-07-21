-- add user_property_definition table, setup constraints and add index on name

create table user_property_definition (
    id bigint not null,
    label nvarchar(255),
    name nvarchar(255) not null,
    internalValue nvarchar(756),
    type nvarchar(255),
    versioning nvarchar(255),
    viewHint nvarchar(255),
    user_id bigint,
    item_id bigint,
    primary key (id)
);


alter table user_property_definition
    add constraint FK_USER_PROP_DEF_USER_ID
    foreign key (user_id)
    references users (id);

create index IDX_USER_PROP_DEF_USER_ID on user_property_definition(user_id);
create index IDX_USER_PROP_DEF_NAME on user_property_definition (name);

create table deleted_page_item  (
  id bigint not null,
  uuid nvarchar(255) not null,
  pageUuid nvarchar(255) not null,
  itemName nvarchar(255) not null,
  itemTitle nvarchar(255),
  itemType nvarchar(255) not null,
  primary key(id)
);

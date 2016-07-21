-- add user_property_definition table, setup constraints and add index on name

create table user_property_definition (
    id bigint not null auto_increment,
    label varchar(255),
    viewHint varchar(255),
    type varchar(255) not null,
    name varchar(255) not null,
    internalValue varchar(756),
    versioning varchar(255),
    item_id bigint,
    user_id bigint,
    primary key (id)
) ENGINE=InnoDB;


alter table user_property_definition
    add constraint FK_USER_PROP_DEF_USER_ID
    foreign key (user_id)
    references users (id);

create index IDX_USER_PROP_DEF_USER_ID on user_property_definition(user_id);
create index IDX_USER_PROP_DEF_NAME on user_property_definition (name);

create table deleted_page_item  (
  id bigint not null auto_increment,
  uuid varchar(255) not null,
  pageUuid varchar(255) not null,
  itemName varchar(150) not null,
  itemTitle varchar(255),
  itemType varchar(255) not null,
  primary key (id)
) ENGINE=InnoDB;

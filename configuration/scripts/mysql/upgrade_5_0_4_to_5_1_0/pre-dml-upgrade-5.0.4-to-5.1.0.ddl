/* Perform the pre dml migration */

create table tags (
	id bigint not null auto_increment,
	name varchar(255) not null,
	type varchar(255) not null,
	contextItemName varchar(255),
	primary key (id)
) ENGINE=InnoDB;

alter table items add createdBy varchar(255);
alter table items add lastModifiedBy varchar(255);
alter table items add locked bit not null default 0;

create table item_tags (
	id bigint not null auto_increment,
	item_id bigint not null,
	tag_id bigint not null,
    blacklist bit not null default 0,
	primary key (id)
) ENGINE=InnoDB;

create table content_references (
	id bigint not null auto_increment,
	uuid varchar(255) not null,
	cmisUid varchar(255) not null,
	item_id bigint,
	type varchar(255),
	primary key (id)
) ENGINE=InnoDB;

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

create index IDX_CRE_01 on content_references (item_id);
alter table content_references
	add constraint FK_CRE_ITE_ID
	 foreign key (item_id)
	 references items (id);



-- Perform the pre dml migration
create table tags (
	id  number(19,0) not null,
	name nvarchar2(255) not null,
	type nvarchar2(255) not null,
	contextItemName nvarchar2(255),
	primary key (id)
);

alter table items add createdBy nvarchar2(255);

alter table items add lastModifiedBy nvarchar2(255);

alter table items add locked number(1,0) default 0 not null;

create table item_tags (
	id number(19,0) not null,
	item_id number(19,0) not null,
	tag_id number(19,0) not null,
    blacklist number(1,0) default 0 not null,
	primary key (id)
);

create table content_references (
    id number(19,0) not null,
	uuid nvarchar2(255) not null,
	cmisUid nvarchar2(255) not null,
    item_id number(19,0),
	type nvarchar2(255),
	primary key (id)
);

alter table item_tags
	add constraint FK_ITA_ITE_ID
	 foreign key (item_id)
	 references items (id);

alter table item_tags
	add constraint FK_ITA_TAG_ID
	 foreign key (tag_id)
	 references tags (id);

alter table content_references
	add constraint FK_CRE_ITE_ID
	 foreign key (item_id)
	 references items (id);

CREATE INDEX IDX_ITA_01 ON item_tags (item_id)
LOGGING
NOPARALLEL;

CREATE INDEX IDX_ITA_02 ON item_tags (tag_id)
LOGGING
NOPARALLEL;

CREATE INDEX IDX_CRE_01 ON content_references
(item_id)
LOGGING
NOPARALLEL;

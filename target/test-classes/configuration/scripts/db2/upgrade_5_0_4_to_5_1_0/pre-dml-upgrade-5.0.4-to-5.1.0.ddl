-- Perform the pre dml migration
create table tags (
	id bigint not null,
	name nvarchar(255) not null,
	type nvarchar(255) not null,
	contextItemName nvarchar(255),
	primary key (id)
);

alter table items add createdBy nvarchar(255);
alter table items add lastModifiedBy nvarchar(255);
alter table items add locked smallint default 0;

create table item_tags (
	id bigint not null,
	item_id bigint not null,
	tag_id bigint not null,
    blacklist smallint default 0,
	primary key (id)
);

create table content_references (
	id bigint not null,
	uuid nvarchar(255) not null,
	cmisUid nvarchar(255) not null,
	item_id bigint,
	type nvarchar(255),
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

create index IDX_ITA_01 on item_tags (item_id);
create index IDX_ITA_02 on item_tags (tag_id);
create index IDX_CRE_01 on content_references (item_id);


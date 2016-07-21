-- Perform the pre dml migration
create table tags (
	id  numeric(19,0) identity not null,
	name nvarchar(255) not null,
	type nvarchar(255) not null,
	contextItemName nvarchar(255),
	primary key (id)
)
GO

alter table items add createdBy nvarchar(255) null;
alter table items add lastModifiedBy nvarchar(255) null;
alter table items add locked bit not null default 0;

create table item_tags (
	id numeric(19,0) identity not null,
	item_id numeric(19,0) not null,
	tag_id numeric(19,0) not null,
    blacklist bit not null default 0,
	primary key (id)
)
GO

create table content_references (
	id numeric(19,0) identity not null,
	uuid nvarchar(255) not null,
	cmisUid nvarchar(255) not null,
	item_id numeric(19,0) null,
	type nvarchar(255) null,
	primary key (id)
)
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


alter table content_references
	add constraint FK_CRE_ITE_ID
	 foreign key (item_id)
	 references items (id)
GO

CREATE NONCLUSTERED INDEX IDX_ITA_01 on item_tags (item_id)
GO

CREATE NONCLUSTERED INDEX IDX_ITA_02 on item_tags (tag_id)
GO

CREATE NONCLUSTERED INDEX IDX_CRE_01 on content_references (item_id)
GO

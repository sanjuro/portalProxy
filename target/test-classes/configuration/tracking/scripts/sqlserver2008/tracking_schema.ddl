create table tracking_events (
	id numeric(19,0) identity not null,
	portalName nvarchar(255) not null,
    itemName nvarchar(255) not null,
    tagName nvarchar(255) not null,
    userName nvarchar(255),
    timestamp datetime not null,
    primary key (id))
GO

create index IDX_TRA_01 on tracking_events (userName)
GO

create index IDX_TRA_02 on tracking_events (tagName)
GO
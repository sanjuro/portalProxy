create table audit_events (
    id numeric(19,0) identity not null,
    userName nvarchar(255) not null,
    action nvarchar(255) not null,
    context nvarchar(255) not null,
    itemName nvarchar(255) not null,
    itemTitle nvarchar(255) null,
    itemType nvarchar(255) null,
    salt nvarchar(255) not null,
    hash nvarchar(255) not null,
    timestamp datetime not null,
    primary key (id))
GO

create index IDX_AUD_01 on audit_events (userName)
GO

create index IDX_AUD_02 on audit_events (itemType)
GO

create index IDX_AUD_03 on audit_events (context)
GO




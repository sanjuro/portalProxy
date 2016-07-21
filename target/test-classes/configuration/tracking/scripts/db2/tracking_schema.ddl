create table tracking_events (
	id bigint not null,
	portalName nvarchar(255) not null,
    itemName nvarchar(255) not null,
    tagName nvarchar(255) not null,
    userName nvarchar(255),
    timestamp TIMESTAMP not null,
    primary key (id)
);

create index IDX_TRA_01 on tracking_events (userName);

create index IDX_TRA_02 on tracking_events (tagName);

create sequence hibernate_sequence;
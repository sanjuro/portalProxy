
drop table if exists audit_events;
create table audit_events (
	id bigint not null auto_increment,
	userName varchar(255) not null,
    action varchar(255) not null,
    context varchar(255) not null,
    itemName varchar(255),
    itemTitle varchar(255),
    itemType varchar(255),
    salt varchar(255) not null,
    hash varchar(255) not null,
    timestamp TIMESTAMP not null,
    primary key (id)
);

create index IDX_AUD_01 on audit_events (userName);

create index IDX_AUD_02 on audit_events (itemType);

create index IDX_AUD_03 on audit_events (context);





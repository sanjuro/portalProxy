create table audit_events  (
  id bigint not null,
  userName nvarchar(255) not null,
  action nvarchar(255) not null,
  context nvarchar(255) not null,
  itemName nvarchar(255) not null,
  itemTitle nvarchar(255),
  itemType nvarchar(255),
  salt nvarchar(255) not null,
  hash nvarchar(255) not null,
  timestamp TIMESTAMP not null,
  primary key(id)
);

create sequence hibernate_sequence;

create index IDX_AUD_01 on audit_events (userName);

create index IDX_AUD_02 on audit_events (itemType);

create index IDX_AUD_03 on audit_events (context);
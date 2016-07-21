create table audit_events  (
  id number(19,0) not null,
  userName nvarchar2(255) not null,
  action nvarchar2(255) not null,
  context nvarchar2(255) not null,
  itemName nvarchar2(255) not null,
  itemTitle nvarchar2(255),
  itemType nvarchar2(255),
  salt nvarchar2(255) not null,
  hash nvarchar2(255) not null,
  timestamp TIMESTAMP not null,
  primary key (id)
);

create sequence hibernate_sequence
  INCREMENT BY 1
  MAXVALUE 9999999999999999999999999999
  START WITH 1
  NOCACHE
  NOORDER
  NOCYCLE;

create index IDX_AUD_01 on audit_events (userName);

create index IDX_AUD_02 on audit_events (itemType);

create index IDX_AUD_03 on audit_events (context);

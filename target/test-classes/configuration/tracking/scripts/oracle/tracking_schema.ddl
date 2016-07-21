create table tracking_events (
	id number(19,0) not null,
	portalName nvarchar2(255) not null,
    itemName nvarchar2(255) not null,
    tagName nvarchar2(255) not null,
    userName nvarchar2(255),
    timestamp TIMESTAMP not null,
    primary key (id)
);

create index IDX_TRA_01 on tracking_events (userName);

create index IDX_TRA_02 on tracking_events (tagName);

create sequence hibernate_sequence
  INCREMENT BY 1
  MAXVALUE 9999999999999999999999999999
  START WITH 1
  NOCACHE
  NOORDER
  NOCYCLE;





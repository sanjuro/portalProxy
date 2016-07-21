-- changes from publishing
alter table items drop column workflow;
alter table items add lastPublicationTimestamp TIMESTAMP;
alter table items add hidden smallint default 0;
alter table items add publicationStatus nvarchar(255) default null;
alter table items add nextPublishAction nvarchar(255) default null;

-- add the uuid column
alter table items add uuid nvarchar(40);

-- add index on property name
create index IDX_PDN_01 on property_definition (name);

alter table items alter column itemHandlerBeanName drop not null;

REORG TABLE ITEMS;

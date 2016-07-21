-- changes from publishing
alter table items drop column workflow;
alter table items add lastPublicationTimestamp TIMESTAMP NULL DEFAULT NULL;
alter table items add hidden bit not null default 0;
alter table items add publicationStatus varchar(25) default null;
alter table items add nextPublishAction varchar(25) default null;

-- add the uuid column
alter table items add uuid varchar(40) null;

-- add index on property name
create index IDX_PDN_01 on property_definition (name);

alter table items modify itemHandlerBeanName varchar(255) null;
alter table items modify transformerBeanName varchar(255) null;

-- changes from publishing
alter table items drop column workflow;
alter table items add lastPublicationTimestamp TIMESTAMP;
alter table items add hidden number(1,0) default 0 not null;
alter table items add publicationStatus nvarchar2(25) default null;
alter table items add nextPublishAction nvarchar2(25) default null;

-- add the uuid column
alter table items add uuid nvarchar2(40);

-- add index on property name
CREATE index IDX_PDN_01 ON property_definition (name)
LOGGING
NOPARALLEL;

alter table items modify itemHandlerBeanName nvarchar2(255) null;

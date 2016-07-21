-- Datatype of sequence cannot be changed max value is 999999999
ALTER SEQUENCE hibernate_sequence
MAXVALUE 999999999
CACHE 1000
;

ALTER SEQUENCE ACL_ENTRY_SEQ
MAXVALUE 999999999999999999999999999
CACHE 100
;

ALTER SEQUENCE ACL_OBJECT_IDENTITY_SEQ
MAXVALUE 999999999999999999999999999
CACHE 100
;

alter table items drop column transformerBeanName;

alter table items add column manageable smallint;

alter table property_definition add column manageable smallint not null default 1;

alter table item_tags add column manageable smallint not null default 1;

REORG TABLE items;
REORG TABLE property_definition;
REORG TABLE item_tags;

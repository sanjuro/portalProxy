ALTER SEQUENCE hibernate_sequence
CACHE 1000
;

ALTER SEQUENCE ACL_ENTRY_SEQ
CACHE 100
;

ALTER SEQUENCE ACL_OBJECT_IDENTITY_SEQ
CACHE 100
;

ALTER SEQUENCE ACL_CLASS_SEQ
CACHE 20
;

ALTER SEQUENCE ACL_SID_SEQ
CACHE 20
;

alter table items drop column transformerBeanName;

alter table items add (manageable NUMBER(1, 0));

alter table property_definition add (manageable NUMBER(1, 0) DEFAULT 1  NOT NULL);

alter table item_tags add (manageable NUMBER(1, 0) DEFAULT 1  NOT NULL);
alter table items drop column transformerBeanName;

alter table items add manageable bit null;

alter table property_definition add manageable bit not null default 1;

alter table item_tags add manageable bit not null default 1;
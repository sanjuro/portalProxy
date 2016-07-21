alter table items drop column transformerBeanName;

alter table items add column manageable bit;

alter table property_definition add column manageable bit not null default 1;

alter table item_tags add column manageable bit not null default 1;

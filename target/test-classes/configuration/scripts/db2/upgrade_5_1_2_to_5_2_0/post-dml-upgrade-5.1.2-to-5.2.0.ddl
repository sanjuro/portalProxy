-- changes from publishing
alter table items alter column publicationStatus set not null;

-- set items.uuid a non-nullable field
alter table items alter column uuid set not null;

REORG TABLE ITEMS;

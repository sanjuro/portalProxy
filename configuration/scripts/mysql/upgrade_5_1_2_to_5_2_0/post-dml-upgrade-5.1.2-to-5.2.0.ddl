-- changes from publishing
alter table items modify publicationStatus varchar(25) not null;

-- set items.uuid a non-nullable field
alter table items modify uuid varchar(40) not null;
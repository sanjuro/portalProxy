-- changes from publishing
alter table items modify publicationStatus nvarchar2(25) not null;

-- set items.uuid as a non-nullable field
alter table items modify uuid nvarchar2(40) not null;
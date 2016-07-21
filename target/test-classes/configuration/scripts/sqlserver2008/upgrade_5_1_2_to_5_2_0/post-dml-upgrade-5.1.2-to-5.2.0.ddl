-- changes from publishing
alter table items
alter column publicationStatus nvarchar(25) not null
GO

alter table items
-- set items.uuid a non-nullable field
alter column uuid nvarchar(40) not null
GO

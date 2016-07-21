-- changes from publishing
alter table items drop column workflow
go
alter table items add lastPublicationTimestamp datetime null
go
alter table items add parentItemType nvarchar(255) null
go
alter table items add hidden bit not null default 0
go
alter table items add publicationStatus nvarchar(25) default null
go
alter table items add nextPublishAction nvarchar(25) default null
go


-- add the uuid column
alter table items add uuid nvarchar(40) null
GO

-- add index on property name
CREATE NONCLUSTERED INDEX IDX_PDN_01 on property_definition (name)
GO

alter table items
-- changes from publishing
alter column itemHandlerBeanName nvarchar(255) null
GO

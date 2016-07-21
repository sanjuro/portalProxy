ALTER TABLE items DROP FK5FDE7C09188310F;

ALTER TABLE items DROP FK5FDE7C0F5DE8687;

CREATE NONCLUSTERED INDEX IDX_ITE_02 ON items (template_id)
GO

CREATE NONCLUSTERED INDEX IDX_ITE_03 on items (userId, parentItemName, contextItemName)
GO

IF exists(SELECT
            1
          FROM sysobjects
          WHERE name = 'content_references')
  DROP TABLE content_references;
GO

ALTER TABLE items
ADD lockCounter SMALLINT NOT NULL DEFAULT 0
GO

UPDATE items
SET lockCounter=1
WHERE locked = 1
GO

DECLARE @table_name NVARCHAR(256)
DECLARE @col_name NVARCHAR(256)
DECLARE @Command NVARCHAR(1000)

SET @table_name = N'items'
SET @col_name = N'locked'

SELECT
  @Command = 'ALTER TABLE ' + @table_name + ' drop constraint ' + d.name
FROM sys.tables t
  JOIN sys.default_constraints d
    ON d.parent_object_id = t.object_id
  JOIN sys.columns c
    ON c.object_id = t.object_id
       AND c.column_id = d.parent_column_id
WHERE t.name = @table_name
      AND c.name = @col_name

EXECUTE (@Command)

ALTER TABLE items
DROP COLUMN locked
GO

CREATE VIEW name_value_pairs AS
  SELECT 'p' AS origin, prop.id AS id,
    prop.item_id, prop.name, prop.internalvalue AS value
  FROM property_definition prop, items it WHERE prop.item_id=it.id
   and prop.name not in ('TemplateName','SecuritySameAsParent','behaviors', 'bundleName', 'client-template')
  UNION
  SELECT 't' AS origin, ittg.id AS id,
         ittg.item_id AS item_id, 'Tag' AS name, tg.name AS value
  FROM tags tg, item_tags ittg, items it
  WHERE tg.id=ittg.tag_id AND ittg.item_id=it.id
GO
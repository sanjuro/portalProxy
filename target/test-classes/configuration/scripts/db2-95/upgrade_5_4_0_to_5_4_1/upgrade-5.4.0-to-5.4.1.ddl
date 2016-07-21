ALTER TABLE items
DROP FOREIGN KEY FK5FDE7C09188310F;

ALTER TABLE items
DROP FOREIGN KEY FK5FDE7C0F5DE8687;

CREATE INDEX IDX_ITE_02 ON items (template_id);
create index IDX_ITE_03 ON items (userId, parentItemName, contextItemName);

DROP TABLE content_references;

ALTER TABLE items
ADD COLUMN lockCounter SMALLINT NOT NULL DEFAULT 0;

REORG TABLE items;

UPDATE items
SET lockCounter = 1
WHERE locked = 1;

ALTER TABLE items
DROP COLUMN locked;

REORG TABLE items;

CREATE VIEW name_value_pairs AS
SELECT 'p' AS origin, prop.id AS id,
  prop.item_id, prop.name, prop.internalvalue AS value
FROM property_definition prop, items it WHERE prop.item_id=it.id
 and prop.name not in ('TemplateName','SecuritySameAsParent','behaviors', 'bundleName', 'client-template')
UNION
SELECT 't' AS origin, ittg.id AS id,
       ittg.item_id AS item_id, 'Tag' AS name, tg.name AS value
FROM tags tg, item_tags ittg, items it
WHERE tg.id=ittg.tag_id AND ittg.item_id=it.id;
ALTER TABLE items
DROP CONSTRAINT FK5FDE7C09188310F;

ALTER TABLE items
DROP CONSTRAINT FK5FDE7C0F5DE8687;

CREATE INDEX IDX_ITE_02 ON items (template_id)
LOGGING
NOPARALLEL;

CREATE INDEX IDX_ITE_03 ON items (userId, parentItemName, contextItemName)
LOGGING
NOPARALLEL;

DECLARE
    unique_key_not_exists EXCEPTION;
  PRAGMA EXCEPTION_INIT (unique_key_not_exists, - 02442);
BEGIN
  EXECUTE IMMEDIATE 'ALTER TABLE property_definition DROP UNIQUE (name, item_id)';
  EXCEPTION WHEN unique_key_not_exists THEN NULL;
END;
/

DECLARE
    index_not_exists EXCEPTION;
  PRAGMA EXCEPTION_INIT (index_not_exists, - 1418);
BEGIN
  EXECUTE IMMEDIATE 'drop index IDX_PROPERTY_DEF_NAME_ITEM_ID';
  EXCEPTION WHEN index_not_exists THEN NULL;
END;
/

CREATE UNIQUE INDEX IDX_PROPERTY_DEF_NAME_ITEM_ID ON property_definition (NAME, ITEM_ID) LOGGING NOPARALLEL;

BEGIN EXECUTE IMMEDIATE 'drop table content_references cascade constraints';
  EXCEPTION WHEN OTHERS THEN NULL;
END;
/

ALTER TABLE items
ADD (lockCounter SMALLINT DEFAULT 0 NOT NULL);

UPDATE items
SET lockCounter=1
WHERE locked = 1;

ALTER TABLE items
DROP COLUMN locked;

CREATE OR REPLACE VIEW name_value_pairs AS
  SELECT 'p' AS origin, prop.id AS id,
    prop.item_id, prop.name, prop.internalvalue AS value
  FROM property_definition prop, items it WHERE prop.item_id=it.id
   and prop.name not in ('TemplateName','SecuritySameAsParent','behaviors', 'bundleName', 'client-template')
  UNION
  SELECT 't' AS origin, ittg.id AS id,
         ittg.item_id AS item_id, N'Tag' AS name, tg.name AS value
  FROM tags tg, item_tags ittg, items it
  WHERE tg.id=ittg.tag_id AND ittg.item_id=it.id;

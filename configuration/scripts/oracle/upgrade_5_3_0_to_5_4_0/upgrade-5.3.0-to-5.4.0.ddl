-- Remove duplicates from property_definition table (if any)
DELETE FROM property_definition
WHERE id IN (
  SELECT
    t1.id
  FROM property_definition t1
    JOIN property_definition t2
      ON (t2.name = t1.name AND t2.item_id = t1.item_id AND t2.id > t1.id)
);
CREATE INDEX IDX_PROPERTY_DEF_NAME_ITEM_ID ON PROPERTY_DEFINITION
(NAME, ITEM_ID)
LOGGING
NOPARALLEL;

ALTER TABLE ACL_OBJECT_IDENTITY DROP CONSTRAINT FK_ACL_OBJ_ID_PARENT;

CREATE INDEX IDX_OBJ_01 ON ACL_OBJECT_IDENTITY(PARENT_OBJECT)
LOGGING
NOPARALLEL;

-- Remove duplicates from property_definition table (if any)
DELETE FROM property_definition
WHERE id in (
  SELECT t1.id
  FROM   property_definition t1
    JOIN   property_definition t2 ON (t2.name = t1.name AND t2.item_id = t1.item_id AND t2.id > t1.id)
);
CREATE UNIQUE INDEX idx_items_property_def_name_item_id ON property_definition (name, item_id);

ALTER TABLE ACL_OBJECT_IDENTITY DROP CONSTRAINT FK_ACL_OBJ_ID_PARENT;

CREATE INDEX IDX_OBJ_01 ON ACL_OBJECT_IDENTITY (PARENT_OBJECT);

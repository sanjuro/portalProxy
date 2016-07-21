-- Remove duplicates from property_definition table (if any)
DELETE FROM property_definition
WHERE id IN (
  SELECT
    t1.id
  FROM property_definition t1
    JOIN property_definition t2
      ON (t2.name = t1.name AND t2.item_id = t1.item_id AND t2.id > t1.id)
)
GO

CREATE UNIQUE NONCLUSTERED INDEX IDX_PROPERTY_DEFINITIONS_ITEM_ID_NAME ON property_definition(name, item_id)
GO

ALTER TABLE acl_object_identity DROP CONSTRAINT fk_acl_obj_id_parent
GO

CREATE INDEX IDX_OBJ_01 ON acl_object_identity (parent_object)
GO


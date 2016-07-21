-- Remove duplicates from property_definition table (if any)
DELETE t1
FROM property_definition t1
  JOIN property_definition t2
    ON (t2.name = t1.name AND t2.item_id = t1.item_id AND t2.id > t1.id);

ALTER TABLE property_definition ADD UNIQUE INDEX (name, item_id);

CREATE INDEX IDX_OBJ_01 ON acl_object_identity (parent_object);

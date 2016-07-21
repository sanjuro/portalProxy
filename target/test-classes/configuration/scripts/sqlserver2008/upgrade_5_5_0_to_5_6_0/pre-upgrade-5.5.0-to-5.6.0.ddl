ALTER TABLE items DROP COLUMN itemHandlerBeanName;
ALTER TABLE items DROP COLUMN parentItemType;
ALTER TABLE property_definition ALTER COLUMN internalValue NVARCHAR(2000) NULL;
ALTER TABLE user_property_definition ALTER COLUMN internalValue NVARCHAR(2000) NULL;
DROP VIEW name_value_pairs;
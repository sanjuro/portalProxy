ALTER TABLE items DROP COLUMN itemHandlerBeanName;
ALTER TABLE items DROP COLUMN parentItemType;
ALTER TABLE property_definition MODIFY internalValue NVARCHAR2(2000);
ALTER TABLE user_property_definition MODIFY internalValue NVARCHAR2(2000);
DROP VIEW NAME_VALUE_PAIRS;
-- Perform the pre dml migration

alter table property_definition alter column internalValue set data type nvarchar(756);

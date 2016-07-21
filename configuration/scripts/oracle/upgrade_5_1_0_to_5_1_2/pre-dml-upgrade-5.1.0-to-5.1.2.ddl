/* Perform the pre dml migration */

alter table property_definition modify internalValue nvarchar2(756);

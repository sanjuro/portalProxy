/* Perform the pre dml migration */

alter table property_definition alter column internalValue nvarchar(756) null;

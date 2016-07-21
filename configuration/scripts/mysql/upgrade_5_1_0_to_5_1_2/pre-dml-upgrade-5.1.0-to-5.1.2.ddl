/* Perform the pre dml migration */

alter table property_definition modify column internalValue varchar(756);

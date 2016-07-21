-- Migrate all columns that contain an item name to size 150
-- tags.contextItemName
-- items.name
-- items.contextItemName
-- items.parentItemName
-- deleted_page_item.itemName

-- First drop some constraints and indexes that use these columns
alter table items drop constraint UQ_ITM_01;

drop INDEX IDX_ITEMS_PARENTITEMNAME on items;

alter table tags alter column contextItemName nvarchar(150);

alter table items alter column name nvarchar(150);

alter table items alter column contextItemName nvarchar(150);

alter table items alter column parentItemName nvarchar(150);

alter table deleted_page_item alter column itemName nvarchar(150);

-- Create the indexes and constraints again
alter table items add constraint UQ_ITM_01 unique(name, contextItemName);

alter table users add lastLoggedIn datetime;

CREATE NONCLUSTERED INDEX IDX_ITEMS_PARENTITEMNAME on items(parentItemName);

CREATE UNIQUE NONCLUSTERED index IDX_USER_USERNAME on users (username);


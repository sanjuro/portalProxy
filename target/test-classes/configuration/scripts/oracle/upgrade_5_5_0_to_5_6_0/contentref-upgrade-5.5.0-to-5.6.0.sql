-- first this script should be run on content db
-- if content services db schema isn't migrated - use OBJECTDATAPATH instead of PATH
--SELECT concat(concat(concat(concat(concat('INSERT INTO cs_temp(path, objectId) VALUES (''', EDCT5514.OBJECT_DATA.PATH),
-- ''''), ', '''), EDCT5514.OBJECT_DATA.OBJECTID), ''');') FROM EDCT5514.OBJECT_DATA where isLatestVersion = 'true';

create table cs_temp (
  path nvarchar2(250),
  objectId nvarchar2(40)
);

-- scripts, created using the first script should be run for the portal db

update property_definition set internalValue = concat('cs:contentRepository:', (
  select objectId from cs_temp cs where cs.path = property_definition.internalValue
))
where type='contentRef' and internalValue is not NULL;

drop table cs_temp;
-- first this script should be run on content db
-- if content services db schema isn't migrated - use OBJECTDATAPATH instead of PATH
-- select concat(concat('insert into cs_temp (path,objectId) values (''',DB2INST.OBJECT_DATA.PATH),
-- concat(concat(''',''',DB2INST.OBJECT_DATA.OBJECTID), ''');')) from DB2INST.OBJECT_DATA where isLatestVersion = 'true';

create table cs_temp (
  path nvarchar(250),
  objectId nvarchar(40)
);

-- scripts, created using the first script should be run for the portal db

update property_definition set internalValue = concat('cs:contentRepository:', (
  select objectId from cs_temp cs where cs.path = property_definition.internalValue
))
where type='contentRef' and internalValue <> '';

drop table cs_temp;
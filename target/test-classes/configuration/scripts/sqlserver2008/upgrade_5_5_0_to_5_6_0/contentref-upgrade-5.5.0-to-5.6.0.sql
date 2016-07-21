-- first this script should be run on content db
-- if content services db schema isn't migrated - use objectDataPath instead of path
-- select ('insert into cs_temp (path,objectId) values (N''' + path + ''', ''' + objectId + ''');') from OBJECT_DATA
-- where isLatestVersion = 'true';

create table cs_temp (
  path nvarchar(250),
  objectId nvarchar(40)
);

-- scripts, created using the first script should be run for the portal db

update property_definition set internalValue = ('cs:contentRepository:' +
(select objectId from cs_temp cs where cs.path = property_definition.internalValue)) where type='contentRef';

drop table cs_temp;
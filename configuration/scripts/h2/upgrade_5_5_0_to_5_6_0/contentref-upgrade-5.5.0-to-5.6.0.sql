-- first this script should be run on content db
-- if content services schema isn't updated - change path to objectDataPath
-- select concat('insert into cs_temp (path,objectId) values (''',path,''',''',objectId,''');')
-- from OBJECT_DATA where isLatestVersion = 'true';

create table cs_temp (
  path varchar(250),
  objectId varchar(40)
);

-- scripts, created using the first script should be run for the portal db

update property_definition set internalValue = concat('cs:contentRepository:', (
  select objectId from cs_temp cs where cs.path = property_definition.internalValue
))
where type='contentRef' and internalValue <> '';

drop table cs_temp;
This document is meant for setting up the Oracle database.


Preconditions:
- To be able to perform the installation you should have some basic knowledge of Oracle database administration.
- Make sure that the Oracle server/database is running.


Installation:
The installations steps are performed with the SQLPlus command line tool. Use sqlplus user/password@database to connect to the database.
- Login as system and create a schema/user.
- Login to the schema you would like to run the scripts in.
- Run script schema.ddl to create the database objects.
  (To run from within sqlplus make sure your in the same directory as the script are and type @schema.ddl)
- Run script default-foundation-data-blank.sql to populate the database with the minimal set of data.


Reinstallation:
To reinstall the database perform the following steps.
- Login to the schema.
- Run script drop_schema.sql.
- Run script schema.ddl.
- Run script default-foundation-data-blank.sql.

This document is meant for setting up the  SQLServer-2008-R2 database.


Preconditions:
- To be able to perform the installation you should have some basic knowledge of SQLServer-2008-R2 database administration.

To work with Backbase Portal Foundation:
- the database should run in isolation level READ COMMITTED SNAPSHOT.
  This can be accomplished by running the following statements after database creation:
  ALTER DATABASE DatabaseName SET READ_COMMITTED_SNAPSHOT ON
  ALTER DATABASE DatabaseName SET ALLOW_SNAPSHOT_ISOLATION ON
- the database needs to be configured to support UTF-8 character encoding

Installation:
The following installations steps are performed with Microsoft SQL Server Management studio (as sa).
- Create a database.
- Create a schema.
- Create a login.
  In the login properties:
  - Set the default database of this login.
  - Set the default schema of this login.
  - Make this login dbowner for this database.
The following installations steps are performed with Microsoft SQL Server Management studio with the newly created login.
- Run script schema.ddl to create the database objects.
- Run script default-foundation-data-blank.sql to populate the database with the minimal set of data.


Reinstallation:
To reinstall the database perform the following steps.
The installations steps are performed with Microsoft SQL Server Management studio with the newly created login.
- Run script drop_schema.sql.
- Run script schema.ddl.
- Run script default-foundation-data-blank.sql.

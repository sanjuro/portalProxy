Follow these steps to set up the IBM DB2 database.


Preconditions:
- some basic knowledge of IBM DB2 database administration.


Installation

Follow these steps with the IBM DB2 Configuration assistant and Control Center:

- Create a "Standard" database.
  Set the default bufferpool and table space page size to the maximum available (Ex:32K).
  In the region/locale setup, select UTF-8.

- Create a schema named, for example, portalfoundation.

- Create a user:
  Create a new account on the operating system and assign it a password.
  In the Control Center, add a new user by selecting the operating system account you just created.
  Give this user sufficient rights on the database.
  Add the schema created in the previous step to this user and grant all rights on that schema.

Follow these steps with the DB2 command line tool:

- Connect to the database:
  $ db2 connect to [database] user [username] using [password]

- Run the schema.ddl script to create the database objects:
  $ db2 -tvf schema.ddl

- Run the  default-foundation-data-blank.sql script to populate the database:
  $ db2 -tvf default-foundation-data-blank.sql


Reinstallation

Follow these steps to drop the database tables:

- Connect to the database:
  $ db2 connect to [database] user [username] using [password]

- Run the drop_schema.sql script:
  $ db2 -tvf drop_schema.sql



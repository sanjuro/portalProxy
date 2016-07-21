This document is meant for setting up the MySQL database using the NDB Cluster storage engine.

Preconditions:

- To be able to perform the installation you should have some basic knowledge of MySQL database administration.

To work with Backbase Portal Foundation:

- the NDB Cluster Storage Engine is required
- the database should run in isolation level READ-COMMITTED.
- the database needs to be configured to support UTF-8 character encoding

- In the MySQL configuration file, set transaction-isolation to READ-COMMITTED.
- In the MySQL configuration file, make sure default-storage-engine is set to NDBCLUSTER.
- Enable the database to support UTF-8 by adding the following to the [mysql] section of the MySQL configuration file
  (replacing the default-character-set property if it is already defined):
    init_connect='SET collation_connection = utf8_general_ci'
    init_connect='SET NAMES utf8'
    default-character-set=utf8
    character-set-server=utf8
    collation-server=utf8_general_ci
    skip-character-set-client-handshake

- Make sure that the MySQL server is running.

Installation:

The installations steps are performed with MySQL Workbench but can be done with any other MySQL tool you like.

- Create a schema.
  (character set utf8 and collate utf8_general_ci)
- Create a user and give this user rights on this schema.
- Select the schema you would like to run the scripts in.
- Run script schema.ddl to create the database objects.
- Run script default-foundation-data-blank.sql to populate the database with the minimal set of data.

Reinstallation:
To reinstall the database perform the following steps.
- Select the schema you would like to run the scripts in.
- Run script drop_schema.sql.
- Run script schema.ddl.
- Run script default-foundation-data-blank.sql.

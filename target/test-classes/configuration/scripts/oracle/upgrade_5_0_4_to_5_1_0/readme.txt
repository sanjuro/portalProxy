The database migration from 5.0.4 to 5.1.0 involves running the following steps in the order mentioned:

1. Create a backup of the database.

Run these steps before the new Portal Web Application has been deployed!
2. Run pre-dml-upgrade-5.0.4-to-5.1.0.ddl
3. Run upgrade-5.0.4-to-5.1.dml

If steps 2 or 3 fail contact Backbase Support.
If you need to rollback the migration install the database backup.

Run this step after the new Portal Web Application has been deployed!
4. Run post-dml-upgrade-5.0.4-to-5.1.0.ddl


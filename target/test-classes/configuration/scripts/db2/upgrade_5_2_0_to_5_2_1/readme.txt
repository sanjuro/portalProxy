The database migration from 5.2.0 to 5.2.1 involves running the following steps in the order mentioned:

1. Create a backup of the database.

Run these steps before the new Portal Web Application has been deployed!
2. Run pre-dml-upgrade-5.2.0-to-5.2.1.ddl
Skip step 3 if you have already created the sys2sys user in the 5.2.0 release.
3. Run add_sys2sys.dml
4. Run upgrade-5.2.0-to-5.2.1.dml

If steps 2 to 4 fail contact Backbase Support.
If you need to rollback the migration install the database backup.

Run this step after the new Portal Web Application has been deployed!
5. Run post-dml-upgrade-5.2.0-to-5.2.1.ddl

ALTER TABLE USERS ALTER COLUMN username SET NOT NULL;
alter table users add lastLoggedIn timestamp;

REORG TABLE USERS;

create unique index IDX_USER_USERNAME on users (username);


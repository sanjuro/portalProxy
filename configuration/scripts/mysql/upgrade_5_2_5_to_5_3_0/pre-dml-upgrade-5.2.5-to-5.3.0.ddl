alter table users add lastLoggedIn TIMESTAMP NULL DEFAULT NULL;
create unique index IDX_USER_USERNAME on users (username);
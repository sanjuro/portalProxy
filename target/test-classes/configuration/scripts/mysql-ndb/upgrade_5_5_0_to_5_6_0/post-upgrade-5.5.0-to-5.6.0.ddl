-- changes column collate to latin1_general_ci
alter table tags change name name varchar(150) character set latin1 collate latin1_general_ci not null; 
create unique index IDX_TAG_NAME_CTX_TYPE on tags (name, contextItemName, type);
begin execute immediate 'drop trigger ACL_ENTRY_ID'; exception when others then null; end;
/
begin execute immediate 'drop trigger ACL_OBJECT_IDENTITY_ID'; exception when others then null; end;
/
begin execute immediate 'drop trigger ACL_SID_ID'; exception when others then null; end;
/
begin execute immediate 'drop trigger ACL_CLASS_ID'; exception when others then null; end;
/
begin execute immediate 'drop sequence ACL_CLASS_SEQ'; exception when others then null; end;
/
begin execute immediate 'drop sequence ACL_ENTRY_SEQ'; exception when others then null; end;
/
begin execute immediate 'drop sequence ACL_OBJECT_IDENTITY_SEQ'; exception when others then null; end;
/
begin execute immediate 'drop sequence ACL_SID_SEQ'; exception when others then null; end;
/
begin execute immediate 'drop table ACL_ENTRY'; exception when others then null; end;
/
begin execute immediate 'drop table ACL_OBJECT_IDENTITY'; exception when others then null; end;
/
begin execute immediate 'drop table ACL_SID'; exception when others then null; end;
/
begin execute immediate 'drop table ACL_CLASS'; exception when others then null; end;
/
begin execute immediate 'drop table user_property_definition cascade constraints'; exception when others then null; end;
/
begin execute immediate 'drop table property_definition cascade constraints'; exception when others then null; end;
/
begin execute immediate 'drop table content_references cascade constraints'; exception when others then null; end;
/
begin execute immediate 'drop table item_tags cascade constraints'; exception when others then null; end;
/
begin execute immediate 'drop table tags cascade constraints'; exception when others then null; end;
/
begin execute immediate 'drop table items cascade constraints'; exception when others then null; end;
/
begin execute immediate 'drop table users_groups cascade constraints'; exception when others then null; end;
/
begin execute immediate 'drop table users cascade constraints'; exception when others then null; end;
/
begin execute immediate 'drop table groups cascade constraints'; exception when others then null; end;
/
begin execute immediate 'drop table deleted_page_item cascade constraints'; exception when others then null; end;
/
begin execute immediate 'drop sequence hibernate_sequence'; exception when others then null; end;
/

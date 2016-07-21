if exists (select 1 from sysobjects where name='audit_events')
    drop table audit_events;
GO
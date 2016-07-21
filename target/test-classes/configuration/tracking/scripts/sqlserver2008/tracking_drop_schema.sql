if exists (select 1 from sysobjects where name='tracking_events')
    drop table tracking_events;
GO
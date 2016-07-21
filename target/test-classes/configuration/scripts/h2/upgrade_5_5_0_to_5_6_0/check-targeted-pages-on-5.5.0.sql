-- Please be sure that you run this script over Portal DB v5.5.x;

select (case
          when
            (select count(*) from items i1 join items i2 on i1.name=i2.parentitemname where i2.name like 'TargetingContainer%') > 0
          then (select 'Important! We have found at least 1 (or more) Targeted Page(s) in your DB which are no longer supported in v5.6. Please convert them into Page type and then proceed with migration.')
          else (select 'Everything is OK, you can proceed migration.')
        end)
as message
limit 1;
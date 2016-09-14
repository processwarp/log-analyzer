create table log_node (
  "log_id"      serial  primary key,
  "tag"         text    not null,
  "time"        timestamp with time zone not null,
  "record"      json    not null
);

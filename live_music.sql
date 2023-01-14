create table message
(
    `read`   tinyint default 0 null,
    msg      mediumtext        null,
    username mediumtext        null,
    id       int auto_increment,
    constraint message_id_uindex
        unique (id)
);

alter table message
    add primary key (id);

create table urls
(
    id          int auto_increment
        primary key,
    session_key varchar(50) not null,
    lyric_url   varchar(30) not null,
    music_url   varchar(30) not null
);

create table users_data
(
    console_info  mediumtext                 null,
    play          tinyint       default 1    null,
    lyric_name    mediumtext                 null,
    replay        tinyint       default 0    null,
    user_set      text                       null,
    who_play      tinyint       default 0    null,
    now_music_url varchar(1000)              null,
    music_name    varchar(9000) default '[]' null,
    username      varchar(20)                not null,
    id            int auto_increment
        primary key
)
    charset = utf8mb4;

create table users_info
(
    id         int auto_increment
        primary key,
    username   varchar(45)                 not null,
    password   varchar(45)                 not null,
    is_admin   tinyint     default 0       null,
    music_url  varchar(30)                 null,
    lyric_url  varchar(30)                 null,
    is_running varchar(6)  default '0'     null,
    room_id    varchar(12) default '#####' null
);


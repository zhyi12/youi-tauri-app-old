CREATE TABLE IF NOT EXISTS youi_desktop_config
(
    id    INTEGER      not null
        primary key autoincrement,
    name  VARCHAR(100) not null,
    value VARCHAR(200) not null
);

CREATE TABLE IF NOT EXISTS youi_area
(
    area_id    VARCHAR(12)  not null
        primary key,
    pid  VARCHAR(12) not null,
    caption VARCHAR(200) not null
);

CREATE TABLE IF NOT EXISTS youi_area_geo_json
(
    area_id    VARCHAR(12)  not null
        primary key,
    geo_json TEXT,
    version VARCHAR(12) not null
);

CREATE TABLE IF NOT EXISTS youi_dmp_database (
  id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(200) NOT NULL,
  caption VARCHAR(200) NOT NULL
);

CREATE TABLE IF NOT EXISTS youi_dmp_table (
  id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(200) NOT NULL,
  table_name VARCHAR(200) NOT NULL,
  caption VARCHAR(200) NOT NULL
);

CREATE TABLE IF NOT EXISTS youi_dmp_folder (
  id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(200) NOT NULL,
  pid INTEGER NOT NULL,
  caption VARCHAR(200) NOT NULL
);

create table IF NOT EXISTS  youi_dmp_custom_query
(
	id INTEGER not null
		primary key autoincrement,
	name VARCHAR(200) not null,
	query_app VARCHAR(200) not null,
	query_module VARCHAR(200) not null,
	query_group VARCHAR(20) not null,
	query_path VARCHAR(500) not null,
	caption VARCHAR(200) not null,
	content text
);
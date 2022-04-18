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

create table IF NOT EXISTS  youi_dmp_custom_ds
(
	id INTEGER not null
		primary key autoincrement,
	name VARCHAR(200) not null,
	caption VARCHAR(200) not null,
	content text
);
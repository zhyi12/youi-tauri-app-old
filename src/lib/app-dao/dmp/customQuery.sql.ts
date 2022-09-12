const TABLE_NAME = 'youi_dmp_custom_query';

export const FIND_BY_GROUP_SQL = `select id,name,caption,query_app,query_group,folder_path from ${TABLE_NAME} where query_group=$1 order by folder_path`;

/**
 *
 */
export const FIND_CONTENT_SQL = `select content from ${TABLE_NAME} where id = $1`;
/**
 * 插入数据
 */
export const INSERT_SQL = `insert into ${TABLE_NAME}(name,caption,query_app,query_group,folder_path,content) values ($1,$2,$3,$4,$5,$6)`;

/**
 * 更新查询
 */
export const UPDATE_CONTENT = `update ${TABLE_NAME} set content=$2 where id=$1`;
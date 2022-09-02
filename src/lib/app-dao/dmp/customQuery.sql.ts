const TABLE_NAME = 'youi_dmp_custom_query';

export const FIND_BY_GROUP_SQL = `select id,name,caption,query_app,query_module,query_group,query_path from ${TABLE_NAME} where query_group=$1 order by query_path`;
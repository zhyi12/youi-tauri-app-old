const TABLE_NAME = 'youi_area';
const TABLE_GEO_JSON = 'youi_area_geo_json';
const TABLE_GEO_BUILDING = 'stats_area_geo_building';

/**
 *
 */
export const SQL_AREA_SELECT = `select area_id,pid,caption from ${TABLE_NAME}`;

/**
 *
 */
export const SQL_AREA_FILTER = `select area_id,pid,caption from ${TABLE_NAME} where area_id like $1 and area_id like $2 order by area_id`;

/**
 * 主键查询
 */
export const SQL_AREA_GET = `select area_id,pid,caption from ${TABLE_NAME} where area_id=$1`;
/**
 * 查找直接下级行政区划集合
 */
export const SQL_AREA_FIND_BY_PARENT = `select area_id,pid,caption from ${TABLE_NAME} where pid=$1`;

/**
 * 查找市、县树
 */
export const SQL_CITY_AREA_TREE = `select area_id,pid,caption from ${TABLE_NAME} where area_id=$1 or (area_id like '$2%' and area_id like '%000000')`;


/**
 * 区域图层
 */
export const SQL_AREA_FIND_GEO_JSON = `select geo_json from ${TABLE_GEO_JSON} where area_id=$1 order by version desc limit 1`;

/**
 *
 */
export const SQL_AREA_INSERT_GEO_JON = `insert into ${TABLE_GEO_JSON}(area_id,geo_json,version) values($1,$3,$2)`;
/**
 *
 */
export const SQL_AREA_UPDATE_GEO_JON = `update ${TABLE_GEO_JSON} set geo_json=$3,version=$2 where area_id=$1`;
/**
 * 建筑物图层
 */
export const SQL_AREA_FIND_GEO_BUILDING = `select geo_json from ${TABLE_GEO_BUILDING} where area_id=$1`;
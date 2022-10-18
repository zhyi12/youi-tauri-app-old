const TABLE_NAME = 'youi_schedule';

/**
 *
 */
export const FIND_SCHEDULE_SQL = `select id,text,all_day,start_time,end_time,color from ${TABLE_NAME} where id = $1`;

export const FIND_PERIOD_SCHEDULE_SQL = `select id,text,all_day,start_time,end_time,color from ${TABLE_NAME} where `
        + `(start_time<=$1 and end_time>=$1) or (end_time<=$2 and end_time>=$2)`
        + ` or (start_time>=$1 and end_time<=$2) or (start_time<=$1 and end_time>=$1)`;

/**
 * 新增任务
 */
export const ADD_SCHEDULE_SQL = `insert into ${TABLE_NAME}(id,text,all_day,start_time,end_time,color) values ($1,$2,$3,$4,$5,$6)`;
/**
 * 更新任务
 */
export const UPDATE_SCHEDULE_SQL = `update ${TABLE_NAME} set text=$2,all_day=$3,start_time=$4,end_time=$5,color=$6 where id= $1`;
/**
 * 删除任务
 */
export const REMOVE_SCHEDULE_SQL = `delete from ${TABLE_NAME} where id = $1`;

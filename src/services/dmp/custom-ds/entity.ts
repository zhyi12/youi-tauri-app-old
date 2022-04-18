export type CustomDs = {
    id:number,
    name: string,
    caption: string,
    content?: string
};

const TABLE_NAME = 'youi_dmp_custom_ds';

export const SQL_CUSTOM_DS_SELECT_ALL = `select id,name,caption from ${TABLE_NAME}`;
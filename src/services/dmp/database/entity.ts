
export type DmpDb = {
    id:number;
    name: string;
    caption: string;
};

export const SQL_SELECT_ALL = "select id,name,caption from youi_dmp_database";
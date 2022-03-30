import type {Writable} from "svelte/store";

export interface PagerRecordsStore<T> extends Writable<PagerRecords<T>>{
    /**
     *
     * @param value
     */
    deleteRecord( record: T,src?:string): void;
    addRecord(record: T): void;
    updateRecord(record: T):void;
}

export type PagerRecords<T> = {
    totalCount:number,
    records:Array<T>
}
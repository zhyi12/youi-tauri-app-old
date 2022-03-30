import { Writable, writable } from 'svelte/store';
import type { PagerRecords, PagerRecordsStore } from '../types/PagerRecords';

/**
 * 分页数据存储对象
 * @param value
 * @param start
 * @param options
 */
export function buildPagerRecordsStore(value: PagerRecords<any>, options): PagerRecordsStore<any> {
	options = Object.assign({}, options, {
		idAttr: 'id'
	});

	const store:Writable<any> = writable(value);

	/**
	 *
	 * @param record
	 */
	async function deleteRecord(record: any,src?:string) {
		// if(src){
		// 	//await api(src,options.idAttr +'='+ record[options.idAttr]);
		// }
		store.update(pagerRecords => {
			pagerRecords.records = pagerRecords.records.filter((t) => t[options.idAttr] !== record[options.idAttr]);
			return pagerRecords;
		});
	}

	/**
	 *
	 * @param record
	 */
	function updateRecord(record: any) {
		store.update(pagerRecords => {
			const editing = pagerRecords.records.filter(t => t[options.idAttr] == record[options.idAttr]);
			if(editing.length){
				Object.assign(editing[0],record);
			}
			return pagerRecords;
		});
	}

	/**
	 *
	 * @param record
	 */
	function addRecord(record) {
		store.update(pagerRecords => {
			pagerRecords.records.push(record);
			return pagerRecords;
		});
	}

	return {
		deleteRecord,
		updateRecord,
		addRecord,
		...store
	}
}
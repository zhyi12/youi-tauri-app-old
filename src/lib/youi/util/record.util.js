/**
 *
 * @param str
 * @param record
 * @param skipEncode
 * @returns {*}
 */
import {isNull} from "./utils";

export function replaceByRecord(str,record,skipEncode){
    if(typeof(record)==='object'){
        for(let prop in record){
            let value = record[prop];
            if(isNull(value)){
                value = '';
            }
            str = str.replace(new RegExp("\\{" + prop + "\\}", "g"),skipEncode?value:encodeURIComponent(value));
        }
    }
    str = str.replace(new RegExp("\\{.*\\}", "g"), '');
    return str;
}
export const replaceItem = (items,itemId,newItem)=>{

    if(items.length){
        let index = items.map((curItem,index)=>curItem.id==itemId?index:0).reduce((total, value)=>total+=value);
        items.splice(index,1,newItem);
    }

    return items;
}

/**
 *
 * @param items
 * @param item
 */
export const findItemIndex = (items,item)=>{
    if(!items || items.filter(({id})=> id == item.id).length==0){
        console.log('not find')
        return -1;
    }
    return items.map(({id},index)=>id === item.id?index:0).reduce((t,v)=>t+v);
}
/**
 *
 * @param s1
 * @param s2
 * @returns {false}
 */
export const isSame = (s1,s2)=>{
    return s1.length===s2.length&&s1.every(a=>s2.some(b=>a===b))&&s2.every(_b=>s1.some(_a=>_a===_b));
}
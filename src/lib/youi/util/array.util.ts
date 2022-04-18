export const replaceItem = (items,itemId,newItem)=>{

    if(items.length){
        let index = items.map((curItem,index)=>curItem.id==itemId?index:0).reduce((total, value)=>total+=value);
        items.splice(index,1,newItem);
    }

    return items;
}
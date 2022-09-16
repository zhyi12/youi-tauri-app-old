
import type {CrossItem, Dimension, Item} from "./DataCube";

/**
 *
 * @param dimensions
 */
export function expandDimensionsItem(dimensions:Dimension<any>[]){
    const crossItems:CrossItem[] = [],headerItems:Item[]=[],
        dimensionCount = dimensions.length,
        spansList:number[] = [];
    let columns = 1,spans = 1;


    //计算占位
    for(let i = dimensions.length; i > 0; i--) {
        if (i < dimensions.length) {
            spans = spans * (dimensions[i].items.length);
        }
        spansList.push(spans);
        columns = columns * dimensions[i - 1].items.length;
    }

    dimensions.forEach((dimension,index)=>{
        for (let i = 0; i < columns; i++) {
            const spans = spansList[dimensionCount - index - 1],
                itemIndex = Math.floor(i / spans) % dimension.items.length,
                item = dimension.items[itemIndex];

            crossItems[i] = crossItems[i]||({items:headerItems.map(item=>({...item}))});
            crossItems[i].items.push({
                ...item,
                dimId: dimension.id,
                spans:spans,
                first:i%spans === 0,
                itemCount:dimension.items.length});
        }
    });
    return crossItems;
}
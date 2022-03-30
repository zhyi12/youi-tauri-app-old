/**
 *
 * @param dom
 * @param tagName
 */
export function findClosestTag(dom,tagName):HTMLElement{
    let parent:HTMLElement = dom;
    while (parent){
        if(parent.tagName && parent.tagName.toUpperCase()===tagName.toUpperCase()){
            return parent;
        }
        parent = parent.parentNode as HTMLElement;
    }

    return parent;
}
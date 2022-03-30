import Konva from 'konva';

/**
 *
 * @param parent
 * @param name
 * @param options
 */
export function appendKonvaElement(parent,name,options){
	const element = new Konva[name](options);
	parent.add(element);
	return element;
}
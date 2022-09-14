import Konva from 'konva';

Konva.showWarnings = false;

export const EVENTS = ["click","dblclick","dragstart","dragmove","dragend","mousedown","mousemove","mouseup","mouseenter", "mouseleave","wheel"];
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
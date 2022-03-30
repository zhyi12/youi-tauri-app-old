/**
 *
 * @param children
 * @param onlyLeaf 仅叶子节点
 * @param childrenKey
 */
export function traverse(children,onlyLeaf=false,childrenKey = 'children',level=1){
	let nodes = [];
	children.forEach((node) => {
		const nodeChildren = node[childrenKey];

		const isLeaf = !nodeChildren || !nodeChildren.length;

		Object.assign(node,{level:level,leaf:isLeaf});

		if(!onlyLeaf || (onlyLeaf &&isLeaf )){
			nodes.push(node);
		}

		if (Array.isArray(nodeChildren)) {
			nodes = [...nodes, ...traverse(nodeChildren,onlyLeaf,childrenKey,level+1)];
		}
	});
	return nodes;
}

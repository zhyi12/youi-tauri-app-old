/**
 * Computes the depth of a tree leaf node relative to <ul role="tree" />
 * @param {HTMLLIElement} node
 * @returns {number} depth
 */
export function computeTreeLeafDepth(node:HTMLElement) {
	let depth = 0;

	if (node == null) return depth;

	let parentNode:HTMLElement|null = node.parentElement;

	while (parentNode != null && parentNode.getAttribute("role") !== "tree") {
		parentNode = parentNode.parentElement;
		if (parentNode && parentNode.tagName === "LI") depth++;
	}

	return depth;
}

/**
 *
 * @param items
 * @param id
 */
export function findTreeNode(children:TreeNode[],nodeId:string):TreeNode|null{
	for(let i=0;i<children.length;i++){
		const item:TreeNode = children[i];
		if(item.id == nodeId){
			return item;
		}else if(Array.isArray(item.children)){
			const next_item = findTreeNode(item.children,nodeId);
			if(next_item){
				return next_item;
			}
		}
	}
	return null;
}

export function findParentNode(node:TreeNode,childNodeId:string):TreeNode|null{
	if(node.children && node.children.length){
		if(node.children.filter(({id})=>id == childNodeId).length){
			return node;
		}else{
			for(let i=0;i<node.children.length;i++){
				const parent:TreeNode|null = findParentNode(node.children[i],childNodeId);
				if(parent){
					return parent;
				}
			}
		}
	}
	return null;
}

export function removeTreeNode(children:TreeNode[],nodeId:string,parentNode:TreeNode):TreeNode|null{
	for(let i=0;i<children.length;i++){
		const item:TreeNode = children[i];
		if(item.id == nodeId){
			children.splice(i,1);
			return parentNode;
		}else if(Array.isArray(item.children)){
			return removeTreeNode(item.children,nodeId,item);
		}
	}
	return null;
}

/**
 *
 * @param children
 * @param onlyLeaf 仅叶子节点
 * @param childrenKey
 */
export function traverse(children:TreeNode[],onlyLeaf=false,childrenKey = 'children',level=1){
	let nodes:TreeNode[] = [];
	children.forEach((node) => {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
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

/**
 * ac
 * ac/data.csv
 * ac/data1.csv
 * bc
 * bc/data1.csv
 * bc/data2.csv
 * @param paths
 * @param prefix
 */
export function buildPathTree(paths:string[],prefix='',pathDataMap:Record<string, any>){
	const children:TreeNode[] = [];

	const root:TreeNode = {id:'root',text:'root',children:children};

	const pathNodeMap = new Map();

	paths.forEach((path:string,index)=>{
		const splits:string[] = path.split("/");
		const node:TreeNode = {id:'node_'+index,text:splits[splits.length-1],children:[],
			datas:{path:path}};
		if(pathDataMap[path]){
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			Object.assign(node.datas,pathDataMap[path]);
			if(node.datas){
				node.href = node.datas.href;
				node.icon =  node.datas.icon;
				if(node.datas.html){
					node.text = '';
					node.html = node.datas.html;
				}
			}
		}

		let parent = root;
		if(splits.length>2){
			const parentPath = splits.slice(0,splits.length-1).join('/');
			parent = pathNodeMap.get(parentPath);
		}
		if(parent.children){
			parent.children.push(node);
		}

		pathNodeMap.set(path,node);
	});

	return children;
}

type TreeNode = {
	id:string,
	text:string,
	html?:string,
	children?:TreeNode[],
	icon?:string,
	href?:string,
	datas?:Record<string, any>
}


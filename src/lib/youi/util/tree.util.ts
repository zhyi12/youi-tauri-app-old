/**
 * Computes the depth of a tree leaf node relative to <ul role="tree" />
 * @param {HTMLLIElement} node
 * @returns {number} depth
 */
export function computeTreeLeafDepth(node) {
	let depth = 0;

	if (node == null) return depth;

	let parentNode = node.parentNode;

	while (parentNode != null && parentNode.getAttribute("role") !== "tree") {
		parentNode = parentNode.parentNode;
		if (parentNode.tagName === "LI") depth++;
	}

	return depth;
}

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
export function buildPathTree(paths,prefix=''){
	let children = [];

	let root:TreeNode = {id:'root',text:'root',children:children};

	let pathNodeMap = new Map();

	paths.forEach((path:String,index)=>{
		let splits = path.split("/");
		let node = {id:'node_'+index,text:splits[splits.length-1],children:[],datas:{path:path}};
		let parent = root;
		if(splits.length>2){
			let parentPath = splits.slice(0,splits.length-1).join('/');
			parent = pathNodeMap.get(parentPath);
		}
		parent.children.push(node);
		pathNodeMap.set(path,node);
	});

	return children;
}

type TreeNode = {
	id:string,
	text:string,
	children:TreeNode[]
}


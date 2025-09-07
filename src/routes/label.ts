import type Graph from "graphology";

export const getLabel = (graph: Graph, node: string) => {
	const label = graph.getNodeAttribute(node, 'label') as string;
	return label.replaceAll('_', ' ')
}
<script lang="ts">
	import FileSelector from './FileSelector.svelte';
	import { file } from '$lib/store';
	import Graph from 'graphology';
	import circular from 'graphology-layout/circular';
	import forceAtlas2 from 'graphology-layout-forceatlas2';
	import { onMount } from 'svelte';
	import type { EdgeDisplayData, NodeDisplayData } from 'sigma/types';
	import Sigma from 'sigma';
	import NodeDetailedMenu from './NodeDetailedMenu.svelte';
	import type { Attachment } from 'svelte/attachments';

	interface OutDegrees {
		percent: number;
		node: string;
	}

	let showModal = $state(true);
	let container = $state<HTMLElement>();
	let hoveredNode: string | undefined;
	let hoveredNeibors: Set<string> | undefined;
	let selectedNode = $state<string | undefined>(undefined);
	let graph = $state<Graph>(new Graph());
	let isNodeMenuOpen = $state(false);
	let renderer = $state<Sigma>();

	const setHoveredNode = (renderer: Sigma, graph: Graph, node?: string) => {
		if (typeof node === 'undefined') {
			hoveredNode = undefined;
			hoveredNeibors = undefined;
		} else {
			hoveredNode = node;
			hoveredNeibors = new Set(graph.neighbors(node));
		}

		renderer.refresh();
	};
	const initializeSigma: Attachment = (container) => {
		renderer = new Sigma(graph, container);
	}

	onMount(async () => {
		file.subscribe((file) => {
			if (file === null) return;
			if (!graph) return;
			if (!renderer) return;

			for (const page of file.pages) {
				graph.addNode(page.id, { label: page.title.toLowerCase().replaceAll(' ', '_') });
			}

			for (const page of file.pages) {
				for (const linkedElem of page.linksLc) {
					const directedNode = graph.findNode((node, attr) =>
						attr.label == null
							? false
							: attr.label.toLowerCase().replaceAll(' ', '_') ===
								linkedElem.toLowerCase().replaceAll(' ', '_')
					);
					if (typeof directedNode === 'undefined') {
						const fromFile = file.pages.find((elem) => {
							elem.title.toLowerCase().replaceAll(' ', '_') ===
								linkedElem.toLowerCase().replaceAll(' ', '_');
						});
						if (typeof fromFile === 'undefined') {
							graph.addNode(linkedElem.toLowerCase().replaceAll(' ', '_'), {
								label: linkedElem.toLowerCase().replaceAll(' ', '_')
							});
							graph.addEdge(page.id, linkedElem.toLowerCase().replaceAll(' ', '_'), {
								type: 'arrow'
							});
						} else {
							graph.mergeNode(fromFile.id, {
								label: fromFile.title.toLowerCase().replaceAll(' ', '_')
							});
							graph.addEdge(page.id, fromFile.id, { type: 'arrow' });
						}
					} else {
						graph.addEdge(page.id, directedNode, { type: 'arrow' });
					}
				}
			}

			const inDegrees = graph.nodes().map((node) => graph.inDegree(node));
			const edgeCount = graph.edges().length;
			console.log(edgeCount);
			const minDegree = Math.min(...inDegrees);
			const maxDegree = Math.max(...inDegrees);
			const outDegrees: OutDegrees[] = [];
			graph
				.nodes()
				.forEach((node) =>
					outDegrees.push({ node: node, percent: graph.outDegree(node) / edgeCount })
				);
			outDegrees.sort((a, b) => (a.percent < b.percent ? 1 : -1));
			const blueIndex = Math.round(edgeCount * 3e-7) - 1;
			const blueWhiteIndex = Math.round(edgeCount * 1.25e-3) - 1;
			const whiteIndex = Math.round(edgeCount * 6.25e-3) - 1;
			const lemonIndex = Math.round(edgeCount * 3.03e-2) - 1;
			const yellowIndex = Math.round(edgeCount * 7.5e-2) - 1;
			const orangeIndex = Math.round(edgeCount * 12e-2) - 1;
			outDegrees.forEach((node, i) => {
				let color = '';
				if (i < blueIndex) {
					color = '#9bb0ff';
				} else if (i < blueWhiteIndex) {
					color = '#aabfff';
				} else if (i < whiteIndex) {
					color = '#cad7ff';
				} else if (i < lemonIndex) {
					color = '#f8f7ff';
				} else if (i < yellowIndex) {
					color = '#fff4ea';
				} else if (i < orangeIndex) {
					color = '#ffd2a1';
				} else {
					color = '#ffcc6f';
				}

				graph.setNodeAttribute(node.node, 'color', color);
			});
			const minSize = 4;
			const maxSize = 25;
			graph.forEachNode((node) => {
				const deg = graph.inDegree(node);
				graph.setNodeAttribute(
					node,
					'size',
					minSize + ((deg - minDegree) / (maxDegree - minDegree)) * (maxSize - minSize)
				);
			});

			circular.assign(graph);
			const settings = forceAtlas2.inferSettings(graph);
			forceAtlas2.assign(graph, { settings, iterations: 600 });

			//renderer.setSetting('labelColor', { color: '#f6f6f6' });
			//renderer.setSetting('defaultEdgeColor', '#D3D3D3');
			//renderer.setSetting('defaultNodeColor', '#D3D3D3');
			renderer.on('enterNode', ({ node }) => {
				if (!isNodeMenuOpen) setHoveredNode(renderer!, graph, node);
			});
			renderer.on('leaveNode', () => {
				if (!isNodeMenuOpen) setHoveredNode(renderer!, graph, undefined);
			});
			renderer.on('clickNode', ({ node: node_id }) => {
				const node = graph.findNode((node) => node === node_id);
				selectedNode = node!
				isNodeMenuOpen = true
				setHoveredNode(renderer!, graph, node);
			});

			renderer.setSetting('nodeReducer', (node, data) => {
				const res: Partial<NodeDisplayData> = { ...data };

				if (hoveredNeibors && !hoveredNeibors.has(node) && hoveredNode !== node) {
					res.label = '';
					res.color = '#f6f6f6';
				}

				return res;
			});
			renderer.setSetting('edgeReducer', (edge, data) => {
				const res: Partial<EdgeDisplayData> = { ...data };

				if (hoveredNode && !graph.hasExtremity(edge, hoveredNode)) {
					res.hidden = true;
				}
				return res;
			});
		});
	});
	$effect(() => {
		if (graph && renderer && selectedNode) {
			if (isNodeMenuOpen) {
				setHoveredNode(renderer, graph, selectedNode);
			} else {
				setHoveredNode(renderer, graph, undefined);
			}
		}
	})
		}
	})
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
	<style>
		body {
			margin: 0;
		}
	</style>
</svelte:head>

<div class="relative">
	{#if showModal}
		<FileSelector {showModal} />
	{/if}
	{#if selectedNode && isNodeMenuOpen && graph}
		<NodeDetailedMenu bind:isOpen={isNodeMenuOpen} {graph} bind:node={selectedNode} />
	{/if}
	<div id="sigma-container" {@attach initializeSigma}></div>
</div>

<style>
	#sigma-container {
		width: 100vw;
		height: 100vh;
		margin: 0;
		padding: 0;
		overflow: hidden;
		background-color: #002f55;
	}
</style>

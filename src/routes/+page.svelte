<script lang="ts">
	import FileSelector from './FileSelector.svelte';
	import { file } from '$lib/store';
	import Graph from 'graphology';
	import circular from 'graphology-layout/circular';
	import forceAtlas2 from 'graphology-layout-forceatlas2';
	import { onMount } from 'svelte';
	import type { EdgeDisplayData, NodeDisplayData } from 'sigma/types';
	import type Sigma from 'sigma';

	let showModal = true;
	let container: HTMLElement;
	let hoveredNode: string | undefined;
	let hoveredNeibors: Set<string> | undefined;
	
	const setHoveredNode = (renderer: Sigma, graph: Graph, node?: string) => {
		if (typeof node === "undefined") {
			hoveredNode = undefined;
			hoveredNeibors = undefined;
		} else {
			hoveredNode = node;
			hoveredNeibors = new Set(graph.neighbors(node));
		}
		
		renderer.refresh();
	}

	onMount(async () => {
		const { Sigma } = await import('sigma');
		file.subscribe((file) => {
			if (file === null) return;

			const graph = new Graph();
			for (const page of file.pages) {
				graph.addNode(page.id, { label: page.title.toLowerCase().replaceAll(" ", "_") });
			}

			for (const page of file.pages) {
				for (const linkedElem of page.linksLc) {
					const directedNode = graph.findNode((node, attr) =>
						attr.label == null ? false : attr.label.toLowerCase().replaceAll(" ", "_") === linkedElem.toLowerCase().replaceAll(" ", "_")
					);
					if (typeof directedNode === 'undefined') {
						const fromFile = file.pages.find((elem) => {
							elem.title.toLowerCase().replaceAll(" ", "_") === linkedElem.toLowerCase().replaceAll(" ", "_");
						});
						if (typeof fromFile === 'undefined') {
							graph.addNode(linkedElem.toLowerCase().replaceAll(" ", "_"), { label: linkedElem.toLowerCase().replaceAll(" ", "_") });
							graph.addEdge(page.id, linkedElem.toLowerCase().replaceAll(" ", "_"), { type: 'arrow' });
						} else {
							graph.mergeNode(fromFile.id, { label: fromFile.title.toLowerCase().replaceAll(" ", "_") });
							graph.addEdge(page.id, fromFile.id, { type: 'arrow' });
						}
					} else {
						graph.addEdge(page.id, directedNode, { type: 'arrow' });
					}
				}
			}

			const degrees = graph.nodes().map((node) => graph.inDegree(node));
			const minDegree = Math.min(...degrees);
			const maxDegree = Math.max(...degrees);
			const minSize = 2;
			const maxSize = 15;
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

			const renderer = new Sigma(graph, container);
			renderer.on("enterNode", ({ node }) => {
				setHoveredNode(renderer, graph, node);
			});
			renderer.on("leaveNode", () => {
				setHoveredNode(renderer, graph, undefined);
			});

			renderer.setSetting("nodeReducer", (node, data) => {
				const res: Partial<NodeDisplayData> = { ...data };
				
				if (hoveredNeibors && !hoveredNeibors.has(node) && hoveredNode !== node) {
					res.label = "";
					res.color = "#f6f6f6";
				}

				return res;
			});
			renderer.setSetting("edgeReducer", (edge, data) => {
				const res: Partial<EdgeDisplayData> = { ...data };

				if (hoveredNode && !graph.hasExtremity(edge, hoveredNode)) {
					res.hidden = true;
				}
				return res;
			})
		});
	});
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<FileSelector {showModal} />
<div id="sigma-container" bind:this={container} />

<style>
	#sigma-container {
		width: 100vw;
		height: 100vh;
		margin: 0;
		padding: 0;
		overflow: hidden;
	}
</style>

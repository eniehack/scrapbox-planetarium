<script lang="ts">
	import FileSelector from './FileSelector.svelte';
	import { file } from '$lib/store';
	import Graph from 'graphology';
	import circular from 'graphology-layout/circular';
	import forceAtlas2 from 'graphology-layout-forceatlas2';
	import { onMount } from 'svelte';

	let showModal = true;
	let container: HTMLElement;

	onMount(async () => {
		const { Sigma } = await import('sigma');
		file.subscribe((file) => {
			if (file === null) return;

			//showModal = false;
			console.log(file);
			const graph = new Graph();
			for (const page of file.pages) {
				graph.addNode(page.title, { id: page.id, label: page.title });
			}
			for (const page of file.pages) {
				for (const linkedElem of page.linksLc) {
					const directedNode = graph.findNode((node) => node === linkedElem);
					if (typeof directedNode === "undefined") {
						graph.mergeNode(linkedElem, {label: linkedElem});
						graph.addEdge(page.title, linkedElem);
					} else {
						graph.addEdge(page.title, directedNode);
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

			new Sigma(graph, container);
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

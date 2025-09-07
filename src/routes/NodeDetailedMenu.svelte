<script lang="ts">
	import type Graph from "graphology";
	type Props = {
		node: string
		isOpen: boolean
		graph: Graph
	}
	let { node: selectedNode, graph, isOpen = $bindable() }: Props = $props();
	let outNeighbors = $derived.by<Array<{label: string, node: string}>>(() => {
		try {
			return graph.outNeighbors(selectedNode).map(node => {
				const label = graph.getNodeAttribute(node, "label") as string;
				return {label, node}
			})
		} catch (error) {
			return []
		}
	})
	let inNeighbors = $derived.by<Array<{label: string, node: string}>>(() => {
		try {
			const neighbours = graph.inNeighbors(selectedNode).map(node => {
				const label = graph.getNodeAttribute(node, "label") as string;
				return {label, node}
			})
			return neighbours;
		} catch (error) {
			return []
		}
	})

	const closePanel = () => {
		isOpen = false;
	}
</script>

<div class="absolute top-0 left-0 w-80 h-full bg-white border-r border-gray-300 shadow-lg z-10">
	<div class="p-6">

	<button 
		onclick={closePanel}
		class="float-right text-gray-500 hover:text-gray-700 text-xl font-bold"
	>
		×
	</button>
	
	<section class="prose ">
	<h2>{selectedNode}</h2>
	<div class="space-y-2 overflow-y-scroll">
		<p>このページからリンクしているページたち</p>
		<ul>
		{#each outNeighbors as neighbor}
			<li>{neighbor.label}</li>
		{/each}
		</ul>
		<p>このページへリンクしているページたち</p>
		<ul>
		{#each inNeighbors as neighbor}
			<li onclick={() => selectedNode = neighbor.node}>{neighbor.label}</li> 
		{/each}
		</ul>
	</div>
	</section>
	</div>
</div>
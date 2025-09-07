<script lang="ts">
	import type Graph from "graphology";
	import { getLabel } from "./label";
	type Props = {
		node: string
		isOpen: boolean
		graph: Graph
	}
	type Node = {
		label: string,
		node: string
	}
	let { node: selectedNode = $bindable(), graph, isOpen = $bindable() }: Props = $props();
	let outNeighbors = $derived.by<Array<Node>>(() => {
		try {
			return graph.outNeighbors(selectedNode).map(node => {
				const label = graph.getNodeAttribute(node, "label") as string;
				return {label, node}
			})
		} catch (error) {
			return []
		}
	})
	let inNeighbors = $derived.by<Array<Node>>(() => {
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
	let selectednodeLabel = $derived(getLabel(graph, selectedNode))

	const closePanel = () => {
		isOpen = false;
	}

	const onNodeClicked = (neighbor: Node) => {
		selectedNode = neighbor.node;
	}
</script>

<div class="absolute top-0 left-0 w-80 h-full bg-white border-r border-gray-300 shadow-lg z-10 flex flex-col" role="menu">
	<div class="p-6 flex-shrink-0">
		<button 
			onclick={closePanel}
			class="float-right text-gray-500 hover:text-gray-700 text-xl font-bold"
		>
			×
		</button>
	</div>
	
	<section class="prose flex-1 overflow-y-auto px-6 pb-6" >
	<h2>{selectednodeLabel}</h2>
	<div class="space-y-2 overflow-scroll">
		<section>
			<h3>このページからリンクしているページたち</h3>
			<ul>
			{#each outNeighbors as neighbor}
				<li class="text-sky-600 hover:underline">
					<button type="button" class="inline-block cursor-pointer" onclick={() => onNodeClicked(neighbor)}>
						{neighbor.label}
					</button>
				</li> 
			{/each}
			</ul>
		</section>
		<section>
			<h3>このページへリンクしているページたち</h3>
			<ul>
			{#each inNeighbors as neighbor}
				<li class="text-sky-600 hover:underline">
					<button type="button" class="inline-block cursor-pointer" onclick={() => onNodeClicked(neighbor)}>{neighbor.label}</button>
				</li> 
			{/each}
			</ul>
		</section>
	</div>
	</section>
</div>
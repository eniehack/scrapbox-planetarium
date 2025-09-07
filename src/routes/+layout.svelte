<script>
	/**
	 * @typedef {Object} Props
	 * @property {import('svelte').Snippet} [children]
	 */

	/** @type {Props} */
	const { children } = $props();
	import '../app.css';
</script>

<div class="app">
	<main>
		{@render children?.()}
	</main>

	<footer></footer>
</div>

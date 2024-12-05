<script>
	/**
	 * @typedef {Object} Props
	 * @property {import('svelte').Snippet} [children]
	 */

	/** @type {Props} */
	const { children } = $props();
</script>

<div class="app">
	<main>
		{@render children?.()}
	</main>

	<footer></footer>
</div>

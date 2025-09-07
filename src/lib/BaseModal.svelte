<script lang="ts">
	interface Props {
		showModal: boolean;
		dialog: HTMLDialogElement;
		children?: import('svelte').Snippet;
	}

	let { showModal = $bindable(), dialog = $bindable(), children }: Props = $props();

	$effect(() => {
		if (showModal) dialog.showModal();
	});
</script>

<dialog class="prose" bind:this={dialog} onclose={() => (showModal = false)}>
	<div>
		<div class="header"></div>
		{@render children?.()}
		<div class="footer">
			<button
				onclick={() => {
					dialog.close();
				}}>close</button
			>
		</div>
	</div>
</dialog>

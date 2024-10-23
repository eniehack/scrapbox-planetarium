<script lang="ts">
	import { run, self } from 'svelte/legacy';


	interface Props {
		showModal: boolean;
		dialog: HTMLDialogElement;
		children?: import('svelte').Snippet;
	}

	let { showModal = $bindable(), dialog = $bindable(), children }: Props = $props();

	run(() => {
		if (dialog && showModal) dialog.showModal();
	});
</script>

<dialog
	bind:this={dialog}
	onclose={() => (showModal = false)}
	onclick={self(() => dialog.close())}
>
	<div>
		<div class="header"></div>
		{@render children?.()}
		<div class="footer">
			<button onclick={() => dialog.close()}>close</button>
		</div>
	</div>
</dialog>

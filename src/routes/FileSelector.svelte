<script lang="ts">
	import { schema } from '$lib/load';
	import { file as fileStore } from '$lib/store';

	let dialog: HTMLDialogElement;
	let file: FileList;
	export let showModal: boolean;

	$: if (file) {
		console.log(file);

		const f = file.item(0);
		if (f !== null) {
			f.text()
				.then((txt) => JSON.parse(txt))
				.then((json) => schema.parse(json))
				.then((data) => fileStore.set(data));
			dialog.close();
		}
	}
	$: if (dialog && showModal) dialog.showModal();
</script>

<dialog bind:this={dialog}>
	<input type="file" id="file_elem" accept=".json" bind:files={file} />
	<!-- TODO: dnd でファイル追加できてほし～～ -->
</dialog>

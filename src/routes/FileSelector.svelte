<script lang="ts">
	import BaseModal from '$lib/BaseModal.svelte';
import { schema } from '$lib/load';
	import { file as fileStore } from '$lib/store';

	let dialog: HTMLDialogElement;
	let file: FileList;
	let target_project: string;
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

<BaseModal bind:showModal>
	<label for="project">対象とするproject</label>
	<input name="project" type="text" bind:value={target_project}>
	{#if target_project !== ""}
		<p>
			<a href={`https://scrapbox.io/projects/${target_project}/settings/backup`} target="_blank" rel="noreferrer noopener">ここ</a>
			を開いてJSONを入手します
		</p>
	{/if}
	<input type="file" id="file_elem" accept=".json" bind:files={file} />
	<!-- TODO: dnd でファイル追加できてほし～～ -->
</BaseModal>

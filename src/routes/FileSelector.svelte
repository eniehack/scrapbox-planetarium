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
  <h2>使い方</h2>
  <ol>
    <li>
        <section>
            <h3>ファイルの取得</h3>
            <p>scrapboxからページの情報をファイルで入手してください。既に入手している場合にはこの操作をスキップして次へ進んでください。</p>
	          <label for="project">対象とするscrapboxのprojectを入力してください</label>
	          <input name="project" type="text" bind:value={target_project} />
	          {#if target_project !== ''}
	          	<p>
	          		<a
	          			href={`https://scrapbox.io/projects/${target_project}/settings/backup`}
	          			target="_blank"
	          			rel="noreferrer noopener">ここ</a
	          		>
	          		を開いてJSONを入手します
	          	</p>
	          {/if}
            </section>
    </li>
    <li>
        <section>
            <h3>ファイルの選択</h3>
            <p>取得したファイルを以下のボタンから選択してください</p>
	          <input type="file" id="file_elem" accept=".json" bind:files={file} />
	          <!-- TODO: dnd でファイル追加できてほし～～ -->
        </section>
    </li>
  </ol>
</BaseModal>

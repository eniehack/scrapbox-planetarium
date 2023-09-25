<script lang="ts">
    export let showModal: boolean;

    let dialog: HTMLDialogElement;

    $: if (dialog && showModal) dialog.showModal();
</script>

<dialog
    bind:this={dialog}
    on:close={() => showModal = false}
    on:click|self={() => dialog.close()}>
    <div>
        <div class="header"></div>
        <slot />
        <div class="footer">
            <button on:click={() => dialog.close()}>close</button>
        </div>
    </div>
</dialog>
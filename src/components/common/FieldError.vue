<template>
<p v-if="msg" class="mt-1 text-sm text-red-500 flex items-center gap-1">
<i class="pi pi-exclamation-circle"/> {{ msg }}
</p>
</template>
<script setup>
defineProps({ msg: String })
</script>
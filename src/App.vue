<template>
<AppShell>
<transition name="fade" mode="out-in">
<RouterView />
</transition>
<Toast />
<ConfirmDialog />
</AppShell>
</template>


<script setup>
import AppShell from '@/components/layout/AppShell.vue'
import { RouterView } from 'vue-router'
</script>
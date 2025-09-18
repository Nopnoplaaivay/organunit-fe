<template>
<div class="card text-center py-12">
<i :class="icon" class="text-4xl" />
<h3 class="mt-4 text-lg font-semibold">{{ title }}</h3>
<p class="mt-1 text-gray-500">{{ subtitle }}</p>
<div class="mt-4">
<slot />
</div>
</div>
</template>


<script setup>
defineProps({
title: { type: String, default: 'Chưa có dữ liệu' },
subtitle: { type: String, default: 'Hãy điều chỉnh bộ lọc hoặc tạo mới.' },
icon: { type: String, default: 'pi pi-database' }
})
</script>
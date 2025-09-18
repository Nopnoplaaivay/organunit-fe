<template>
<span class="p-input-icon-left w-full">
<i class="pi pi-search" />
<InputText :placeholder="placeholder" class="w-full" v-model="inner" @keydown.enter="$emit('search', inner)" />
</span>
</template>


<script setup>
import { ref, watch } from 'vue'
import InputText from 'primevue/inputtext'


const props = defineProps({
modelValue: String,
placeholder: { type: String, default: 'Tìm kiếm…' },
debounce: { type: Number, default: 400 }
})
const emit = defineEmits(['update:modelValue', 'search'])
const inner = ref(props.modelValue || '')
let t
watch(() => props.modelValue, v => inner.value = v)
watch(inner, v => {
clearTimeout(t)
t = setTimeout(() => emit('update:modelValue', v), props.debounce)
})
</script>
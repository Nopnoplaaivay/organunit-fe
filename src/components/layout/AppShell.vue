<template>
  <div class="min-h-screen flex flex-col">
    <!-- Top bar -->
    <header class="sticky top-0 z-40 backdrop-blur bg-white/80 border-b border-gray-200">
      <div class="container-app h-14 flex items-center gap-3">
        <button class="md:hidden p-button p-button-text" @click="sidebarOpen = !sidebarOpen">
          <i class="pi pi-bars" />
        </button>
        <RouterLink to="/" class="font-semibold tracking-tight">Admin Portal</RouterLink>
        <span class="ml-auto text-sm text-gray-500 hidden sm:block"
          >Vue 3 · Vite · PrimeVue · Tailwind</span
        >
      </div>
    </header>

    <div class="flex-1">
      <div class="container-app grid grid-cols-12 gap-6 py-6">
        <!-- Sidebar -->
        <aside
          :class="[
            'col-span-12 md:col-span-3 lg:col-span-2 card transition-all',
            sidebarOpen ? 'block' : 'hidden md:block',
          ]"
        >
          <nav class="card-body space-y-1">
            <RouterLink to="/" class="nav-item" :class="isActive('/')">
              <i class="pi pi-home mr-2" /> Tổng quan
            </RouterLink>
            <RouterLink
              to="/organization-units"
              class="nav-item"
              :class="isActive('/organization-units')"
            >
              <i class="pi pi-list mr-2" /> Danh sách đơn vị
            </RouterLink>
            <RouterLink
              to="/organization-tree"
              class="nav-item"
              :class="isActive('/organization-tree')"
            >
              <i class="pi pi-sitemap mr-2" /> Cây tổ chức
            </RouterLink>
          </nav>
        </aside>

        <!-- Main content -->
        <main class="col-span-12 md:col-span-9 lg:col-span-10 space-y-6">
          <slot />
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, RouterLink } from 'vue-router'

const route = useRoute()
const sidebarOpen = ref(false)
const isActive = (path) =>
  route.path === path
    ? 'bg-gray-100 font-medium rounded-xl px-3 py-2 block'
    : 'hover:bg-gray-50 rounded-xl px-3 py-2 block'
</script>

<style scoped>
.nav-item {
  display: flex;
  align-items: center;
  font-size: 15px;
  color: #374151;
}
</style>

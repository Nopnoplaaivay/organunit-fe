<template>
  <div class="p-6">
    <div class="max-w-7xl mx-auto">
      <!-- Welcome Section -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">
          Chào mừng đến với Demo Vinatex
        </h1>
        <p class="text-xl text-gray-600 mb-8">
          Hệ thống quản lý tổ chức doanh nghiệp
        </p>
      </div>

      <!-- Quick Actions -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card class="hover:shadow-lg transition-shadow cursor-pointer" @click="navigateTo('/organization-units')">
          <template #content>
            <div class="text-center p-4">
              <div class="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <i class="pi pi-sitemap text-2xl text-blue-600"></i>
              </div>
              <h3 class="text-xl font-semibold mb-2">Quản lý Tổ chức</h3>
              <p class="text-gray-600">Tạo và quản lý cấu trúc tổ chức phân cấp</p>
            </div>
          </template>
        </Card>

        <Card class="hover:shadow-lg transition-shadow">
          <template #content>
            <div class="text-center p-4">
              <div class="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <i class="pi pi-users text-2xl text-green-600"></i>
              </div>
              <h3 class="text-xl font-semibold mb-2">Quản lý Nhân viên</h3>
              <p class="text-gray-600">Phân công nhân viên vào các đơn vị</p>
            </div>
          </template>
        </Card>

        <Card class="hover:shadow-lg transition-shadow">
          <template #content>
            <div class="text-center p-4">
              <div class="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <i class="pi pi-chart-bar text-2xl text-purple-600"></i>
              </div>
              <h3 class="text-xl font-semibold mb-2">Báo cáo</h3>
              <p class="text-gray-600">Xem báo cáo và thống kê tổ chức</p>
            </div>
          </template>
        </Card>
      </div>

      <!-- Statistics -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <template #content>
            <div class="text-center p-4">
              <div class="text-2xl font-bold text-blue-600 mb-2">{{ stats.totalUnits }}</div>
              <div class="text-gray-600">Tổng đơn vị</div>
            </div>
          </template>
        </Card>

        <Card>
          <template #content>
            <div class="text-center p-4">
              <div class="text-2xl font-bold text-green-600 mb-2">{{ stats.rootUnits }}</div>
              <div class="text-gray-600">Đơn vị gốc</div>
            </div>
          </template>
        </Card>

        <Card>
          <template #content>
            <div class="text-center p-4">
              <div class="text-2xl font-bold text-purple-600 mb-2">{{ stats.maxDepth }}</div>
              <div class="text-gray-600">Cấp sâu nhất</div>
            </div>
          </template>
        </Card>

        <Card>
          <template #content>
            <div class="text-center p-4">
              <div class="text-2xl font-bold text-orange-600 mb-2">{{ stats.lastUpdated }}</div>
              <div class="text-gray-600">Cập nhật cuối</div>
            </div>
          </template>
        </Card>
      </div>

      <!-- Recent Activity -->
      <Card>
        <template #title>
          <div class="flex items-center gap-2">
            <i class="pi pi-clock"></i>
            Hoạt động gần đây
          </div>
        </template>
        <template #content>
          <div v-if="recentUnits.length === 0" class="text-center text-gray-500 py-8">
            <i class="pi pi-info-circle text-4xl mb-4"></i>
            <p>Chưa có hoạt động nào</p>
          </div>
          <div v-else class="space-y-3">
            <div 
              v-for="unit in recentUnits" 
              :key="unit.id"
              class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div class="flex items-center gap-3">
                <i class="pi pi-sitemap text-blue-500"></i>
                <div>
                  <div class="font-medium">{{ unit.displayName }}</div>
                  <div class="text-sm text-gray-500">{{ unit.parentName || 'Đơn vị gốc' }}</div>
                </div>
              </div>
              <div class="text-sm text-gray-500">
                {{ formatDate(unit.creationTime) }}
              </div>
            </div>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useOrganizationUnitStore } from '@/stores/organizationUnit'

const router = useRouter()
const store = useOrganizationUnitStore()

const stats = ref({
  totalUnits: 0,
  rootUnits: 0,
  maxDepth: 0,
  lastUpdated: '-'
})

const recentUnits = computed(() => {
  return store.units
    .slice()
    .sort((a, b) => new Date(b.creationTime) - new Date(a.creationTime))
    .slice(0, 5)
})

function navigateTo(path) {
  router.push(path)
}

function formatDate(dateString) {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

function calculateStats() {
  stats.value.totalUnits = store.units.length
  stats.value.rootUnits = store.units.filter(u => !u.parentId).length
  
  // Calculate max depth
  let maxDepth = 0
  store.units.forEach(unit => {
    const depth = (unit.code?.split('.').length || 1)
    if (depth > maxDepth) {
      maxDepth = depth
    }
  })
  stats.value.maxDepth = maxDepth

  // Last updated
  if (store.units.length > 0) {
    const lastUnit = store.units.reduce((latest, current) => {
      return new Date(current.lastModificationTime || current.creationTime) > 
             new Date(latest.lastModificationTime || latest.creationTime) ? current : latest
    })
    stats.value.lastUpdated = formatDate(lastUnit.lastModificationTime || lastUnit.creationTime)
  }
}

onMounted(async () => {
  try {
    await store.fetchUnits({ maxResultCount: 1000 }) // Load all for stats
    calculateStats()
  } catch (error) {
    console.error('Error loading data:', error)
  }
})
</script>

<style scoped>
.space-y-3 > * + * {
  margin-top: 0.75rem;
}
</style>
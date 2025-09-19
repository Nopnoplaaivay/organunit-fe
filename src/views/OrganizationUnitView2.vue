<template>
  <div class="container-app">
    <div class="card">
      <div class="card-header">
        <h1 class="text-xl font-semibold">Đơn vị tổ chức</h1>
        <Button @click="openDialog" icon="pi pi-plus" label="Thêm mới" />
      </div>
      <div class="card-body">
        <DataTable
          :value="store.units"
          :loading="store.loading"
          :paginator="true"
          :rows="pageSize"
          :totalRecords="store.totalRecords"
          :first="first"
          @page="onPage"
          @sort="onSort"
          sortMode="single"
          removableSort
        >
          <Column field="code" header="Mã" sortable style="width: 120px" />
          <Column field="name" header="Tên" sortable style="width: 180px" />
          <Column field="displayName" header="Tên hiển thị" sortable style="width: 200px" />
          <Column field="description" header="Mô tả" sortable style="width: 250px">
            <template #body="{ data }">
              <span :title="data.description" class="truncate block">
                {{ data.description || '-' }}
              </span>
            </template>
          </Column>
          <Column field="parentName" header="Đơn vị cha" sortable style="width: 180px">
            <template #body="{ data }">
              <span class="text-gray-600">
                {{ data.parentName || 'Gốc' }}
              </span>
            </template>
          </Column>
          <Column header="Thao tác" style="width: 120px">
            <template #body="{ data }">
              <div class="flex gap-2">
                <Button
                  @click="openEdit(data)"
                  icon="pi pi-pencil"
                  size="small"
                  text
                  severity="secondary"
                  class="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                  title="Chỉnh sửa"
                />
                <Button
                  @click="confirmDelete(data)"
                  icon="pi pi-trash"
                  size="small"
                  text
                  class="text-red-600 hover:text-red-800 hover:bg-red-50"
                  title="Xóa"
                />
              </div>
            </template>
          </Column>
        </DataTable>
      </div>
    </div>

    <!-- Dialog Form -->
    <Dialog
      v-model:visible="dialogVisible"
      :header="dialogTitle"
      :modal="true"
      class="p-fluid"
      :style="{ width: '500px' }"
    >
      <form @submit.prevent="submitForm" class="space-y-4">
        <!-- Tên -->
        <div class="field">
          <label for="name" class="block text-sm font-medium mb-2">Tên *</label>
          <InputText
            id="name"
            v-model="form.name"
            :class="{ 'p-invalid': formErrors.name }"
            placeholder="Nhập tên đơn vị"
          />
          <small v-if="formErrors.name" class="p-error">{{ formErrors.name }}</small>
        </div>

        <!-- Tên hiển thị -->
        <div class="field">
          <label for="displayName" class="block text-sm font-medium mb-2">Tên hiển thị *</label>
          <InputText
            id="displayName"
            v-model="form.displayName"
            :class="{ 'p-invalid': formErrors.displayName }"
            placeholder="Nhập tên hiển thị"
          />
          <small v-if="formErrors.displayName" class="p-error">{{ formErrors.displayName }}</small>
        </div>

        <!-- Đơn vị cha -->
        <div class="field">
          <label for="parent" class="block text-sm font-medium mb-2">Đơn vị cha</label>
          <TreeSelect
            v-model="form.parentId"
            :options="treeSelectOptions"
            placeholder="Chọn đơn vị cha"
            class="w-full"
          />
        </div>

        <!-- Mô tả -->
        <div class="field">
          <label for="description" class="block text-sm font-medium mb-2">Mô tả</label>
          <Textarea id="description" v-model="form.description" rows="3" placeholder="Nhập mô tả" />
        </div>
      </form>

      <template #footer>
        <Button label="Hủy" icon="pi pi-times" text @click="closeDialog" />
        <Button label="Lưu" icon="pi pi-check" @click="submitForm" :loading="store.loading" />
      </template>
    </Dialog>

    <Toast />
    <ConfirmDialog />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, computed } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import { useOrganizationUnitStore } from '@/stores/organizationUnit'

// PrimeVue Components
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import TreeSelect from 'primevue/treeselect'
import Toast from 'primevue/toast'
import ConfirmDialog from 'primevue/confirmdialog'

// Composables
const store = useOrganizationUnitStore()
const toast = useToast()
const confirm = useConfirm()

const dialogVisible = ref(false)
const editingUnit = ref(null)
const selectedUnits = ref([])
const selectedTreeKeys = ref({})
const pageSize = ref(10)
const currentPage = ref(0)

const form = reactive({
  name: '',
  displayName: '',
  description: '',
  parentId: null,
})

const formErrors = reactive({
  name: '',
  displayName: '',
})

const filters = reactive({
  filter: '',
  sorting: 'code',
})

// Computed
const dialogTitle = computed(() => (editingUnit.value ? 'Thêm' : 'Sửa'))

const treeNodes = computed(() => {
  if (!store.tree || !Array.isArray(store.tree)) return []
  return convertToTreeNodes(store.tree)
})

const treeSelectOptions = computed(() => {
  if (!store.tree || !Array.isArray(store.tree)) return []
  console.log('Tree Select Options:', store.tree)
  return store.convertToTreeSelectOptions(store.tree)
})

// Methods
function convertToTreeNodes(treeData) {
  if (!treeData || !Array.isArray(treeData)) return []
  return treeData.map((item) => ({
    key: item.id,
    label: item.displayName,
    data: item,
    children: item.children?.length > 0 ? convertToTreeNodes(item.children) : [],
  }))
}

function resetForm() {
  form.name = ''
  form.displayName = ''
  form.description = ''
  form.parentId = null
  formErrors.name = ''
  formErrors.displayName = ''
}

function validateForm() {
  let isValid = true

  if (!form.name?.trim()) {
    formErrors.name = 'Tên không được để trống'
    isValid = false
  } else {
    formErrors.name = ''
  }

  if (!form.displayName?.trim()) {
    formErrors.displayName = 'Tên hiển thị không được để trống'
    isValid = false
  } else {
    formErrors.displayName = ''
  }

  return isValid
}

async function submitForm() {
  if (!validateForm()) return

  try {
    const data = {
      name: form.name.trim(),
      displayName: form.displayName.trim(),
      description: form.description?.trim() || null,
      parentId: form.parentId || null,
    }

    if (editingUnit.value) {
      await store.updateUnit(editingUnit.value.id, data)
      toast.add({
        severity: 'success',
        summary: 'Thành công',
        detail: 'Cập nhật đơn vị thành công',
        life: 3000,
      })
    } else {
      await store.createUnit(data)
      toast.add({
        severity: 'success',
        summary: 'Thành công',
        detail: 'Thêm đơn vị thành công',
        life: 3000,
      })
    }

    closeDialog()
  } catch (error) {
    console.error('Submit error:', error)
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: error.response?.data?.error?.message || 'Có lỗi xảy ra',
      life: 5000,
    })
  }
}

function openDialog(unit = null) {
  editingUnit.value = unit
  if (unit) {
    form.name = unit.name
    form.displayName = unit.displayName
    form.description = unit.description
    form.parentId = unit.parentId
  } else {
    resetForm()
  }
  dialogVisible.value = true
}

function closeDialog() {
  dialogVisible.value = false
  editingUnit.value = null
  resetForm()
}

function onTreeNodeSelect(node) {
  // Optional: Filter table by selected tree node
}

async function onPage(event) {
  currentPage.value = event.page
  await loadUnits({
    skipCount: event.first,
    maxResultCount: event.rows,
  })
}

async function onSort(event) {
  filters.sorting = event.sortField + (event.sortOrder === -1 ? ' desc' : '')
  await loadUnits()
}

function validate() {
  errors.name = form.name ? '' : 'Tên bắt buộc'
  errors.code = form.code ? '' : 'Mã bắt buộc'
  return !errors.name && !errors.code
}

function confirmDelete(row) {
  confirm.require({
    message: `Xóa "${row.name}"?`,
    header: 'Xác nhận',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await store.deleteUnit?.(row.id)
        toast.add({ severity: 'success', summary: 'Đã xóa', life: 2000 })
        loadUnits()
      } catch (e) {
        toast.add({
          severity: 'error',
          summary: 'Không thể xóa',
          detail: String(e?.message || e),
          life: 3000,
        })
      }
    },
  })
}

async function searchUnits() {
  await loadUnits()
}

async function loadUnits(params = {}) {
  const requestParams = {
    skipCount: currentPage.value * pageSize.value,
    maxResultCount: pageSize.value,
    sorting: filters.sorting,
    ...params,
  }
  await store.fetchUnits(requestParams)
}

async function refreshData() {
  await Promise.all([loadUnits(), store.fetchTree()])

  console.log('Data refreshed')
  console.log('Tree data:', store.tree)
}

async function refreshTree() {
  await store.fetchTree()
}

// Lifecycle
onMounted(async () => {
  await refreshData()
})

watch(
  () => form.name,
  (newValue) => {
    if (!form.displayName && newValue) {
      form.displayName = newValue
    }
  },
)
</script>

<style scoped>
/* Force light theme for DataTable */
:deep(.p-datatable) {
  background-color: white !important;
}

:deep(.p-datatable .p-datatable-tbody > tr) {
  background-color: white !important;
  color: #1f2937 !important;
}

:deep(.p-datatable .p-datatable-tbody > tr:nth-child(even)) {
  background-color: #f9fafb !important;
}

:deep(.p-datatable .p-datatable-tbody > tr:hover) {
  background-color: #f3f4f6 !important;
  color: #1f2937 !important;
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
  background-color: #f9fafb !important;
  color: #374151 !important;
}
</style>

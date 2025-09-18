<template>
  <div class="container-app">
    <div class="card">
      <div class="card-header">
        <h1 class="text-xl font-semibold">Đơn vị tổ chức</h1>
        <Button @click="openCreate" icon="pi pi-plus" label="Thêm mới" />
      </div>
      <div class="card-body">
        <DataTable
          :value="units"
          :loading="loading"
          :paginator="true"
          :rows="pageSize"
          :totalRecords="totalRecords"
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

    <Dialog
      v-model:visible="dialogVisible"
      :header="dialogMode === 'create' ? 'Thêm mới' : 'Chỉnh sửa'"
      modal
      style="width: 400px"
    >
      <div class="space-y-4">
        <div>
          <label>Tên *</label>
          <InputText v-model="form.name" :class="{ 'p-invalid': errors.name }" class="w-full" />
          <small v-if="errors.name" class="p-error">{{ errors.name }}</small>
        </div>
        <div>
          <label>Mã *</label>
          <InputText v-model="form.code" :class="{ 'p-invalid': errors.code }" class="w-full" />
          <small v-if="errors.code" class="p-error">{{ errors.code }}</small>
        </div>
        <div>
          <label>Tên hiển thị</label>
          <InputText v-model="form.displayName" class="w-full" />
        </div>
        <div>
          <label>Đơn vị cha</label>
          <Dropdown
            v-model="form.parentId"
            :options="filteredParentOptions"
            option-label="displayName"
            option-value="id"
            placeholder="Chọn đơn vị cha (để trống nếu là đơn vị gốc)"
            show-clear
            filter
            filter-placeholder="Tìm kiếm đơn vị..."
            class="w-full"
            :empty-filter-message="'Không tìm thấy đơn vị nào'"
            :empty-message="'Không có dữ liệu'"
          />
          <small class="text-gray-500">Để trống nếu muốn tạo đơn vị gốc</small>
        </div>
        <div>
          <label>Mô tả</label>
          <Textarea v-model="form.description" class="w-full" rows="3" />
        </div>
      </div>
      <template #footer>
        <Button @click="dialogVisible = false" label="Hủy" text />
        <Button @click="submit" label="Lưu" />
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

const store = useOrganizationUnitStore()
const toast = useToast()
const confirm = useConfirm()

const units = ref([])
const parentOptions = ref([])
const loading = ref(false)
const totalRecords = ref(0)
const first = ref(0)
const pageSize = ref(10)
const sorting = ref('')

const dialogVisible = ref(false)
const dialogMode = ref('create')
const form = reactive({
  id: null,
  name: '',
  code: '',
  displayName: '',
  description: '',
  parentId: null,
})
const errors = reactive({
  name: '',
  code: '',
})

// Computed property to filter parent options and avoid circular reference
const filteredParentOptions = computed(() => {
  if (dialogMode.value === 'edit' && form.id) {
    return parentOptions.value.filter((unit) => unit.id !== form.id)
  }
  return parentOptions.value
})

async function loadUnits() {
  try {
    loading.value = true
    const params = {
      skipCount: first.value,
      maxResultCount: pageSize.value,
      sorting: sorting.value,
    }
    const result = await store.fetchUnits(params)
    units.value = result.items || []
    totalRecords.value = result.totalCount || 0

    // Load all units for parent selection (without pagination)
    await loadParentOptions()
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: 'Lỗi tải dữ liệu',
      detail: String(err?.message || err),
      life: 3000,
    })
  } finally {
    loading.value = false
  }
}

async function loadParentOptions() {
  try {
    const allUnitsParams = {
      skipCount: 0,
      maxResultCount: 1000, // Get all units for parent selection
      sorting: 'displayName',
    }
    const result = await store.fetchUnits(allUnitsParams)
    parentOptions.value = result.items || []
  } catch (err) {
    console.error('Error loading parent options:', err)
  }
}

function onPage(e) {
  first.value = e.first
  pageSize.value = e.rows
  loadUnits()
}

function onSort(e) {
  if (e.multiSortMeta?.length) {
    const s = e.multiSortMeta[0]
    sorting.value = `${s.field} ${s.order === 1 ? 'asc' : 'desc'}`
  } else if (e.sortField) {
    sorting.value = `${e.sortField} ${e.sortOrder === 1 ? 'asc' : 'desc'}`
  }
  loadUnits()
}

function openCreate() {
  dialogMode.value = 'create'
  Object.assign(form, {
    id: null,
    name: '',
    code: '',
    displayName: '',
    description: '',
    parentId: null,
  })
  Object.assign(errors, { name: '', code: '' })
  // Reload parent options for create mode
  loadParentOptions()
  dialogVisible.value = true
}

function openEdit(row) {
  dialogMode.value = 'edit'
  Object.assign(form, row)
  Object.assign(errors, { name: '', code: '' })
  dialogVisible.value = true
}

function validate() {
  errors.name = form.name ? '' : 'Tên bắt buộc'
  errors.code = form.code ? '' : 'Mã bắt buộc'
  return !errors.name && !errors.code
}

async function submit() {
  if (!validate()) return
  try {
    if (dialogMode.value === 'create') {
      await store.createUnit?.(form)
      toast.add({ severity: 'success', summary: 'Tạo thành công', life: 2000 })
    } else {
      await store.updateUnit?.(form.id, form)
      toast.add({ severity: 'success', summary: 'Đã lưu thay đổi', life: 2000 })
    }
    dialogVisible.value = false
    loadUnits()
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: String(err?.message || err),
      life: 3000,
    })
  }
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

watch(
  () => form.name,
  (v) => {
    if (dialogMode.value === 'create' && !form.displayName) {
      form.displayName = v
    }
  },
)

onMounted(() => loadUnits())
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

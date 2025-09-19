<template>
  <div class="p-4">
    <Toast />
    <ConfirmDialog />
    
    <!-- Header -->
    <div class="mb-4">
      <h2 class="text-2xl font-bold text-gray-800 mb-2">Quản lý Đơn vị Tổ chức</h2>
      <Breadcrumb :model="breadcrumbItems" />
    </div>

    <!-- Main Content -->
    <Splitter style="height: 600px">
      <!-- Tree Panel -->
      <SplitterPanel :size="30" class="p-3">
        <Card>
          <template #title>
            <div class="flex justify-between items-center">
              <span>Cây Tổ chức</span>
              <Button 
                icon="pi pi-refresh" 
                size="small" 
                text 
                @click="refreshTree"
                :loading="store.loading"
              />
            </div>
          </template>
          <template #content>
            <Tree 
              v-model:selectionKeys="selectedTreeKeys"
              :value="treeNodes"
              selectionMode="single"
              @node-select="onTreeNodeSelect"
              class="w-full"
            >
              <template #default="{ node }">
                <div class="flex items-center gap-2">
                  <i class="pi pi-sitemap text-blue-500"></i>
                  <span>{{ node.label }}</span>
                  <Tag 
                    v-if="node.data.code" 
                    :value="node.data.code" 
                    severity="info" 
                    size="small"
                  />
                </div>
              </template>
            </Tree>
          </template>
        </Card>
      </SplitterPanel>

      <!-- Data Table Panel -->
      <SplitterPanel :size="70" class="p-3">
        <Card>
          <template #title>
            Danh sách Đơn vị
          </template>
          <template #content>
            <!-- Toolbar -->
            <Toolbar class="mb-4">
              <template #start>
                <Button 
                  label="Thêm mới" 
                  icon="pi pi-plus" 
                  @click="openDialog()"
                  class="mr-2"
                />
                <Button 
                  label="Làm mới" 
                  icon="pi pi-refresh" 
                  outlined 
                  @click="refreshData"
                  :loading="store.loading"
                />
              </template>
              <template #end>
                <span class="p-input-icon-left">
                  <i class="pi pi-search" />
                  <InputText 
                    v-model="filters.filter" 
                    placeholder="Tìm kiếm..." 
                    @keyup.enter="searchUnits"
                    class="w-64"
                  />
                </span>
              </template>
            </Toolbar>

            <!-- Data Table -->
            <DataTable
              v-model:selection="selectedUnits"
              :value="store.units"
              :loading="store.loading"
              paginator
              :rows="pageSize"
              :totalRecords="store.totalRecords"
              lazy
              @page="onPage"
              @sort="onSort"
              dataKey="id"
              class="p-datatable-gridlines"
              showGridlines
              stripedRows
            >
              <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
              
              <Column field="displayName" header="Tên hiển thị" sortable>
                <template #body="slotProps">
                  <div class="flex items-center gap-2">
                    <i class="pi pi-sitemap text-blue-500"></i>
                    <strong>{{ slotProps.data.displayName }}</strong>
                  </div>
                </template>
              </Column>
              
              <Column field="name" header="Tên" sortable></Column>
              
              <Column field="code" header="Mã" sortable>
                <template #body="slotProps">
                  <Tag :value="slotProps.data.code" severity="info" />
                </template>
              </Column>
              
              <Column field="parentName" header="Đơn vị cha">
                <template #body="slotProps">
                  <span v-if="slotProps.data.parentName" class="text-gray-600">
                    {{ slotProps.data.parentName }}
                  </span>
                  <Tag v-else value="Gốc" severity="success" />
                </template>
              </Column>
              
              <Column field="description" header="Mô tả">
                <template #body="slotProps">
                  <span class="text-gray-600">
                    {{ slotProps.data.description || '-' }}
                  </span>
                </template>
              </Column>
              
              <Column header="Thao tác" style="width: 120px">
                <template #body="slotProps">
                  <div class="flex gap-1">
                    <Button 
                      icon="pi pi-pencil" 
                      size="small" 
                      text 
                      @click="openDialog(slotProps.data)"
                      v-tooltip="'Sửa'"
                    />
                    <Button 
                      icon="pi pi-trash" 
                      size="small" 
                      text 
                      severity="danger" 
                      @click="confirmDelete(slotProps.data)"
                      v-tooltip="'Xóa'"
                    />
                  </div>
                </template>
              </Column>
            </DataTable>
          </template>
        </Card>
      </SplitterPanel>
    </Splitter>

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
          <Textarea 
            id="description"
            v-model="form.description" 
            rows="3"
            placeholder="Nhập mô tả"
          />
        </div>
      </form>

      <template #footer>
        <Button label="Hủy" icon="pi pi-times" text @click="closeDialog" />
        <Button 
          label="Lưu" 
          icon="pi pi-check" 
          @click="submitForm"
          :loading="store.loading"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import { useOrganizationUnitStore } from '@/stores/organizationUnit'

// Composables
const toast = useToast()
const confirm = useConfirm()
const store = useOrganizationUnitStore()

// Reactive data
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
  parentId: null
})

const formErrors = reactive({
  name: '',
  displayName: ''
})

const filters = reactive({
  filter: '',
  sorting: 'code'
})

const breadcrumbItems = ref([
  { label: 'Trang chủ', icon: 'pi pi-home' },
  { label: 'Quản lý tổ chức' }
])

// Computed
const dialogTitle = computed(() => 
  editingUnit.value ? 'Sửa Đơn vị Tổ chức' : 'Thêm Đơn vị Tổ chức'
)

const treeNodes = computed(() => {
  return convertToTreeNodes(store.tree)
})

const treeSelectOptions = computed(() => {
  return store.convertToTreeSelectOptions(store.tree)
})

// Methods
function convertToTreeNodes(treeData) {
  return treeData.map(item => ({
    key: item.id,
    label: item.displayName,
    data: item,
    children: item.children?.length > 0 ? convertToTreeNodes(item.children) : []
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
      parentId: form.parentId || null
    }

    if (editingUnit.value) {
      await store.updateUnit(editingUnit.value.id, data)
      toast.add({
        severity: 'success',
        summary: 'Thành công',
        detail: 'Cập nhật đơn vị thành công',
        life: 3000
      })
    } else {
      await store.createUnit(data)
      toast.add({
        severity: 'success',
        summary: 'Thành công', 
        detail: 'Thêm đơn vị thành công',
        life: 3000
      })
    }

    closeDialog()
  } catch (error) {
    console.error('Submit error:', error)
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: error.response?.data?.error?.message || 'Có lỗi xảy ra',
      life: 5000
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

async function confirmDelete(unit) {
  try {
    const canDelete = await store.canDeleteUnit(unit.id)
    
    if (!canDelete) {
      toast.add({
        severity: 'warn',
        summary: 'Cảnh báo',
        detail: 'Không thể xóa đơn vị có đơn vị con',
        life: 3000
      })
      return
    }

    confirm.require({
      message: `Bạn có chắc muốn xóa đơn vị "${unit.displayName}"?`,
      header: 'Xác nhận xóa',
      icon: 'pi pi-exclamation-triangle',
      rejectClass: 'p-button-secondary p-button-outlined',
      rejectLabel: 'Hủy',
      acceptLabel: 'Xóa',
      accept: async () => {
        try {
          await store.deleteUnit(unit.id)
          toast.add({
            severity: 'success',
            summary: 'Thành công',
            detail: 'Xóa đơn vị thành công',
            life: 3000
          })
        } catch (error) {
          console.error('Delete error:', error)
          toast.add({
            severity: 'error',
            summary: 'Lỗi',
            detail: 'Có lỗi khi xóa đơn vị',
            life: 5000
          })
        }
      }
    })
  } catch (error) {
    console.error('Can delete check error:', error)
  }
}

function onTreeNodeSelect(node) {
  // Optional: Filter table by selected tree node
  console.log('Selected tree node:', node)
}

async function onPage(event) {
  currentPage.value = event.page
  await loadUnits({
    skipCount: event.first,
    maxResultCount: event.rows
  })
}

async function onSort(event) {
  filters.sorting = event.sortField + (event.sortOrder === -1 ? ' desc' : '')
  await loadUnits()
}

async function searchUnits() {
  await loadUnits()
}

async function loadUnits(params = {}) {
  const requestParams = {
    skipCount: currentPage.value * pageSize.value,
    maxResultCount: pageSize.value,
    sorting: filters.sorting,
    filter: filters.filter,
    ...params
  }
  await store.fetchUnits(requestParams)
}

async function refreshData() {
  await Promise.all([
    loadUnits(),
    store.fetchTree()
  ])
}

async function refreshTree() {
  await store.fetchTree()
}

// Lifecycle
onMounted(async () => {
  await refreshData()
})

// Watch for form name changes to auto-fill displayName
watch(() => form.name, (newValue) => {
  if (!form.displayName && newValue) {
    form.displayName = newValue
  }
})
</script>

<style scoped>
.field {
  margin-bottom: 1rem;
}

.p-error {
  color: #e24c4c;
  font-size: 0.875rem;
}

.p-datatable .p-datatable-tbody > tr > td {
  padding: 0.75rem;
}

.space-y-4 > * + * {
  margin-top: 1rem;
}
</style>
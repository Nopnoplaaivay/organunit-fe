<template>
  <div class="container-app">
    <div class="card">
      <div class="card-header">
        <h1 class="text-xl font-semibold">Cây tổ chức</h1>
        <div class="flex gap-2">
          <Button @click="refreshTree" icon="pi pi-refresh" label="Làm mới" outlined />
          <Button @click="openCreate" icon="pi pi-plus" label="Thêm mới" />
        </div>
      </div>
      <div class="card-body">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Tree Panel -->
          <div class="lg:col-span-2">
            <div class="tree-container">
              <Tree
                v-model:selectionKeys="selectedKeys"
                :value="treeNodes"
                :loading="loading"
                selectionMode="single"
                @nodeSelect="onNodeSelect"
                @nodeUnselect="onNodeUnselect"
                class="w-full"
              >
                <template #default="{ node }">
                  <div class="flex items-center justify-between w-full">
                    <div class="flex items-center gap-2">
                      <span class="font-medium">{{ node.label }}</span>
                      <span v-if="node.data?.code" class="text-sm text-gray-500"
                        >({{ node.data.code }})</span
                      >
                    </div>
                    <div class="flex gap-1" @click.stop>
                      <Button
                        @click="openCreateChild(node.data)"
                        icon="pi pi-plus"
                        size="small"
                        text
                        severity="success"
                        v-tooltip="'Thêm con'"
                      />
                      <Button
                        @click="openEdit(node.data)"
                        icon="pi pi-pencil"
                        size="small"
                        text
                        v-tooltip="'Chỉnh sửa'"
                      />
                      <Button
                        @click="confirmDelete(node.data)"
                        icon="pi pi-trash"
                        size="small"
                        text
                        class="text-red-600 hover:text-red-800 hover:bg-red-50"
                        v-tooltip="'Xóa'"
                      />
                    </div>
                  </div>
                </template>
              </Tree>

              <!-- Empty state -->
              <div
                v-if="!loading && (!treeNodes || treeNodes.length === 0)"
                class="text-center py-8"
              >
                <i class="pi pi-sitemap text-4xl text-gray-400 mb-4"></i>
                <p class="text-gray-500 mb-4">Chưa có đơn vị tổ chức nào</p>
                <Button @click="openCreate" icon="pi pi-plus" label="Tạo đơn vị đầu tiên" />
              </div>
            </div>
          </div>

          <!-- Detail Panel -->
          <div class="lg:col-span-1">
            <div class="detail-panel">
              <div v-if="selectedUnit" class="space-y-4">
                <div class="border-b pb-4">
                  <h3 class="text-lg font-semibold mb-2">
                    {{ selectedUnit.displayName || selectedUnit.name }}
                  </h3>
                  <div class="space-y-2 text-sm">
                    <div><strong>Mã:</strong> {{ selectedUnit.code }}</div>
                    <div><strong>Tên:</strong> {{ selectedUnit.name }}</div>
                    <div v-if="selectedUnit.displayName !== selectedUnit.name">
                      <strong>Tên hiển thị:</strong> {{ selectedUnit.displayName }}
                    </div>
                    <div v-if="selectedUnit.description">
                      <strong>Mô tả:</strong> {{ selectedUnit.description }}
                    </div>
                  </div>
                </div>

                <!-- Actions -->
                <div class="space-y-2">
                  <Button
                    @click="openCreateChild(selectedUnit)"
                    icon="pi pi-plus"
                    label="Thêm đơn vị con"
                    class="w-full"
                    outlined
                  />
                  <Button
                    @click="openEdit(selectedUnit)"
                    icon="pi pi-pencil"
                    label="Chỉnh sửa"
                    class="w-full"
                    outlined
                  />
                  <Button
                    @click="confirmDelete(selectedUnit)"
                    icon="pi pi-trash"
                    label="Xóa"
                    severity="danger"
                    class="w-full"
                    outlined
                  />
                </div>

                <!-- Statistics -->
                <div v-if="unitStats" class="border-t pt-4">
                  <h4 class="font-medium mb-2">Thống kê</h4>
                  <div class="grid grid-cols-2 gap-2 text-sm">
                    <div class="bg-blue-50 p-2 rounded">
                      <div class="text-blue-600 font-medium">{{ unitStats.childrenCount }}</div>
                      <div class="text-blue-500">Đơn vị con</div>
                    </div>
                    <div class="bg-green-50 p-2 rounded">
                      <div class="text-green-600 font-medium">{{ unitStats.descendantsCount }}</div>
                      <div class="text-green-500">Tổng cấp dưới</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- No selection state -->
              <div v-else class="text-center py-8">
                <i class="pi pi-info-circle text-3xl text-gray-400 mb-4"></i>
                <p class="text-gray-500">Chọn một đơn vị để xem chi tiết</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Dialog -->
    <Dialog
      v-model:visible="dialogVisible"
      :header="dialogMode === 'create' ? 'Thêm mới đơn vị' : 'Chỉnh sửa đơn vị'"
      modal
      style="width: 500px"
    >
      <div class="space-y-4">
        <div>
          <label class="block mb-2 font-medium">Tên *</label>
          <InputText
            v-model="form.name"
            :class="{ 'p-invalid': errors.name }"
            class="w-full"
            placeholder="Nhập tên đơn vị"
          />
          <small v-if="errors.name" class="p-error">{{ errors.name }}</small>
        </div>

        <div>
          <label class="block mb-2 font-medium">Mã *</label>
          <InputText
            v-model="form.code"
            :class="{ 'p-invalid': errors.code }"
            class="w-full"
            placeholder="Nhập mã đơn vị"
          />
          <small v-if="errors.code" class="p-error">{{ errors.code }}</small>
        </div>

        <div>
          <label class="block mb-2 font-medium">Tên hiển thị</label>
          <InputText
            v-model="form.displayName"
            class="w-full"
            placeholder="Nhập tên hiển thị (tự động từ tên nếu để trống)"
          />
        </div>

        <div>
          <label class="block mb-2 font-medium">Mô tả</label>
          <Textarea
            v-model="form.description"
            class="w-full"
            rows="3"
            placeholder="Nhập mô tả cho đơn vị"
          />
        </div>

        <div v-if="parentUnit">
          <label class="block mb-2 font-medium">Đơn vị cha</label>
          <div class="p-3 bg-gray-50 rounded border">
            <i class="pi pi-sitemap mr-2"></i>
            {{ parentUnit.displayName || parentUnit.name }} ({{ parentUnit.code }})
          </div>
        </div>
      </div>

      <template #footer>
        <Button @click="dialogVisible = false" label="Hủy" text />
        <Button @click="submit" label="Lưu" :loading="submitting" />
      </template>
    </Dialog>

    <Toast />
    <ConfirmDialog />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import { useOrganizationUnitStore } from '@/stores/organizationUnit'

const store = useOrganizationUnitStore()
const toast = useToast()
const confirm = useConfirm()

// State
const treeNodes = ref([])
const selectedKeys = ref({})
const selectedUnit = ref(null)
const loading = ref(false)
const submitting = ref(false)

// Dialog state
const dialogVisible = ref(false)
const dialogMode = ref('create') // 'create' or 'edit'
const parentUnit = ref(null)

// Form
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

// Computed
const unitStats = computed(() => {
  if (!selectedUnit.value) return null

  // Calculate children and descendants count
  const calculateStats = (unit, allUnits) => {
    const children = allUnits.filter((u) => u.parentId === unit.id)
    let descendantsCount = children.length

    children.forEach((child) => {
      descendantsCount += calculateStats(child, allUnits).descendantsCount
    })

    return {
      childrenCount: children.length,
      descendantsCount,
    }
  }

  return calculateStats(selectedUnit.value, store.units)
})

// Methods
async function loadTree() {
  loading.value = true
  try {
    await store.fetchTree()
    treeNodes.value = convertToTreeNodes(store.tree)
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Lỗi tải dữ liệu',
      detail: error.message || 'Không thể tải cây tổ chức',
      life: 3000,
    })
  } finally {
    loading.value = false
  }
}

function convertToTreeNodes(data) {
  if (!data || !Array.isArray(data)) return []

  return data.map((item) => ({
    key: item.id,
    label: item.displayName || item.name,
    data: item,
    icon: item.children?.length > 0 ? 'pi pi-folder' : 'pi pi-file',
    children: item.children?.length > 0 ? convertToTreeNodes(item.children) : [],
  }))
}

function onNodeSelect(event) {
  selectedUnit.value = event.node.data
}

function onNodeUnselect() {
  selectedUnit.value = null
}

function refreshTree() {
  selectedKeys.value = {}
  selectedUnit.value = null
  loadTree()
}

function openCreate() {
  dialogMode.value = 'create'
  parentUnit.value = null
  resetForm()
  dialogVisible.value = true
}

function openCreateChild(parent) {
  dialogMode.value = 'create'
  parentUnit.value = parent
  resetForm()
  form.parentId = parent.id
  dialogVisible.value = true
}

function openEdit(unit) {
  dialogMode.value = 'edit'
  parentUnit.value = null
  Object.assign(form, {
    id: unit.id,
    name: unit.name,
    code: unit.code,
    displayName: unit.displayName || '',
    description: unit.description || '',
    parentId: unit.parentId,
  })
  clearErrors()
  dialogVisible.value = true
}

function resetForm() {
  Object.assign(form, {
    id: null,
    name: '',
    code: '',
    displayName: '',
    description: '',
    parentId: null,
  })
  clearErrors()
}

function clearErrors() {
  Object.assign(errors, {
    name: '',
    code: '',
  })
}

function validate() {
  clearErrors()

  if (!form.name.trim()) {
    errors.name = 'Tên là bắt buộc'
  }

  if (!form.code.trim()) {
    errors.code = 'Mã là bắt buộc'
  }

  return !errors.name && !errors.code
}

async function submit() {
  if (!validate()) return

  submitting.value = true
  try {
    if (dialogMode.value === 'create') {
      await store.createUnit(form)
      toast.add({
        severity: 'success',
        summary: 'Thành công',
        detail: 'Đã tạo đơn vị mới',
        life: 2000,
      })
    } else {
      await store.updateUnit(form.id, form)
      toast.add({
        severity: 'success',
        summary: 'Thành công',
        detail: 'Đã cập nhật đơn vị',
        life: 2000,
      })
    }

    dialogVisible.value = false
    await loadTree()

    // Reselect the unit if editing
    if (dialogMode.value === 'edit') {
      selectedKeys.value = { [form.id]: true }
      selectedUnit.value = store.units.find((u) => u.id === form.id)
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: error.message || 'Không thể lưu đơn vị',
      life: 3000,
    })
  } finally {
    submitting.value = false
  }
}

function confirmDelete(unit) {
  confirm.require({
    message: `Bạn có chắc chắn muốn xóa đơn vị "${unit.displayName || unit.name}"?\n\nLưu ý: Việc xóa đơn vị cha sẽ xóa tất cả các đơn vị con.`,
    header: 'Xác nhận xóa',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    acceptLabel: 'Xóa',
    rejectLabel: 'Hủy',
    accept: async () => {
      try {
        await store.deleteUnit(unit.id)
        toast.add({
          severity: 'success',
          summary: 'Thành công',
          detail: 'Đã xóa đơn vị',
          life: 2000,
        })

        // Clear selection if deleted unit was selected
        if (selectedUnit.value?.id === unit.id) {
          selectedKeys.value = {}
          selectedUnit.value = null
        }

        await loadTree()
      } catch (error) {
        toast.add({
          severity: 'error',
          summary: 'Lỗi',
          detail: error.message || 'Không thể xóa đơn vị',
          life: 3000,
        })
      }
    },
  })
}

// Auto-generate displayName from name
watch(
  () => form.name,
  (newName) => {
    if (dialogMode.value === 'create' && !form.displayName) {
      form.displayName = newName
    }
  },
)

// Load data on mount
onMounted(() => {
  loadTree()
})
</script>

<style scoped>
.tree-container {
  min-height: 400px;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
  background-color: white;
}

.detail-panel {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
  background-color: white;
  min-height: 400px;
}

/* Tree styling */
:deep(.p-tree) {
  background: transparent !important;
  border: none !important;
}

:deep(.p-tree .p-tree-container .p-treenode .p-treenode-content) {
  padding: 0.5rem !important;
  border-radius: 0.375rem !important;
  margin-bottom: 0.25rem !important;
}

:deep(.p-tree .p-tree-container .p-treenode .p-treenode-content:hover) {
  background-color: #f3f4f6 !important;
}

:deep(.p-tree .p-tree-container .p-treenode .p-treenode-content.p-highlight) {
  background-color: #dbeafe !important;
  color: #1e40af !important;
}

/* Dialog styling */
:deep(.p-dialog) {
  background-color: white !important;
}

:deep(.p-dialog .p-dialog-header) {
  background-color: white !important;
  border-bottom: 1px solid #e5e7eb !important;
}
</style>

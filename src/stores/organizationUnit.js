import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { organizationUnitService } from '@/services/organizationUnitService'

export const useOrganizationUnitStore = defineStore('organizationUnit', () => {
  // State
  const units = ref([])
  const tree = ref([])
  const selectedUnit = ref(null)
  const loading = ref(false)
  const totalRecords = ref(0)

  // Getters
  const getUnitById = computed(() => {
    return (id) => units.value.find(unit => unit.id === id)
  })

  const getRootUnits = computed(() => {
    return units.value.filter(unit => !unit.parentId)
  })

  const getChildrenOf = computed(() => {
    return (parentId) => units.value.filter(unit => unit.parentId === parentId)
  })

  // Actions
  async function fetchUnits(params = {}) {
    loading.value = true
    try {
      const defaultParams = {
        skipCount: 0,
        maxResultCount: 100,
        sorting: 'code',
        ...params
      }
      
      const result = await organizationUnitService.getList(defaultParams)
      units.value = result.items || []
      totalRecords.value = result.totalCount || 0
      return result
    } catch (error) {
      console.error('Error fetching units:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function fetchTree() {
    loading.value = true
    try {
      const result = await organizationUnitService.getTree()
      tree.value = result || []
      return result
    } catch (error) {
      console.error('Error fetching tree:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function fetchUnitById(id) {
    loading.value = true
    try {
      const result = await organizationUnitService.getById(id)
      selectedUnit.value = result
      return result
    } catch (error) {
      console.error('Error fetching unit:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function createUnit(data) {
    loading.value = true
    try {
      const result = await organizationUnitService.create(data)
      await fetchUnits() // Refresh list
      await fetchTree() // Refresh tree
      return result
    } catch (error) {
      console.error('Error creating unit:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function updateUnit(id, data) {
    loading.value = true
    try {
      const result = await organizationUnitService.update(id, data)
      await fetchUnits() // Refresh list
      await fetchTree() // Refresh tree
      return result
    } catch (error) {
      console.error('Error updating unit:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function deleteUnit(id) {
    loading.value = true
    try {
      await organizationUnitService.delete(id)
      await fetchUnits() // Refresh list
      await fetchTree() // Refresh tree
    } catch (error) {
      console.error('Error deleting unit:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function canDeleteUnit(id) {
    try {
      return await organizationUnitService.canDelete(id)
    } catch (error) {
      console.error('Error checking can delete:', error)
      return false
    }
  }

  // Convert tree data for TreeSelect component
  function convertToTreeSelectOptions(treeData) {
    return treeData.map(item => ({
      key: item.id,
      label: item.displayName,
      data: item,
      children: item.children?.length > 0 ? convertToTreeSelectOptions(item.children) : []
    }))
  }

  return {
    // State
    units,
    tree,
    selectedUnit,
    loading,
    totalRecords,
    
    // Getters
    getUnitById,
    getRootUnits,
    getChildrenOf,
    
    // Actions
    fetchUnits,
    fetchTree,
    fetchUnitById,
    createUnit,
    updateUnit,
    deleteUnit,
    canDeleteUnit,
    convertToTreeSelectOptions
  }
})
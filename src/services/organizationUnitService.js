import axios from 'axios'

// Cấu hình base URL cho API
const API_BASE = 'https://localhost:44324/api/app/organization-unit' // Thay đổi port theo project của bạn

// Cấu hình axios
const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
})

// Interceptor để handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error)
    return Promise.reject(error)
  },
)

export const organizationUnitService = {
  // Lấy danh sách phân trang
  async getList(params = {}) {
    const response = await apiClient.get('', { params })
    return response.data
  },

  // Lấy chi tiết một organization unit
  async getById(id) {
    const response = await apiClient.get(`/${id}`)
    return response.data
  },

  // Tạo mới organization unit
  async create(data) {
    const response = await apiClient.post('', data)
    return response.data
  },

  // Cập nhật organization unit
  async update(id, data) {
    const response = await apiClient.put(`/${id}`, data)
    return response.data
  },

  // Xóa organization unit
  async delete(id) {
    const response = await apiClient.delete(`/${id}`)
    return response.data
  },

  // Lấy cây phân cấp: https://localhost:44324/api/app/organization-unit/tree
  async getTree() {
    const response = await apiClient.get('/tree')
    return response.data
  },

  // Lấy danh sách con
  async getChildren(parentId = null) {
    const params = parentId ? { parentId } : {}
    const response = await apiClient.get('/children', { params })
    return response.data
  },

  // Kiểm tra có thể xóa không
  async canDelete(id) {
    const response = await apiClient.get(`/${id}/can-delete`)
    return response.data
  },
}

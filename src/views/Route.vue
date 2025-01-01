<template>
  <div class="bg-white p-4 rounded-lg border">
    <h2 class="text-primary fw-bold mb-4">Quản lý tuyến đường</h2>
    <button
      class="btn btn-success mb-3"
      @click="openModal(null)"
      style="background-color: white; color: green"
    >
      <i class="fas fa-plus"></i> Thêm tuyến đường
    </button>

    <table class="table table-striped table-bordered table-hover">
      <thead>
        <tr>
          <th class="title-table text-center" v-for="(label, column) in columns" :key="column">
            {{ label }}
          </th>
          <th class="title-table text-center action">Hành động</th>
        </tr>
        <tr>
          <th v-for="(label, column) in columns" :key="column + '-filter'">
            <input
              type="text"
              class="form-control form-control-sm"
              :placeholder="`Lọc ${label}`"
              v-model="filters[column]"
            />
          </th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="route in filteredRoutes" :key="route.routeId">
          <td v-for="(label, column) in columns" :key="column" class="text-center">
            {{ formatColumnValue(route[column], column) }}
          </td>
          <td class="action">
            <button class="btn btn-warning btn-sm me-2" @click="openModal(route)">
              <i class="fas fa-edit"></i>
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <CustomModal
      v-model="showModal"
      :title="currentRoute ? 'Chỉnh sửa tuyến đường' : 'Thêm tuyến đường'"
    >
      <form @submit.prevent="handleSubmit" novalidate>
        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label">Tên tuyến đường<span class="text-danger">*</span></label>
            <input
              type="text"
              class="form-control"
              v-model="form.routeName"
              :class="{ 'is-invalid': validationErrors.routeName }"
            />
            <div class="invalid-feedback" v-if="validationErrors.routeName">
              {{ validationErrors.routeName }}
            </div>
          </div>
          <div class="col-md-6 mb-3">
            <label class="form-label">Giá vé (VND)<span class="text-danger">*</span></label>
            <input
              type="number"
              class="form-control"
              v-model="form.ticketPrice"
              :class="{ 'is-invalid': validationErrors.ticketPrice }"
              min="0"
              step="1000"
            />
            <div class="invalid-feedback" v-if="validationErrors.ticketPrice">
              {{ validationErrors.ticketPrice }}
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label">Khoảng cách (km)<span class="text-danger">*</span></label>
            <input
              type="number"
              class="form-control"
              v-model="form.distance"
              :class="{ 'is-invalid': validationErrors.distance }"
              min="0"
              step="0.1"
            />
            <div class="invalid-feedback" v-if="validationErrors.distance">
              {{ validationErrors.distance }}
            </div>
          </div>
          <div class="col-md-6 mb-3">
            <label class="form-label"
              >Thời gian ước tính (phút)<span class="text-danger">*</span></label
            >
            <input
              type="number"
              class="form-control"
              v-model="form.estimatedDuration"
              :class="{ 'is-invalid': validationErrors.estimatedDuration }"
              min="0"
            />
            <div class="invalid-feedback" v-if="validationErrors.estimatedDuration">
              {{ validationErrors.estimatedDuration }}
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label">Trạng thái<span class="text-danger">*</span></label>
            <select
              class="form-control"
              v-model="form.routeStatus"
              :class="{ 'is-invalid': validationErrors.routeStatus }"
            >
              <option value="active">Hoạt động</option>
              <option value="inactive">Không hoạt động</option>
            </select>
            <div class="invalid-feedback" v-if="validationErrors.routeStatus">
              {{ validationErrors.routeStatus }}
            </div>
          </div>
        </div>
      </form>

      <template #footer>
        <button class="btn btn-secondary me-2" @click="closeModal">Hủy</button>
        <button class="btn btn-primary" @click="handleSubmit">
          {{ currentRoute ? 'Lưu thay đổi' : 'Thêm tuyến đường' }}
        </button>
      </template>
    </CustomModal>

    <Pagination
      :current-page="currentPage"
      :total-pages="totalPages"
      @page-change="handlePageChange"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { getAllRoutes, createRoute, updateRoute } from '../services/routeService'
import CustomModal from '../components/Modal.vue'
import Pagination from '@/components/Pagination.vue'

// Add pagination state
const currentPage = ref(0)
const pageSize = ref(10)
const totalPages = ref(0)
// Reactive state
const routes = ref([])
const showModal = ref(false)
const currentRoute = ref(null)
const filters = ref({})
const validationErrors = ref({})

// Columns definition
const columns = {
  routeId: 'ID Tuyến đường',
  routeName: 'Tên tuyến đường',
  ticketPrice: 'Giá vé',
  distance: 'Khoảng cách (km)',
  estimatedDuration: 'Thời gian ước tính (phút)',
  routeStatus: 'Trạng thái',
}

// Initial form state
const form = ref({
  routeName: '',
  ticketPrice: null,
  distance: null,
  estimatedDuration: null,
  routeStatus: 'active',
})

const validateForm = () => {
  validationErrors.value = {}
  let isValid = true

  if (!form.value.routeName.trim()) {
    validationErrors.value.routeName = 'Tên tuyến đường không được để trống'
    isValid = false
  } else if (form.value.routeName.length < 5 || form.value.routeName.length > 100) {
    validationErrors.value.routeName = 'Tên tuyến đường phải từ 5-100 ký tự'
    isValid = false
  }

  if (!form.value.ticketPrice || form.value.ticketPrice <= 0) {
    validationErrors.value.ticketPrice = 'Giá vé phải lớn hơn 0'
    isValid = false
  }

  if (!form.value.distance || form.value.distance <= 0) {
    validationErrors.value.distance = 'Khoảng cách phải lớn hơn 0'
    isValid = false
  }

  if (!form.value.estimatedDuration || form.value.estimatedDuration <= 0) {
    validationErrors.value.estimatedDuration = 'Thời gian ước tính phải lớn hơn 0'
    isValid = false
  }

  if (!form.value.routeStatus) {
    validationErrors.value.routeStatus = 'Trạng thái không được để trống'
    isValid = false
  }

  return isValid
}

// Format column values
const formatColumnValue = (value, column) => {
  if (column === 'routeStatus') {
    const statusMap = {
      active: 'Hoạt động',
      inactive: 'Không hoạt động',
    }
    return statusMap[value] || value
  }

  if (column === 'ticketPrice') {
    return value ? value.toLocaleString('vi-VN') + ' VND' : ''
  }

  if (column === 'distance') {
    return value ? value.toFixed(1) : ''
  }

  return value || ''
}

// Computed filtered routes
const filteredRoutes = computed(() => {
  return routes.value.filter((route) => {
    return Object.entries(filters.value).every(([key, value]) => {
      if (!value) return true
      const routeValue = route[key]
      return routeValue?.toString().toLowerCase().includes(value.toLowerCase())
    })
  })
})

// Fetch routes
const fetchRoutes = async () => {
  try {
    const response = await getAllRoutes(currentPage.value, pageSize.value)
    routes.value = response.content
    totalPages.value = response.totalPages
  } catch (error) {
    console.error('Error fetching routes:', error)
  }
}

const handlePageChange = async (page) => {
  currentPage.value = page
  await fetchRoutes()
}

// Modal methods
const openModal = (route = null) => {
  currentRoute.value = route
  validationErrors.value = {}

  if (route) {
    form.value = {
      routeName: route.routeName,
      ticketPrice: route.ticketPrice,
      distance: route.distance,
      estimatedDuration: route.estimatedDuration,
      routeStatus: route.routeStatus,
    }
  } else {
    form.value = {
      routeName: '',
      ticketPrice: null,
      distance: null,
      estimatedDuration: null,
      routeStatus: 'active',
    }
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  currentRoute.value = null
  validationErrors.value = {}
  form.value = {
    routeName: '',
    ticketPrice: null,
    distance: null,
    estimatedDuration: null,
    routeStatus: 'active',
  }
}

// Submit handler
const handleSubmit = async () => {
  try {
    if (!validateForm()) {
      return
    }

    const routeData = {
      routeName: form.value.routeName.trim(),
      ticketPrice: parseInt(form.value.ticketPrice),
      distance: parseFloat(form.value.distance),
      estimatedDuration: parseInt(form.value.estimatedDuration),
      routeStatus: form.value.routeStatus,
    }

    if (currentRoute.value) {
      await updateRoute(currentRoute.value.routeId, routeData)
    } else {
      await createRoute(routeData)
    }

    await fetchRoutes()
    closeModal()
  } catch (error) {
    console.error('Error saving route:', error)
    alert('Có lỗi xảy ra khi lưu thông tin!')
  }
}

// Fetch routes on component mount
onMounted(fetchRoutes)
</script>

<style scoped>
.border {
  border-radius: 10px;
  margin: 30px;
  box-shadow: 5px 5px 5px rgba(0, 0, 0, 0.1);
}

.title-table {
  background-color: #83c3ff;
  color: white;
}

.action {
  width: 40px;
}
</style>

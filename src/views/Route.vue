<template>
  <div class="border bg-white p-4 rounded-lg">
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
            <button class="btn btn-danger btn-sm" @click="handleDelete(route.routeId)">
              <i class="fas fa-trash-alt"></i>
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <CustomModal
      v-model="showModal"
      :title="currentRoute ? 'Chỉnh sửa tuyến đường' : 'Thêm tuyến đường'"
    >
      <form @submit.prevent="handleSubmit">
        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label">Tên tuyến đường<span class="text-danger">*</span></label>
            <input type="text" class="form-control" v-model="form.routeName" required />
          </div>
          <div class="col-md-6 mb-3">
            <label class="form-label">Giá vé<span class="text-danger">*</span></label>
            <input
              type="number"
              class="form-control"
              v-model="form.ticketPrice"
              required
              min="0"
              step="1000"
            />
          </div>
        </div>

        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label">Khoảng cách (km)<span class="text-danger">*</span></label>
            <input
              type="number"
              class="form-control"
              v-model="form.distance"
              required
              min="0"
              step="0.1"
            />
          </div>
          <div class="col-md-6 mb-3">
            <label class="form-label"
              >Thời gian ước tính (phút)<span class="text-danger">*</span></label
            >
            <input
              type="number"
              class="form-control"
              v-model="form.estimatedDuration"
              required
              min="0"
            />
          </div>
        </div>

        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label">Trạng thái<span class="text-danger">*</span></label>
            <select class="form-control" v-model="form.routeStatus" required>
              <option value="active">Hoạt động</option>
              <option value="inactive">Không hoạt động</option>
            </select>
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
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { getAllRoutes, createRoute, updateRoute, deleteRoute } from '../services/routeService'
import CustomModal from '../components/Modal.vue'

// Reactive state
const routes = ref([])
const showModal = ref(false)
const currentRoute = ref(null)
const filters = ref({})

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

// Utility function to format column values
const formatColumnValue = (value, column) => {
  // Handle route status
  if (column === 'routeStatus') {
    const statusMap = {
      active: 'Hoạt động',
      inactive: 'Không hoạt động',
    }
    return statusMap[value] || value
  }

  // Handle ticket price
  if (column === 'ticketPrice') {
    return value ? value.toLocaleString('vi-VN') + ' VND' : ''
  }

  return value || ''
}

// Computed filtered routes
const filteredRoutes = computed(() => {
  return routes.value.filter((route) => {
    return Object.entries(filters.value).every(([key, value]) => {
      if (!value) return true
      const routeValue = route[key]
      return routeValue.toString().toLowerCase().includes(value.toLowerCase())
    })
  })
})

// Fetch routes
const fetchRoutes = async () => {
  try {
    routes.value = await getAllRoutes()
  } catch (error) {
    console.error('Error fetching routes:', error)
  }
}

// Modal methods
const openModal = (route = null) => {
  currentRoute.value = route
  form.value = route
    ? {
        routeName: route.routeName,
        ticketPrice: route.ticketPrice,
        distance: route.distance,
        estimatedDuration: route.estimatedDuration,
        routeStatus: route.routeStatus,
      }
    : {
        routeName: '',
        ticketPrice: null,
        distance: null,
        estimatedDuration: null,
        routeStatus: 'active',
      }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  currentRoute.value = null
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
    const routeData = { ...form.value }

    if (currentRoute.value) {
      await updateRoute(currentRoute.value.routeId, routeData)
    } else {
      await createRoute(routeData)
    }

    // Fetch updated routes and close modal in one step
    await fetchRoutes()
    closeModal()
  } catch (error) {
    console.error('Error saving route:', error)
    alert('Phải nhập đủ thông tin cần thiết!')
  }
}

// Delete handler
const handleDelete = async (routeId) => {
  try {
    await deleteRoute(routeId)
    await fetchRoutes()
  } catch (error) {
    console.error('Error deleting route:', error)
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
  width: 90px;
}
</style>

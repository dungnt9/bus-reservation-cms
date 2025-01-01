<template>
  <div class="bg-white p-4 rounded-lg border">
    <h2 class="text-primary fw-bold mb-4">Quản lý Phương tiện</h2>
    <button
      class="btn btn-success mb-3"
      @click="openModal(null)"
      style="background-color: white; color: green"
    >
      <i class="fas fa-plus"></i> Thêm phương tiện
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
        <tr v-for="vehicle in filteredVehicles" :key="vehicle.vehicleId">
          <td v-for="(label, column) in columns" :key="column" class="text-center">
            {{ formatColumnValue(vehicle[column], column) }}
          </td>
          <td class="action">
            <button class="btn btn-warning btn-sm me-2" @click="openModal(vehicle)">
              <i class="fas fa-edit"></i>
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <CustomModal
      v-model="showModal"
      :title="currentVehicle ? 'Chỉnh sửa phương tiện' : 'Thêm phương tiện'"
    >
      <form @submit.prevent="handleSubmit" novalidate>
        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label">Biển số xe<span class="text-danger">*</span></label>
            <input
              type="text"
              class="form-control"
              v-model="form.plateNumber"
              :class="{ 'is-invalid': validationErrors.plateNumber }"
            />
            <div class="invalid-feedback" v-if="validationErrors.plateNumber">
              {{ validationErrors.plateNumber }}
            </div>
          </div>
          <div class="col-md-6 mb-3">
            <label class="form-label">Số chỗ ngồi<span class="text-danger">*</span></label>
            <input
              type="number"
              class="form-control"
              v-model="form.seatCapacity"
              disabled
              value="45"
            />
          </div>
        </div>

        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label">Trạng thái<span class="text-danger">*</span></label>
            <select
              class="form-control"
              v-model="form.vehicleStatus"
              :class="{ 'is-invalid': validationErrors.vehicleStatus }"
            >
              <option value="active">Hoạt động</option>
              <option value="maintenance">Bảo dưỡng</option>
              <option value="retired">Ngừng hoạt động</option>
            </select>
            <div class="invalid-feedback" v-if="validationErrors.vehicleStatus">
              {{ validationErrors.vehicleStatus }}
            </div>
          </div>
        </div>
      </form>

      <template #footer>
        <button class="btn btn-secondary me-2" @click="closeModal">Hủy</button>
        <button class="btn btn-primary" @click="handleSubmit">
          {{ currentVehicle ? 'Lưu thay đổi' : 'Thêm phương tiện' }}
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
import { getAllVehicles, createVehicle, updateVehicle } from '../services/vehicleService'
import CustomModal from '../components/Modal.vue'
import Pagination from '@/components/Pagination.vue'

// Add pagination state
const currentPage = ref(0)
const pageSize = ref(10)
const totalPages = ref(0)

// Reactive state
const vehicles = ref([])
const showModal = ref(false)
const currentVehicle = ref(null)
const filters = ref({})
const validationErrors = ref({})

// Columns definition
const columns = {
  vehicleId: 'ID Phương tiện',
  plateNumber: 'Biển số xe',
  seatCapacity: 'Số chỗ ngồi',
  vehicleStatus: 'Trạng thái',
}

// Initial form state
const form = ref({
  plateNumber: '',
  seatCapacity: 45,
  vehicleStatus: 'active',
})

const validateForm = () => {
  validationErrors.value = {}
  let isValid = true

  if (!form.value.plateNumber.trim()) {
    validationErrors.value.plateNumber = 'Biển số xe không được để trống'
    isValid = false
  } else if (!/^[0-9A-Z-]{5,10}$/i.test(form.value.plateNumber.trim())) {
    validationErrors.value.plateNumber = 'Biển số xe không hợp lệ'
    isValid = false
  }

  // Số chỗ ngồi luôn là 45 nên không cần validate

  if (!form.value.vehicleStatus) {
    validationErrors.value.vehicleStatus = 'Trạng thái không được để trống'
    isValid = false
  }

  return isValid
}

// Format column values
const formatColumnValue = (value, column) => {
  if (column === 'vehicleStatus') {
    const statusMap = {
      active: 'Hoạt động',
      maintenance: 'Bảo dưỡng',
      retired: 'Ngừng hoạt động',
    }
    return statusMap[value] || value
  }

  return value || ''
}

// Computed filtered vehicles
const filteredVehicles = computed(() => {
  return vehicles.value.filter((vehicle) => {
    return Object.entries(filters.value).every(([key, value]) => {
      if (!value) return true
      const vehicleValue = vehicle[key]
      return vehicleValue?.toString().toLowerCase().includes(value.toLowerCase())
    })
  })
})

// Fetch vehicles
const fetchVehicles = async () => {
  try {
    const response = await getAllVehicles(currentPage.value, pageSize.value)
    vehicles.value = response.content
    totalPages.value = response.totalPages
  } catch (error) {
    console.error('Error fetching vehicles:', error)
  }
}

const handlePageChange = async (page) => {
  currentPage.value = page
  await fetchVehicles()
}

// Modal methods
const openModal = (vehicle = null) => {
  currentVehicle.value = vehicle
  validationErrors.value = {}

  if (vehicle) {
    form.value = {
      plateNumber: vehicle.plateNumber,
      seatCapacity: 45,
      vehicleStatus: vehicle.vehicleStatus,
    }
  } else {
    form.value = {
      plateNumber: '',
      seatCapacity: 45,
      vehicleStatus: 'active',
    }
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  currentVehicle.value = null
  validationErrors.value = {}
  form.value = {
    plateNumber: '',
    seatCapacity: 45,
    vehicleStatus: 'active',
  }
}

// Submit handler
const handleSubmit = async () => {
  try {
    if (!validateForm()) {
      return
    }

    const vehicleData = {
      plateNumber: form.value.plateNumber.trim(),
      seatCapacity: 45,
      vehicleStatus: form.value.vehicleStatus,
    }

    if (currentVehicle.value) {
      await updateVehicle(currentVehicle.value.vehicleId, vehicleData)
    } else {
      await createVehicle(vehicleData)
    }

    await fetchVehicles()
    closeModal()
  } catch (error) {
    console.error('Error saving vehicle:', error)
    alert('Có lỗi xảy ra khi lưu thông tin!')
  }
}

// Fetch vehicles on component mount
onMounted(fetchVehicles)
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

<template>
  <div class="border bg-white p-4 rounded-lg">
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
            <button class="btn btn-danger btn-sm" @click="handleDelete(vehicle.vehicleId)">
              <i class="fas fa-trash-alt"></i>
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <CustomModal
      v-model="showModal"
      :title="currentVehicle ? 'Chỉnh sửa phương tiện' : 'Thêm phương tiện'"
    >
      <form @submit.prevent="handleSubmit">
        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label">Biển số xe<span class="text-danger">*</span></label>
            <input type="text" class="form-control" v-model="form.plateNumber" required />
          </div>
          <div class="col-md-6 mb-3">
            <label class="form-label">Số chỗ ngồi<span class="text-danger">*</span></label>
            <input
              type="number"
              class="form-control"
              v-model="form.seatCapacity"
              required
              min="1"
            />
          </div>
        </div>

        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label">Trạng thái<span class="text-danger">*</span></label>
            <select class="form-control" v-model="form.vehicleStatus" required>
              <option value="active">Hoạt động</option>
              <option value="maintenance">Bảo dưỡng</option>
              <option value="retired">Ngừng hoạt động</option>
            </select>
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
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import {
  getAllVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} from '../services/vehicleService'
import CustomModal from '../components/Modal.vue'

// Reactive state
const vehicles = ref([])
const showModal = ref(false)
const currentVehicle = ref(null)
const filters = ref({})

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
  seatCapacity: null,
  vehicleStatus: 'active',
})

// Utility function to format column values
const formatColumnValue = (value, column) => {
  // Handle vehicle status
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
      return vehicleValue.toString().toLowerCase().includes(value.toLowerCase())
    })
  })
})

// Fetch vehicles
const fetchVehicles = async () => {
  try {
    vehicles.value = await getAllVehicles()
  } catch (error) {
    console.error('Error fetching vehicles:', error)
  }
}

// Modal methods
const openModal = (vehicle = null) => {
  currentVehicle.value = vehicle
  form.value = vehicle
    ? {
        plateNumber: vehicle.plateNumber,
        seatCapacity: vehicle.seatCapacity,
        vehicleStatus: vehicle.vehicleStatus,
      }
    : {
        plateNumber: '',
        seatCapacity: null,
        vehicleStatus: 'active',
      }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  currentVehicle.value = null
  form.value = {
    plateNumber: '',
    seatCapacity: null,
    vehicleStatus: 'active',
  }
}

// Submit handler
const handleSubmit = async () => {
  try {
    const vehicleData = { ...form.value }

    if (currentVehicle.value) {
      await updateVehicle(currentVehicle.value.vehicleId, vehicleData)
    } else {
      await createVehicle(vehicleData)
    }

    // Fetch updated vehicles and close modal in one step
    await fetchVehicles()
    closeModal()
  } catch (error) {
    console.error('Error saving vehicle:', error)
    alert('Phải nhập đủ thông tin cần thiết!')
  }
}

// Delete handler
const handleDelete = async (vehicleId) => {
  try {
    await deleteVehicle(vehicleId)
    await fetchVehicles()
  } catch (error) {
    console.error('Error deleting vehicle:', error)
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

<template>
  <div class="border bg-white p-4 rounded-lg">
    <h2 class="text-primary fw-bold mb-4">Quản lý thông tin tài xế</h2>
    <button
      class="btn btn-success mb-3"
      @click="openModal(null)"
      style="background-color: white; color: green"
    >
      <i class="fas fa-plus"></i> Thêm tài xế
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
        <tr v-for="driver in filteredDrivers" :key="driver.driverId">
          <td v-for="(label, column) in columns" :key="column" class="text-center">
            {{ formatColumnValue(getNestedValue(driver, column), column) }}
          </td>
          <td class="action">
            <button class="btn btn-warning btn-sm me-2" @click="openModal(driver)">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-danger btn-sm" @click="handleDelete(driver.driverId)">
              <i class="fas fa-trash-alt"></i>
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <CustomModal v-model="showModal" :title="currentDriver ? 'Chỉnh sửa tài xế' : 'Thêm tài xế'">
      <form @submit.prevent="handleSubmit">
        <!-- User Information Section -->
        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label">Họ và Tên<span class="text-danger">*</span></label>
            <input type="text" class="form-control" v-model="form.user.fullName" required />
          </div>
          <div class="col-md-6 mb-3">
            <label class="form-label">Số điện thoại<span class="text-danger">*</span></label>
            <input type="tel" class="form-control" v-model="form.user.phoneNumber" required />
          </div>
        </div>

        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label">Email</label>
            <input type="email" class="form-control" v-model="form.user.email" />
          </div>
          <div class="col-md-6 mb-3">
            <label class="form-label">Giới tính</label>
            <select class="form-control" v-model="form.user.gender">
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
              <option value="other">Khác</option>
            </select>
          </div>
        </div>

        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label">Địa chỉ</label>
            <input type="text" class="form-control" v-model="form.user.address" />
          </div>
          <div class="col-md-6 mb-3">
            <label class="form-label">Ngày sinh</label>
            <input
              type="date"
              class="form-control"
              v-model="form.user.dateOfBirth"
              :max="getMaxBirthDate()"
            />
          </div>
        </div>

        <!-- Driver License Section -->
        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label">Số bằng lái<span class="text-danger">*</span></label>
            <input type="text" class="form-control" v-model="form.licenseNumber" required />
          </div>
          <div class="col-md-6 mb-3">
            <label class="form-label">Hạng bằng<span class="text-danger">*</span></label>
            <select class="form-control" v-model="form.licenseClass" required>
              <option value="A1">A1</option>
              <option value="A2">A2</option>
              <option value="B1">B1</option>
              <option value="B2">B2</option>
              <option value="C">C</option>
              <option value="D">D</option>
              <option value="E">E</option>
            </select>
          </div>
        </div>

        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label"
              >Ngày hết hạn bằng lái<span class="text-danger">*</span></label
            >
            <input
              type="date"
              class="form-control"
              v-model="form.licenseExpiry"
              :min="form.licenseIssueDate"
              required
            />
          </div>
          <div class="col-md-6 mb-3">
            <label class="form-label">Trạng thái tài xế</label>
            <select class="form-control" v-model="form.driverStatus">
              <option value="available">Sẵn sàng</option>
              <option value="on_trip">Đang trong chuyến</option>
              <option value="off_duty">Nghỉ làm</option>
            </select>
          </div>
        </div>
      </form>

      <template #footer>
        <button class="btn btn-secondary me-2" @click="closeModal">Hủy</button>
        <button class="btn btn-primary" @click="handleSubmit">
          {{ currentDriver ? 'Lưu thay đổi' : 'Thêm tài xế' }}
        </button>
      </template>
    </CustomModal>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { getAllDrivers, createDriver, updateDriver, deleteDriver } from '../services/driverService'
import CustomModal from '../components/Modal.vue' // Import the custom modal component

// Reactive state
const drivers = ref([])
const showModal = ref(false)
const currentDriver = ref(null)
const filters = ref({})

// Columns definition
const columns = {
  driverId: 'ID Tài xế',
  'user.userId': 'ID Người dùng',
  'user.fullName': 'Tên đầy đủ',
  'user.phoneNumber': 'Số điện thoại',
  'user.email': 'Email',
  'user.password_hash': 'Password',
  'user.gender': 'Giới tính',
  'user.address': 'Địa chỉ',
  'user.dateOfBirth': 'Ngày sinh',
  licenseNumber: 'Số bằng lái',
  licenseClass: 'Hạng bằng',
  licenseExpiry: 'Ngày hết hạn bằng lái',
  driverStatus: 'Trạng thái',
}

const getMaxBirthDate = () => {
  const today = new Date()
  const minAge = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate())
  return minAge.toISOString().split('T')[0]
}

// Initial form state
const form = ref({
  user: {
    userId: null,
    fullName: '',
    phoneNumber: '',
    email: '',
    password_hash: '',
    gender: 'male',
    address: '',
    dateOfBirth: '',
    userRole: 'driver',
  },
  driverId: null,
  licenseNumber: '',
  licenseClass: '',
  licenseIssueDate: '',
  licenseExpiry: '',
  driverStatus: 'available',
  driverExperience: 0,
  notes: '',
})

// Utility function to format column values
const formatColumnValue = (value, column) => {
  // Handle date formatting
  if (
    column.includes('createdAt') ||
    column.includes('updatedAt') ||
    column === 'user.dateOfBirth' ||
    column === 'licenseExpiry'
  ) {
    return value ? new Date(value).toLocaleDateString('vi-VN') : ''
  }

  // Handle gender formatting
  if (column === 'user.gender') {
    const genderMap = {
      male: 'Nam',
      female: 'Nữ',
      other: 'Khác',
    }
    return genderMap[value] || value
  }

  // Handle driver status formatting
  if (column === 'driverStatus') {
    const statusMap = {
      available: 'Sẵn sàng',
      on_trip: 'Đang trong chuyến',
      off_duty: 'Nghỉ làm',
    }
    return statusMap[value] || value
  }

  return value || ''
}

// Computed filtered drivers
const filteredDrivers = computed(() => {
  return drivers.value.filter((driver) => {
    return Object.entries(filters.value).every(([key, value]) => {
      if (!value) return true
      const driverValue = getNestedValue(driver, key)
      return driverValue.toString().toLowerCase().includes(value.toLowerCase())
    })
  })
})

// Fetch drivers
const fetchDrivers = async () => {
  try {
    drivers.value = await getAllDrivers()
  } catch (error) {
    console.error('Error fetching drivers:', error)
  }
}

// Utility function to get nested object values
const getNestedValue = (obj, path) => {
  return path.split('.').reduce((o, key) => o?.[key], obj) || ''
}

// Modal methods
const openModal = (driver = null) => {
  currentDriver.value = driver
  form.value = driver
    ? {
        user: { ...driver.user },
        driverId: driver.driverId,
        licenseNumber: driver.licenseNumber,
        licenseClass: driver.licenseClass,
        licenseIssueDate: driver.licenseIssueDate,
        licenseExpiry: driver.licenseExpiry,
        driverStatus: driver.driverStatus,
        driverExperience: driver.driverExperience || 0,
        notes: driver.notes || '',
      }
    : {
        user: {
          fullName: '',
          phoneNumber: '',
          email: '',
          password_hash: '',
          gender: 'male',
          address: '',
          dateOfBirth: '',
          userRole: 'driver',
        },
        driverId: null,
        licenseNumber: '',
        licenseClass: '',
        licenseIssueDate: '',
        licenseExpiry: '',
        driverStatus: 'available',
        driverExperience: 0,
        notes: '',
      }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  currentDriver.value = null
  form.value = {
    user: {
      fullName: '',
      phoneNumber: '',
      email: '',
      password_hash: '',
      gender: 'male',
      address: '',
      dateOfBirth: '',
      userRole: 'driver',
    },
    driverId: null,
    licenseNumber: '',
    licenseClass: '',
    licenseIssueDate: '',
    licenseExpiry: '',
    driverStatus: 'available',
    driverExperience: 0,
    notes: '',
  }
}

// Submit handler
const handleSubmit = async () => {
  try {
    const driverData = {
      user: {
        ...form.value.user,
        userId: currentDriver.value?.user?.userId, // Use existing user ID if updating
        userRole: 'driver', // Explicitly set user role
      },
      driverId: currentDriver.value?.driverId,
      licenseNumber: form.value.licenseNumber,
      licenseClass: form.value.licenseClass,
      licenseExpiry: form.value.licenseExpiry,
      driverStatus: form.value.driverStatus,
    }

    if (currentDriver.value) {
      await updateDriver(currentDriver.value.driverId, driverData)
    } else {
      await createDriver(driverData)
    }

    // Fetch updated drivers and close modal in one step
    await fetchDrivers()
    closeModal()
  } catch (error) {
    console.error('Error saving driver:', error)
    // Optional: Add user-friendly error handling
    alert('Phải nhập đủ thông tin cần thiết!')
  }
}

// Delete handler
const handleDelete = async (driverId) => {
  try {
    await deleteDriver(driverId)
    await fetchDrivers()
  } catch (error) {
    console.error('Error deleting driver:', error)
  }
}

// Fetch drivers on component mount
onMounted(fetchDrivers)
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

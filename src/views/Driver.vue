<template>
  <div class="bg-white p-4 rounded-lg border">
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
            {{ formatColumnValue(driver[column], column) }}
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
      <form @submit.prevent="handleSubmit" novalidate>
        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label">Họ và Tên<span class="text-danger">*</span></label>
            <input
              type="text"
              class="form-control"
              v-model="form.user.fullName"
              :class="{ 'is-invalid': validationErrors.fullName }"
            />
            <div class="invalid-feedback" v-if="validationErrors.fullName">
              {{ validationErrors.fullName }}
            </div>
          </div>
          <div class="col-md-6 mb-3">
            <label class="form-label">Số điện thoại<span class="text-danger">*</span></label>
            <input
              type="tel"
              class="form-control"
              v-model="form.user.phoneNumber"
              :class="{ 'is-invalid': validationErrors.phoneNumber }"
            />
            <div class="invalid-feedback" v-if="validationErrors.phoneNumber">
              {{ validationErrors.phoneNumber }}
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label">Email</label>
            <input
              type="email"
              class="form-control"
              v-model="form.user.email"
              :class="{ 'is-invalid': validationErrors.email }"
            />
            <div class="invalid-feedback" v-if="validationErrors.email">
              {{ validationErrors.email }}
            </div>
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
            <input
              type="text"
              class="form-control"
              v-model="form.user.address"
              :class="{ 'is-invalid': validationErrors.address }"
            />
            <div class="invalid-feedback" v-if="validationErrors.address">
              {{ validationErrors.address }}
            </div>
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

        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label">Số bằng lái<span class="text-danger">*</span></label>
            <input
              type="text"
              class="form-control"
              v-model="form.licenseNumber"
              :class="{ 'is-invalid': validationErrors.licenseNumber }"
            />
            <div class="invalid-feedback" v-if="validationErrors.licenseNumber">
              {{ validationErrors.licenseNumber }}
            </div>
          </div>
          <div class="col-md-6 mb-3">
            <label class="form-label">Hạng bằng<span class="text-danger">*</span></label>
            <select
              class="form-control"
              v-model="form.licenseClass"
              :class="{ 'is-invalid': validationErrors.licenseClass }"
            >
              <option value="A1">A1</option>
              <option value="A2">A2</option>
              <option value="B1">B1</option>
              <option value="B2">B2</option>
              <option value="C">C</option>
              <option value="D">D</option>
              <option value="E">E</option>
            </select>
            <div class="invalid-feedback" v-if="validationErrors.licenseClass">
              {{ validationErrors.licenseClass }}
            </div>
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
              :class="{ 'is-invalid': validationErrors.licenseExpiry }"
            />
            <div class="invalid-feedback" v-if="validationErrors.licenseExpiry">
              {{ validationErrors.licenseExpiry }}
            </div>
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

    <Pagination
      :current-page="currentPage"
      :total-pages="totalPages"
      @page-change="handlePageChange"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { getAllDrivers, createDriver, updateDriver, deleteDriver } from '../services/driverService'
import CustomModal from '../components/Modal.vue'
import { validEmail, validPhone, validName, validAddress } from '../utils/validators'
import Pagination from '@/components/Pagination.vue'

// Add pagination state
const currentPage = ref(0)
const pageSize = ref(10)
const totalPages = ref(0)
const totalElements = ref(0)
// Reactive state
const drivers = ref([])
const showModal = ref(false)
const currentDriver = ref(null)
const filters = ref({})
const validationErrors = ref({})

// Columns definition
const columns = {
  driverId: 'ID Tài xế',
  userId: 'ID Người dùng',
  fullName: 'Tên đầy đủ',
  phoneNumber: 'Số điện thoại',
  email: 'Email',
  password_hash: 'Password',
  gender: 'Giới tính',
  address: 'Địa chỉ',
  dateOfBirth: 'Ngày sinh',
  licenseNumber: 'Số bằng lái',
  licenseClass: 'Hạng bằng',
  licenseExpiry: 'Ngày hết hạn bằng lái',
  driverStatus: 'Trạng thái',
}

// Initial form state
const form = ref({
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
  licenseNumber: '',
  licenseClass: '',
  licenseExpiry: '',
  driverStatus: 'available',
})

const validateForm = () => {
  validationErrors.value = {}
  let isValid = true

  if (!validName(form.value.user.fullName)) {
    validationErrors.value.fullName = 'Họ tên phải từ 2-100 ký tự và không chứa ký tự đặc biệt'
    isValid = false
  }

  if (!validPhone(form.value.user.phoneNumber)) {
    validationErrors.value.phoneNumber = 'Số điện thoại phải có đúng 10 chữ số'
    isValid = false
  }

  if (form.value.user.email && !validEmail(form.value.user.email)) {
    validationErrors.value.email = 'Email không hợp lệ'
    isValid = false
  }

  if (form.value.user.address && !validAddress(form.value.user.address)) {
    validationErrors.value.address = 'Địa chỉ không được chứa emoji và tối đa 255 ký tự'
    isValid = false
  }

  if (!form.value.licenseNumber) {
    validationErrors.value.licenseNumber = 'Số bằng lái không được để trống'
    isValid = false
  }

  if (!form.value.licenseClass) {
    validationErrors.value.licenseClass = 'Hạng bằng lái không được để trống'
    isValid = false
  }

  if (!form.value.licenseExpiry) {
    validationErrors.value.licenseExpiry = 'Ngày hết hạn bằng lái không được để trống'
    isValid = false
  }

  return isValid
}

const getMaxBirthDate = () => {
  const today = new Date()
  const minAge = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate())
  return minAge.toISOString().split('T')[0]
}

// Format column values
const formatColumnValue = (value, column) => {
  if (column === 'dateOfBirth' || column === 'licenseExpiry') {
    return value ? new Date(value).toLocaleDateString('vi-VN') : ''
  }

  if (column === 'gender') {
    const genderMap = {
      male: 'Nam',
      female: 'Nữ',
      other: 'Khác',
    }
    return genderMap[value] || value
  }

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
      const driverValue = driver[key]
      return driverValue?.toString().toLowerCase().includes(value.toLowerCase())
    })
  })
})

// Fetch drivers
const fetchDrivers = async () => {
  try {
    const response = await getAllDrivers(currentPage.value, pageSize.value)
    drivers.value = response.content
    totalPages.value = response.totalPages
    totalElements.value = response.totalElements
  } catch (error) {
    console.error('Error fetching drivers:', error)
  }
}

const handlePageChange = async (page) => {
  currentPage.value = page
  await fetchDrivers()
}

// Modal methods
const openModal = (driver = null) => {
  currentDriver.value = driver
  validationErrors.value = {}

  if (driver) {
    form.value = {
      user: {
        fullName: driver.fullName,
        phoneNumber: driver.phoneNumber,
        email: driver.email,
        password_hash: driver.password_hash,
        gender: driver.gender,
        address: driver.address,
        dateOfBirth: driver.dateOfBirth,
        userRole: 'driver',
      },
      licenseNumber: driver.licenseNumber,
      licenseClass: driver.licenseClass,
      licenseExpiry: driver.licenseExpiry,
      driverStatus: driver.driverStatus,
    }
  } else {
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
      licenseNumber: '',
      licenseClass: '',
      licenseExpiry: '',
      driverStatus: 'available',
    }
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  currentDriver.value = null
  validationErrors.value = {}
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
    licenseNumber: '',
    licenseClass: '',
    licenseExpiry: '',
    driverStatus: 'available',
  }
}

// Submit handler
const handleSubmit = async () => {
  try {
    if (!validateForm()) {
      return
    }

    const driverData = {
      user: {
        ...form.value.user,
        userId: currentDriver.value?.userId,
      },
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

    await fetchDrivers()
    closeModal()
  } catch (error) {
    console.error('Error saving driver:', error)
    alert('Phải nhập đủ thông tin cần thiết!')
  }
}

// Delete handler
const handleDelete = async (driverId) => {
  if (confirm('Bạn có chắc chắn muốn xóa tài xế này?')) {
    try {
      await deleteDriver(driverId)
      await fetchDrivers()
    } catch (error) {
      console.error('Error deleting driver:', error)
      alert('Có lỗi xảy ra khi xóa tài xế!')
    }
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

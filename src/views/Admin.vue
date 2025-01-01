<template>
  <div class="bg-white p-4 rounded-lg border">
    <h2 class="text-primary fw-bold mb-4">Quản lý thông tin quản trị viên</h2>
    <button
      class="btn btn-success mb-3"
      @click="openModal(null)"
      style="background-color: white; color: green"
    >
      <i class="fas fa-plus"></i> Thêm quản trị viên
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
            <template v-if="column === 'dateOfBirth'">
              <input
                type="date"
                class="form-control form-control-sm"
                :placeholder="`Lọc ${label}`"
                v-model="displayFilters[column]"
                :max="getCurrentDate()"
              />
            </template>
            <!-- Các cột khác giữ nguyên -->
            <template v-else>
              <input
                type="text"
                class="form-control form-control-sm"
                :placeholder="`Lọc ${label}`"
                v-model="displayFilters[column]"
              />
            </template>
          </th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="admin in filteredAdmins" :key="admin.adminId">
          <td v-for="(label, column) in columns" :key="column" class="text-center">
            {{ formatColumnValue(admin[column], column) }}
          </td>
          <td class="action">
            <button class="btn btn-warning btn-sm me-2" @click="openModal(admin)">
              <i class="fas fa-edit"></i>
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <CustomModal
      v-model="showModal"
      :title="currentAdmin ? 'Chỉnh sửa quản trị viên' : 'Thêm quản trị viên'"
    >
      <form @submit.prevent="handleSubmit" novalidate>
        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label">Họ và Tên<span class="text-danger">*</span></label>
            <input
              type="text"
              class="form-control"
              v-model="form.fullName"
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
              v-model="form.phoneNumber"
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
              v-model="form.email"
              :class="{ 'is-invalid': validationErrors.email }"
            />
            <div class="invalid-feedback" v-if="validationErrors.email">
              {{ validationErrors.email }}
            </div>
          </div>
          <div class="col-md-6 mb-3">
            <label class="form-label">Giới tính</label>
            <select class="form-control" v-model="form.gender">
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
              v-model="form.address"
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
              v-model="form.dateOfBirth"
              :max="getMaxBirthDate()"
            />
          </div>
        </div>
      </form>

      <template #footer>
        <button class="btn btn-secondary me-2" @click="closeModal">Hủy</button>
        <button class="btn btn-primary" @click="handleSubmit">
          {{ currentAdmin ? 'Lưu thay đổi' : 'Thêm quản trị viên' }}
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
import { ref, onMounted, computed, watch } from 'vue'
import { getAllAdmins, createAdmin, updateAdmin } from '../services/adminService'
import CustomModal from '../components/Modal.vue'
import { validEmail, validPhone, validName, validAddress } from '../utils/validators'
import Pagination from '@/components/Pagination.vue'

// Add pagination state
const currentPage = ref(0)
const pageSize = ref(10)
const totalPages = ref(0)
const totalElements = ref(0)

// Reactive state
const admins = ref([])
const showModal = ref(false)
const currentAdmin = ref(null)
const filters = ref({})
const displayFilters = ref({})
const validationErrors = ref({})

const getCurrentDate = () => {
  const today = new Date()
  return today.toISOString().split('T')[0]
}

// Columns definition - Updated to match the new API structure
const columns = {
  adminId: 'ID Quản trị viên',
  userId: 'ID Người dùng',
  fullName: 'Tên đầy đủ',
  phoneNumber: 'Số điện thoại',
  email: 'Email',
  password_hash: 'Password',
  gender: 'Giới tính',
  address: 'Địa chỉ',
  dateOfBirth: 'Ngày sinh',
}

// Initial form state - Updated to match the new API structure
const form = ref({
  fullName: '',
  phoneNumber: '',
  email: '',
  password_hash: '',
  gender: 'male',
  address: '',
  dateOfBirth: '',
  userRole: 'admin',
})

const debounce = (fn, delay) => {
  let timeoutId
  return (...args) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn.apply(this, args), delay)
  }
}

const validateForm = () => {
  validationErrors.value = {}
  let isValid = true

  if (!validName(form.value.fullName)) {
    validationErrors.value.fullName = 'Họ tên phải từ 2-100 ký tự và không chứa ký tự đặc biệt'
    isValid = false
  }

  if (!validPhone(form.value.phoneNumber)) {
    validationErrors.value.phoneNumber = 'Số điện thoại phải có đúng 10 chữ số'
    isValid = false
  }

  if (form.value.email && !validEmail(form.value.email)) {
    validationErrors.value.email = 'Email không hợp lệ'
    isValid = false
  }

  if (form.value.address && !validAddress(form.value.address)) {
    validationErrors.value.address = 'Địa chỉ không được chứa emoji và tối đa 255 ký tự'
    isValid = false
  }

  return isValid
}

const getMaxBirthDate = () => {
  const today = new Date()
  const minAge = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate())
  return minAge.toISOString().split('T')[0]
}

const genderMap = {
  nam: 'male',
  nữ: 'female',
  khác: 'other',
}

// Format column values
const formatColumnValue = (value, column) => {
  if (column === 'dateOfBirth') {
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

  return value || ''
}

// Computed filtered admins - Updated to work with flat structure
const filteredAdmins = computed(() => {
  return admins.value.filter((admin) => {
    return Object.entries(filters.value).every(([key, value]) => {
      if (!value) return true
      const adminValue = admin[key]
      return adminValue?.toString().toLowerCase().includes(value.toLowerCase())
    })
  })
})

// Fetch admins
const fetchAdmins = async () => {
  try {
    const response = await getAllAdmins(currentPage.value, pageSize.value, filters.value)
    admins.value = response.content
    totalPages.value = response.totalPages
    totalElements.value = response.totalElements
  } catch (error) {
    console.error('Error fetching admins:', error)
  }
}

const debouncedFetch = debounce(fetchAdmins, 300)

watch(
  displayFilters,
  (newDisplayFilters) => {
    const apiFilters = { ...newDisplayFilters }

    // Handle gender conversion
    if (apiFilters.gender) {
      const lowercaseGender = apiFilters.gender.toLowerCase()
      apiFilters.gender = genderMap[lowercaseGender] || apiFilters.gender
    }

    // Handle date conversion if needed
    if (apiFilters.dateOfBirth) {
      // Ensure the date is in the format expected by the API
      try {
        const date = new Date(apiFilters.dateOfBirth)
        apiFilters.dateOfBirth = date.toISOString().split('T')[0]
      } catch (error) {
        console.error('Invalid date:', error)
        delete apiFilters.dateOfBirth
      }
    }

    filters.value = apiFilters
    currentPage.value = 0
    debouncedFetch()
  },
  { deep: true },
)

const handlePageChange = async (page) => {
  currentPage.value = page
  await fetchAdmins()
}

// Modal methods
const openModal = (admin = null) => {
  currentAdmin.value = admin
  validationErrors.value = {}

  if (admin) {
    form.value = { ...admin }
  } else {
    form.value = {
      fullName: '',
      phoneNumber: '',
      email: '',
      password_hash: '',
      gender: 'male',
      address: '',
      dateOfBirth: '',
      userRole: 'admin',
    }
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  currentAdmin.value = null
  validationErrors.value = {}
  form.value = {
    fullName: '',
    phoneNumber: '',
    email: '',
    password_hash: '',
    gender: 'male',
    address: '',
    dateOfBirth: '',
    userRole: 'admin',
  }
}

// Submit handler
const handleSubmit = async () => {
  try {
    if (!validateForm()) {
      return
    }

    const adminData = {
      user: {
        fullName: form.value.fullName,
        phoneNumber: form.value.phoneNumber,
        email: form.value.email,
        password_hash: form.value.password_hash,
        gender: form.value.gender,
        address: form.value.address,
        dateOfBirth: form.value.dateOfBirth,
        userRole: 'admin',
      },
    }

    if (currentAdmin.value) {
      await updateAdmin(currentAdmin.value.adminId, adminData)
    } else {
      await createAdmin(adminData)
    }

    await fetchAdmins()
    closeModal()
  } catch (error) {
    console.error('Error saving admin:', error)
    alert('Có lỗi xảy ra khi lưu thông tin!')
  }
}

// Fetch admins on component mount
onMounted(fetchAdmins)
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

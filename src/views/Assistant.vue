<template>
  <div class="bg-white p-4 rounded-lg border">
    <h2 class="text-primary fw-bold mb-4">Quản lý thông tin phụ xe</h2>
    <button
      class="btn btn-success mb-3"
      @click="openModal(null)"
      style="background-color: white; color: green"
    >
      <i class="fas fa-plus"></i> Thêm phụ xe
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
        <tr v-for="assistant in filteredAssistants" :key="assistant.assistantId">
          <td v-for="(label, column) in columns" :key="column" class="text-center">
            {{ formatColumnValue(assistant[column], column) }}
          </td>
          <td class="action">
            <button class="btn btn-warning btn-sm me-2" @click="openModal(assistant)">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-danger btn-sm" @click="handleDelete(assistant.assistantId)">
              <i class="fas fa-trash-alt"></i>
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <CustomModal v-model="showModal" :title="currentAssistant ? 'Chỉnh sửa phụ xe' : 'Thêm phụ xe'">
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
            <label class="form-label">Trạng thái phụ xe</label>
            <select class="form-control" v-model="form.assistantStatus">
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
          {{ currentAssistant ? 'Lưu thay đổi' : 'Thêm phụ xe' }}
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
import {
  getAllAssistants,
  createAssistant,
  updateAssistant,
  deleteAssistant,
} from '../services/assistantService'
import CustomModal from '../components/Modal.vue'
import { validEmail, validPhone, validName, validAddress } from '../utils/validators'
import Pagination from '../components/Pagination.vue'

// Reactive state
const assistants = ref([])
const showModal = ref(false)
const currentAssistant = ref(null)
const filters = ref({})
const validationErrors = ref({})

const currentPage = ref(0)
const pageSize = ref(10)
const totalPages = ref(0)
const totalElements = ref(0)

// Columns definition
const columns = {
  assistantId: 'ID Phụ xe',
  userId: 'ID Người dùng',
  fullName: 'Tên đầy đủ',
  phoneNumber: 'Số điện thoại',
  email: 'Email',
  password_hash: 'Password',
  gender: 'Giới tính',
  address: 'Địa chỉ',
  dateOfBirth: 'Ngày sinh',
  assistantStatus: 'Trạng thái',
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
    userRole: 'assistant',
  },
  assistantStatus: 'available',
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

  return isValid
}

const getMaxBirthDate = () => {
  const today = new Date()
  const minAge = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate())
  return minAge.toISOString().split('T')[0]
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

  if (column === 'assistantStatus') {
    const statusMap = {
      available: 'Sẵn sàng',
      on_trip: 'Đang trong chuyến',
      off_duty: 'Nghỉ làm',
    }
    return statusMap[value] || value
  }

  return value || ''
}

// Computed filtered assistants
const filteredAssistants = computed(() => {
  return assistants.value.filter((assistant) => {
    return Object.entries(filters.value).every(([key, value]) => {
      if (!value) return true
      const assistantValue = assistant[key]
      return assistantValue?.toString().toLowerCase().includes(value.toLowerCase())
    })
  })
})

// Fetch assistants
const fetchAssistants = async () => {
  try {
    const response = await getAllAssistants(currentPage.value, pageSize.value)
    assistants.value = response.content
    totalPages.value = response.totalPages
    totalElements.value = response.totalElements
  } catch (error) {
    console.error('Error fetching assistants:', error)
  }
}

const handlePageChange = async (page) => {
  currentPage.value = page
  await fetchAssistants()
}

// Modal methods
const openModal = (assistant = null) => {
  currentAssistant.value = assistant
  validationErrors.value = {}

  if (assistant) {
    form.value = {
      user: {
        fullName: assistant.fullName,
        phoneNumber: assistant.phoneNumber,
        email: assistant.email,
        password_hash: assistant.password_hash,
        gender: assistant.gender,
        address: assistant.address,
        dateOfBirth: assistant.dateOfBirth,
        userRole: 'assistant',
      },
      assistantStatus: assistant.assistantStatus,
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
        userRole: 'assistant',
      },
      assistantStatus: 'available',
    }
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  currentAssistant.value = null
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
      userRole: 'assistant',
    },
    assistantStatus: 'available',
  }
}

// Submit handler
const handleSubmit = async () => {
  try {
    if (!validateForm()) {
      return
    }

    const assistantData = {
      user: {
        ...form.value.user,
        userId: currentAssistant.value?.userId,
      },
      assistantStatus: form.value.assistantStatus,
    }

    if (currentAssistant.value) {
      await updateAssistant(currentAssistant.value.assistantId, assistantData)
    } else {
      await createAssistant(assistantData)
    }

    await fetchAssistants()
    closeModal()
  } catch (error) {
    console.error('Error saving assistant:', error)
    alert('Phải nhập đủ thông tin cần thiết!')
  }
}

// Delete handler
const handleDelete = async (assistantId) => {
  if (confirm('Bạn có chắc chắn muốn xóa phụ xe này?')) {
    try {
      await deleteAssistant(assistantId)
      await fetchAssistants()
    } catch (error) {
      console.error('Error deleting assistant:', error)
      alert('Có lỗi xảy ra khi xóa phụ xe!')
    }
  }
}

// Fetch assistants on component mount
onMounted(fetchAssistants)
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

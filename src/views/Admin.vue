<template>
  <div class="container-shadow bg-white p-4 rounded-lg">
    <h2 class="text-primary fw-bold mb-4">Quản lý thông tin quản trị viên</h2>
    <button class="btn btn-success mb-3" @click="openModal(null)">
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
        <tr v-for="admin in filteredAdmins" :key="admin.adminId">
          <td v-for="(label, column) in columns" :key="column" class="text-center">
            {{ formatColumnValue(getNestedValue(admin, column), column) }}
          </td>
          <td class="action">
            <button class="btn btn-warning btn-sm me-2" @click="openModal(admin)">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-danger btn-sm" @click="handleDelete(admin.adminId)">
              <i class="fas fa-trash"></i>
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <CustomModal
      v-model="showModal"
      :title="currentAdmin ? 'Chỉnh sửa quản trị viên' : 'Thêm quản trị viên'"
    >
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
      </form>

      <template #footer>
        <button class="btn btn-secondary me-2" @click="closeModal">Hủy</button>
        <button class="btn btn-primary" @click="handleSubmit">
          {{ currentAdmin ? 'Lưu thay đổi' : 'Thêm quản trị viên' }}
        </button>
      </template>
    </CustomModal>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { getAllAdmins, createAdmin, updateAdmin, deleteAdmin } from '../services/adminService'
import CustomModal from '../components/Modal.vue'

// Reactive state
const admins = ref([])
const showModal = ref(false)
const currentAdmin = ref(null)
const filters = ref({})

// Columns definition
const columns = {
  adminId: 'ID Quản trị viên',
  'user.userId': 'ID Người dùng',
  'user.fullName': 'Tên đầy đủ',
  'user.phoneNumber': 'Số điện thoại',
  'user.email': 'Email',
  'user.password_hash': 'Password',
  'user.gender': 'Giới tính',
  'user.address': 'Địa chỉ',
  'user.dateOfBirth': 'Ngày sinh',
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
    userRole: 'admin',
  },
  adminId: null,
})

// Utility function to format column values
const formatColumnValue = (value, column) => {
  if (
    column.includes('createdAt') ||
    column.includes('updatedAt') ||
    column === 'user.dateOfBirth'
  ) {
    return value ? new Date(value).toLocaleDateString('vi-VN') : ''
  }

  if (column === 'user.gender') {
    const genderMap = {
      male: 'Nam',
      female: 'Nữ',
      other: 'Khác',
    }
    return genderMap[value] || value
  }

  return value || ''
}

// Computed filtered admins
const filteredAdmins = computed(() => {
  return admins.value.filter((admin) => {
    return Object.entries(filters.value).every(([key, value]) => {
      if (!value) return true
      const adminValue = getNestedValue(admin, key)
      return adminValue.toString().toLowerCase().includes(value.toLowerCase())
    })
  })
})

// Fetch admins
const fetchAdmins = async () => {
  try {
    admins.value = await getAllAdmins()
  } catch (error) {
    console.error('Error fetching admins:', error)
  }
}

// Utility function to get nested object values
const getNestedValue = (obj, path) => {
  return path.split('.').reduce((o, key) => o?.[key], obj) || ''
}

// Modal methods
const openModal = (admin = null) => {
  currentAdmin.value = admin
  form.value = admin
    ? {
        user: { ...admin.user },
        adminId: admin.adminId,
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
          userRole: 'admin',
        },
        adminId: null,
      }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  currentAdmin.value = null
  form.value = {
    user: {
      fullName: '',
      phoneNumber: '',
      email: '',
      password_hash: '',
      gender: 'male',
      address: '',
      dateOfBirth: '',
      userRole: 'admin',
    },
    adminId: null,
  }
}

// Submit handler
const handleSubmit = async () => {
  try {
    const adminData = {
      user: {
        ...form.value.user,
        userId: currentAdmin.value?.user?.userId, // Use existing user ID if updating
        userRole: 'admin', // Explicitly set user role
      },
    }

    if (currentAdmin.value) {
      await updateAdmin(currentAdmin.value.adminId, adminData)
    } else {
      await createAdmin(adminData)
    }

    // Fetch updated admins and close modal in one step
    await fetchAdmins()
    closeModal()
  } catch (error) {
    console.error('Error saving admin:', error)
    // Optional: Add user-friendly error handling
    alert('Phải nhập đủ thông tin cần thiết!')
  }
}

// Delete handler
const handleDelete = async (adminId) => {
  try {
    await deleteAdmin(adminId)
    await fetchAdmins()
  } catch (error) {
    console.error('Error deleting admin:', error)
  }
}

// Fetch admins on component mount
onMounted(fetchAdmins)
</script>

<style scoped>
.title-table {
  background-color: #83c3ff;
  color: white;
}
.action {
  width: 90px;
}
</style>

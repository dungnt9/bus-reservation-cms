<template>
  <div class="container-shadow bg-white p-4 rounded-lg">
    <h2 class="text-primary fw-bold mb-4">Quản lý thông tin khách hàng</h2>
    <button class="btn btn-success mb-3" @click="openModal(null)">
      <i class="fas fa-plus"></i> Thêm khách hàng
    </button>

    <table class="table table-striped table-bordered table-hover">
      <thead>
        <tr>
          <th v-for="(label, column) in columns" :key="column">{{ label }}</th>
          <th>Hành động</th>
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
        <tr
          v-for="customer in filteredCustomers"
          :key="customer.customerId"
          :class="{ editing: editingCustomerId === customer.customerId }"
        >
          <td v-for="(label, column) in columns" :key="column">
            <template v-if="editingCustomerId !== customer.customerId">
              {{ formatColumnValue(getNestedValue(customer, column), column) }}
            </template>
            <input
              v-else
              type="text"
              class="form-control form-control-sm"
              :value="getNestedValue(customer, column)"
              @input="updateEditingCustomer(column, $event.target.value)"
            />
          </td>
          <td>
            <template v-if="editingCustomerId !== customer.customerId">
              <button class="btn btn-warning btn-sm me-2" @click="startEditing(customer)">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn btn-danger btn-sm" @click="handleDelete(customer.customerId)">
                <i class="fas fa-trash"></i>
              </button>
            </template>
            <template v-else>
              <button class="btn btn-success btn-sm me-2" @click="confirmEdit">
                <i class="fas fa-check"></i> Xác nhận
              </button>
              <button class="btn btn-secondary btn-sm" @click="cancelEdit">
                <i class="fas fa-times"></i> Hủy
              </button>
            </template>
          </td>
        </tr>
      </tbody>
    </table>

    <CustomModal
      v-model="showModal"
      :title="currentCustomer ? 'Chỉnh sửa khách hàng' : 'Thêm khách hàng'"
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
          {{ currentCustomer ? 'Lưu thay đổi' : 'Thêm khách hàng' }}
        </button>
      </template>
    </CustomModal>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import {
  getAllCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from '../services/customerService'
import CustomModal from '../components/Modal.vue' // Import the custom modal component

// Reactive state
const customers = ref([])
const showModal = ref(false)
const currentCustomer = ref(null)
const editingCustomerId = ref(null)
const editingCustomer = ref(null)
const filters = ref({})

// Columns definition
const columns = {
  customerId: 'ID Khách hàng',
  'user.userId': 'ID Người dùng',
  'user.fullName': 'Tên đầy đủ',
  'user.phoneNumber': 'Số điện thoại',
  'user.email': 'Email',
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
    gender: 'male',
    address: '',
    dateOfBirth: '',
    userRole: 'customer',
  },
  customerId: null,
})

// Utility function to format column values
const formatColumnValue = (value, column) => {
  // Handle date formatting
  if (
    column.includes('createdAt') ||
    column.includes('updatedAt') ||
    column === 'user.dateOfBirth'
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

  return value || ''
}

// Computed filtered customers
const filteredCustomers = computed(() => {
  return customers.value.filter((customer) => {
    return Object.entries(filters.value).every(([key, value]) => {
      if (!value) return true
      const customerValue = getNestedValue(customer, key)
      return customerValue.toString().toLowerCase().includes(value.toLowerCase())
    })
  })
})

// Fetch customers
const fetchCustomers = async () => {
  try {
    customers.value = await getAllCustomers()
  } catch (error) {
    console.error('Error fetching customers:', error)
  }
}

// Utility function to get nested object values
const getNestedValue = (obj, path) => {
  return path.split('.').reduce((o, key) => o?.[key], obj) || ''
}

// Modal methods
const openModal = (customer = null) => {
  currentCustomer.value = customer
  form.value = customer
    ? {
        user: { ...customer.user },
      }
    : {
        user: {
          fullName: '',
          phoneNumber: '',
          email: '',
          gender: 'male',
          address: '',
          dateOfBirth: '',
          userRole: 'customer',
        },
      }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  currentCustomer.value = null
  form.value = {
    user: {
      fullName: '',
      phoneNumber: '',
      email: '',
      gender: 'male',
      address: '',
      dateOfBirth: '',
      userRole: 'customer',
    },
  }
}

// Submit handler
const handleSubmit = async () => {
  try {
    const customerData = {
      user: {
        ...form.value.user,
        userId: currentCustomer.value?.user?.userId, // Use existing user ID if updating
        userRole: 'customer', // Explicitly set user role
      },
    }

    if (currentCustomer.value) {
      await updateCustomer(currentCustomer.value.customerId, customerData)
    } else {
      await createCustomer(customerData)
    }

    // Fetch updated customers and close modal in one step
    await fetchCustomers()
    closeModal()
  } catch (error) {
    console.error('Error saving customer:', error)
    // Optional: Add user-friendly error handling
    alert('Phải nhập đủ thông tin cần thiết!')
  }
}

// Delete handler
const handleDelete = async (customerId) => {
  try {
    await deleteCustomer(customerId)
    await fetchCustomers()
  } catch (error) {
    console.error('Error deleting customer:', error)
  }
}

// Inline editing methods
const startEditing = (customer) => {
  editingCustomerId.value = customer.customerId
  editingCustomer.value = { ...customer }
}

const updateEditingCustomer = (key, value) => {
  const keys = key.split('.')
  if (keys.length > 1) {
    editingCustomer.value[keys[0]][keys[1]] = value
  } else {
    editingCustomer.value[key] = value
  }
}

const confirmEdit = async () => {
  try {
    await updateCustomer(editingCustomerId.value, editingCustomer.value)
    await fetchCustomers()
    editingCustomerId.value = null
    editingCustomer.value = null
  } catch (error) {
    console.error('Error updating customer:', error)
  }
}

const cancelEdit = () => {
  editingCustomerId.value = null
  editingCustomer.value = null
}

// Fetch customers on component mount
onMounted(fetchCustomers)
</script>

<style scoped>
.container-shadow {
  margin: 30px;
  box-shadow: 4px 4px 4px 4px rgba(0, 0, 0, 0.1);
}

.editing td {
  background-color: #f0f0f0;
}

.text-primary {
  color: #007bff !important;
}
</style>

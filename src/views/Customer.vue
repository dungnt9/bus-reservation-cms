<template>
  <div class="bg-white p-4 rounded-lg border">
    <h2 class="text-primary fw-bold mb-4">Quản lý thông tin khách hàng</h2>
    <button
      class="btn btn-success mb-3"
      @click="openModal(null)"
      style="background-color: white; color: green"
    >
      <i class="fas fa-plus"></i> Thêm khách hàng
    </button>

    <!-- Bảng hiển thị khách hàng -->
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
        <tr v-for="customer in filteredCustomers" :key="customer.customerId">
          <td v-for="(label, column) in columns" :key="column" class="text-center">
            {{ formatColumnValue(customer[column], column) }}
          </td>
          <td class="action">
            <button class="btn btn-success btn-sm me-2" @click="openInvoiceModal(customer)">
              <i class="fas fa-file-invoice"></i>
            </button>
            <button class="btn btn-warning btn-sm me-2" @click="openModal(customer)">
              <i class="fas fa-edit"></i>
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Modal thêm/sửa khách hàng -->
    <CustomModal
      v-model="showModal"
      :title="currentCustomer ? 'Chỉnh sửa khách hàng' : 'Thêm khách hàng'"
    >
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
      </form>

      <template #footer>
        <button class="btn btn-secondary me-2" @click="closeModal">Hủy</button>
        <button class="btn btn-primary" @click="handleSubmit">
          {{ currentCustomer ? 'Lưu thay đổi' : 'Thêm khách hàng' }}
        </button>
      </template>
    </CustomModal>

    <!-- Modal tạo hóa đơn -->
    <CustomModal v-model="showInvoiceModal" title="Tạo hóa đơn">
      <form @submit.prevent="handleInvoiceSubmit" novalidate>
        <!-- Thông tin khách hàng và chuyến xe -->
        <div class="row mb-3">
          <div class="col-md-6">
            <label class="form-label">Khách hàng</label>
            <input type="text" class="form-control" :value="selectedCustomerInfo" disabled />
          </div>
          <div class="col-md-6">
            <label class="form-label">Chuyến xe<span class="text-danger">*</span></label>
            <select class="form-control" v-model="invoiceForm.tripId" @change="handleTripChange">
              <option value="">Chọn chuyến xe</option>
              <option v-for="trip in availableTrips" :key="trip.tripId" :value="trip.tripId">
                {{ formatTripOption(trip) }}
              </option>
            </select>
          </div>
        </div>

        <!-- Hiển thị ghế đã chọn -->
        <div class="row mb-3">
          <div class="col-md-12">
            <label class="form-label">Ghế đã chọn</label>
            <input type="text" class="form-control" :value="selectedSeatsDisplay" disabled />
          </div>
        </div>

        <!-- Nút xóa ghế -->
        <button
          v-if="invoiceForm.selectedSeats.length > 0"
          type="button"
          class="btn btn-secondary mb-3"
          @click="clearSelectedSeats"
        >
          Xóa ghế đã chọn
        </button>

        <!-- Component chọn ghế -->
        <Seat
          v-if="showSeatSelection"
          v-model="invoiceForm.selectedSeats"
          :booked-seats="bookedSeats"
          @seat-selected="handleSeatSelection"
        />

        <!-- Thông tin thanh toán -->
        <div class="row mt-3">
          <div class="col-md-4">
            <label class="form-label">Tổng tiền</label>
            <input
              type="text"
              class="form-control"
              :value="formatCurrency(invoiceForm.totalPrice)"
              disabled
            />
          </div>
          <div class="col-md-4">
            <label class="form-label">Trạng thái thanh toán</label>
            <select class="form-control" v-model="invoiceForm.paymentStatus">
              <option value="pending">Chờ thanh toán</option>
              <option value="paid">Đã thanh toán</option>
            </select>
          </div>
          <div class="col-md-4">
            <label class="form-label">Phương thức thanh toán</label>
            <select class="form-control" v-model="invoiceForm.paymentMethod">
              <option value="cash">Tiền mặt</option>
              <option value="card">Thẻ</option>
            </select>
          </div>
        </div>
      </form>

      <template #footer>
        <button class="btn btn-secondary me-2" @click="closeInvoiceModal">Hủy</button>
        <button class="btn btn-primary" @click="handleInvoiceSubmit" :disabled="!isValidInvoice">
          Tạo hóa đơn
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
import { ref, computed, onMounted } from 'vue'
import CustomModal from '../components/Modal.vue'
import Seat from '../components/Seat.vue'
import { createCustomer, getAllCustomers, updateCustomer } from '../services/customerService'
import { createInvoice, getAvailableTrips, getTripSeats } from '../services/invoiceService'
import { validEmail, validPhone, validName, validAddress } from '../utils/validators'
import Pagination from '@/components/Pagination.vue'

// State Management
const customers = ref([])
const showModal = ref(false)
const currentCustomer = ref(null)
const filters = ref({})
const validationErrors = ref({})

// Invoice Related State
const showInvoiceModal = ref(false)
const selectedCustomer = ref(null)
const availableTrips = ref([])
const bookedSeats = ref([])
const showSeatSelection = ref(false)
const tripDetails = ref(null)
const ticketPrice = ref(0)

const currentPage = ref(0)
const pageSize = ref(10)
const totalPages = ref(0)

// Form States
const form = ref({
  user: {
    fullName: '',
    phoneNumber: '',
    email: '',
    password_hash: '',
    gender: 'male',
    address: '',
    dateOfBirth: '',
    userRole: 'customer',
  },
})

const invoiceForm = ref({
  tripId: '',
  selectedSeats: [],
  totalPrice: 0,
  paymentStatus: 'pending',
  paymentMethod: 'card',
})

// Columns Definition
const columns = {
  customerId: 'ID Khách hàng',
  userId: 'ID Người dùng',
  fullName: 'Tên đầy đủ',
  phoneNumber: 'Số điện thoại',
  email: 'Email',
  gender: 'Giới tính',
  address: 'Địa chỉ',
  dateOfBirth: 'Ngày sinh',
}

// Computed Properties
const filteredCustomers = computed(() => {
  return customers.value.filter((customer) => {
    return Object.entries(filters.value).every(([key, value]) => {
      if (!value) return true
      const customerValue = customer[key]?.toString().toLowerCase()
      return customerValue?.includes(value.toLowerCase())
    })
  })
})

const selectedCustomerInfo = computed(() => {
  if (!selectedCustomer.value) return ''
  return `${selectedCustomer.value.fullName} - ${selectedCustomer.value.phoneNumber}`
})

const selectedSeatsDisplay = computed(() => {
  return invoiceForm.value.selectedSeats.length > 0
    ? invoiceForm.value.selectedSeats.join(', ')
    : 'Chưa chọn ghế'
})

const isValidInvoice = computed(() => {
  return (
    invoiceForm.value.tripId &&
    invoiceForm.value.selectedSeats.length > 0 &&
    selectedCustomer.value &&
    invoiceForm.value.paymentStatus &&
    invoiceForm.value.paymentMethod
  )
})

const handleSeatSelection = (selectedSeats) => {
  if (!ticketPrice.value) {
    console.error('No ticket price available')
    return
  }
  invoiceForm.value.totalPrice = selectedSeats.length * ticketPrice.value
  console.log('Updated total price:', invoiceForm.value.totalPrice)
}

// Methods
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

const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value)
}

const formatTripOption = (trip) => {
  return `${trip.routeName} - ${new Date(trip.scheduledDeparture).toLocaleString('vi-VN')}`
}

const getMaxBirthDate = () => {
  const today = new Date()
  const minAge = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate())
  return minAge.toISOString().split('T')[0]
}

// Validation
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

// Customer Modal Methods
const openModal = (customer = null) => {
  currentCustomer.value = customer
  validationErrors.value = {}

  if (customer) {
    form.value = {
      user: {
        fullName: customer.fullName,
        phoneNumber: customer.phoneNumber,
        email: customer.email || '',
        password_hash: customer.password_hash || '',
        gender: customer.gender || 'male',
        address: customer.address || '',
        dateOfBirth: customer.dateOfBirth || '',
        userRole: 'customer',
      },
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
        userRole: 'customer',
      },
    }
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  currentCustomer.value = null
  validationErrors.value = {}
}

const handleSubmit = async () => {
  try {
    if (!validateForm()) {
      return
    }

    const customerData = {
      user: {
        ...form.value.user,
      },
    }

    if (currentCustomer.value) {
      await updateCustomer(currentCustomer.value.customerId, customerData)
    } else {
      await createCustomer(customerData)
    }

    await fetchCustomers()
    closeModal()
  } catch (error) {
    console.error('Error saving customer:', error)
    alert('Có lỗi xảy ra khi lưu thông tin!')
  }
}

// Invoice Modal Methods
const resetInvoiceForm = () => {
  invoiceForm.value = {
    tripId: '',
    selectedSeats: [],
    totalPrice: 0,
    paymentStatus: 'pending',
    paymentMethod: 'card',
  }
  showSeatSelection.value = false
  bookedSeats.value = []
  tripDetails.value = null
  ticketPrice.value = 0
}

const openInvoiceModal = async (customer) => {
  console.log('Opening invoice modal for customer:', customer)
  selectedCustomer.value = customer
  showInvoiceModal.value = true
  resetInvoiceForm()

  try {
    const trips = await getAvailableTrips()
    console.log('Available trips:', trips)
    availableTrips.value = trips
  } catch (error) {
    console.error('Error fetching available trips:', error)
    alert('Có lỗi xảy ra khi tải danh sách chuyến xe!')
  }
}

const closeInvoiceModal = () => {
  showInvoiceModal.value = false
  selectedCustomer.value = null
  resetInvoiceForm()
}

const handleTripChange = async () => {
  console.log('Selected trip ID:', invoiceForm.value.tripId)
  if (!invoiceForm.value.tripId) {
    showSeatSelection.value = false
    return
  }

  try {
    const response = await getTripSeats(invoiceForm.value.tripId)
    console.log('Trip details:', response)
    tripDetails.value = response

    if (response.ticketPrice) {
      ticketPrice.value = response.ticketPrice
    }

    bookedSeats.value = response.tripSeats
      .filter((seat) => seat.status === 'booked')
      .map((seat) => parseInt(seat.seatNumber))

    showSeatSelection.value = true
    // Reset selected seats when changing trips
    invoiceForm.value.selectedSeats = []
    invoiceForm.value.totalPrice = 0
  } catch (error) {
    console.error('Error fetching trip seats:', error)
    alert('Có lỗi xảy ra khi tải thông tin ghế!')
  }
}

const clearSelectedSeats = () => {
  invoiceForm.value.selectedSeats = []
  invoiceForm.value.totalPrice = 0
}

const handleInvoiceSubmit = async () => {
  // Validate again before submitting
  if (!isValidInvoice.value) {
    if (!invoiceForm.value.tripId) {
      alert('Vui lòng chọn chuyến xe!')
      return
    }
    if (invoiceForm.value.selectedSeats.length === 0) {
      alert('Vui lòng chọn ít nhất một ghế!')
      return
    }
    return
  }

  try {
    const invoiceData = {
      customerId: selectedCustomer.value.customerId,
      tripId: invoiceForm.value.tripId,
      selectedSeats: invoiceForm.value.selectedSeats,
      paymentStatus: invoiceForm.value.paymentStatus,
      paymentMethod: invoiceForm.value.paymentMethod,
    }

    const response = await createInvoice(invoiceData)
    if (response) {
      closeInvoiceModal()
      alert('Tạo hóa đơn thành công!')
    }
  } catch (error) {
    console.error('Error creating invoice:', error)
    alert('Có lỗi xảy ra khi tạo hóa đơn!')
  }
}

// Fetch customers on mount
const fetchCustomers = async () => {
  try {
    const response = await getAllCustomers(currentPage.value, pageSize.value)
    customers.value = response.content
    totalPages.value = response.totalPages
  } catch (error) {
    console.error('Error fetching customers:', error)
    alert('Có lỗi xảy ra khi tải danh sách khách hàng!')
  }
}

const handlePageChange = async (page) => {
  currentPage.value = page
  await fetchCustomers()
}

onMounted(() => {
  console.log('Customer component mounted')
  fetchCustomers()
})
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
  width: 95px;
}
</style>

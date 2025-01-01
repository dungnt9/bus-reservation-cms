<template>
  <div class="bg-white p-4 rounded-lg border">
    <h2 class="text-primary fw-bold mb-4">Quản lý hóa đơn</h2>

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
        <tr v-for="invoice in filteredInvoices" :key="invoice.invoiceId">
          <td v-for="(label, column) in columns" :key="column" class="text-center">
            {{ formatColumnValue(invoice[column], column) }}
          </td>
          <td class="action">
            <button class="btn btn-warning btn-sm me-2" @click="openEditModal(invoice)">
              <i class="fas fa-edit"></i>
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Edit Modal -->
    <CustomModal v-model="showModal" :title="'Chỉnh sửa hóa đơn'">
      <form @submit.prevent="handleSubmit" novalidate>
        <div class="row mb-3">
          <div class="col-md-6">
            <label class="form-label">Mã hóa đơn</label>
            <input type="text" class="form-control" v-model="form.invoiceId" disabled />
          </div>
          <div class="col-md-6">
            <label class="form-label">Mã chuyến xe</label>
            <input type="text" class="form-control" v-model="form.tripId" disabled />
          </div>
        </div>

        <div class="row mb-3">
          <div class="col-md-6">
            <label class="form-label">Khách hàng</label>
            <input type="text" class="form-control" :value="form.fullName" disabled />
          </div>
          <div class="col-md-6">
            <label class="form-label">Số điện thoại</label>
            <input type="text" class="form-control" :value="form.phoneNumber" disabled />
          </div>
        </div>

        <div class="row mb-3">
          <div class="col-md-6">
            <label class="form-label">Ghế đã đặt</label>
            <input type="text" class="form-control" :value="formatSelectedSeats" disabled />
          </div>
          <div class="col-md-6">
            <label class="form-label">Tổng tiền</label>
            <input
              type="text"
              class="form-control"
              :value="formatCurrency(form.totalPrice)"
              disabled
            />
          </div>
        </div>

        <div class="row">
          <div class="col-md-6">
            <label class="form-label">Trạng thái thanh toán</label>
            <select class="form-control" v-model="form.paymentStatus">
              <option value="pending">Chờ thanh toán</option>
              <option value="paid">Đã thanh toán</option>
            </select>
          </div>
          <div class="col-md-6">
            <label class="form-label">Phương thức thanh toán</label>
            <select class="form-control" v-model="form.paymentMethod">
              <option value="cash">Tiền mặt</option>
              <option value="card">Thẻ</option>
            </select>
          </div>
        </div>
      </form>

      <template #footer>
        <button class="btn btn-secondary me-2" @click="closeModal">Hủy</button>
        <button class="btn btn-primary" @click="handleSubmit">Lưu thay đổi</button>
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
import CustomModal from '../components/Modal.vue'
import { getAllInvoices, updateInvoice } from '../services/invoiceService'
import Pagination from '@/components/Pagination.vue'

// Add pagination state
const currentPage = ref(0)
const pageSize = ref(10)
const totalPages = ref(0)
const totalElements = ref(0)
// Reactive state
const invoices = ref([])
const showModal = ref(false)
const filters = ref({})

// Form state
const form = ref({
  invoiceId: '',
  tripId: '',
  plateNumber: '',
  customerId: '',
  fullName: '',
  phoneNumber: '',
  selectedSeats: [],
  totalPrice: 0,
  paymentStatus: 'pending',
  paymentMethod: 'card',
  invoiceDate: null,
})

// Columns definition
const columns = {
  invoiceId: 'Mã HĐ',
  tripId: 'Mã chuyến',
  plateNumber: 'Biển số xe',
  customerId: 'Mã KH',
  fullName: 'Tên KH',
  phoneNumber: 'SĐT',
  selectedSeats: 'Ghế đã đặt',
  totalPrice: 'Tổng tiền',
  paymentStatus: 'Trạng thái',
  paymentMethod: 'Phương thức',
  invoiceDate: 'Ngày lập',
}

// Computed properties
const filteredInvoices = computed(() => {
  return invoices.value.filter((invoice) => {
    return Object.entries(filters.value).every(([key, value]) => {
      if (!value) return true
      const invoiceValue = invoice[key]?.toString().toLowerCase()
      return invoiceValue?.includes(value.toLowerCase())
    })
  })
})

const formatSelectedSeats = computed(() => {
  return form.value.selectedSeats.join(', ')
})

// Methods
const formatColumnValue = (value, column) => {
  if (!value) return ''

  switch (column) {
    case 'paymentStatus':
      return value === 'pending' ? 'Chờ thanh toán' : 'Đã thanh toán'
    case 'paymentMethod':
      return value === 'cash' ? 'Tiền mặt' : 'Thẻ'
    case 'totalPrice':
      return formatCurrency(value)
    case 'invoiceDate':
      return new Date(value).toLocaleString('vi-VN')
    case 'selectedSeats':
      return Array.isArray(value) ? value.join(', ') : value
    default:
      return value
  }
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value)
}

const fetchInvoices = async () => {
  try {
    const response = await getAllInvoices(currentPage.value, pageSize.value)
    invoices.value = response.content
    totalPages.value = response.totalPages
    totalElements.value = response.totalElements
  } catch (error) {
    console.error('Error fetching invoices:', error)
    alert('Có lỗi xảy ra khi tải danh sách hóa đơn!')
  }
}

const handlePageChange = async (page) => {
  currentPage.value = page
  await fetchInvoices()
}

const openEditModal = (invoice) => {
  console.log('Opening edit modal for invoice:', invoice)
  form.value = { ...invoice }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  form.value = {
    invoiceId: '',
    tripId: '',
    plateNumber: '',
    customerId: '',
    fullName: '',
    phoneNumber: '',
    selectedSeats: [],
    totalPrice: 0,
    paymentStatus: 'pending',
    paymentMethod: 'card',
    invoiceDate: null,
  }
}

const handleSubmit = async () => {
  try {
    console.log('Submitting updated invoice:', form.value)
    await updateInvoice(form.value.invoiceId, {
      paymentStatus: form.value.paymentStatus,
      paymentMethod: form.value.paymentMethod,
    })
    await fetchInvoices()
    closeModal()
  } catch (error) {
    console.error('Error updating invoice:', error)
    alert('Có lỗi xảy ra khi cập nhật hóa đơn!')
  }
}

// Lifecycle hooks
onMounted(() => {
  console.log('Invoice component mounted')
  fetchInvoices()
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
  width: 90px;
}

.form-control:disabled {
  background-color: #e9ecef;
}
</style>

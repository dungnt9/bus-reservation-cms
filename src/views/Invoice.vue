<template>
  <div class="border bg-white p-4 rounded-lg">
    <h2 class="text-primary fw-bold mb-4">Quản lý hóa đơn</h2>
    <button
      class="btn btn-success mb-3"
      @click="openModal(null)"
      style="background-color: white; color: green"
    >
      <i class="fas fa-plus"></i> Thêm hóa đơn
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
      <tr v-for="invoice in filteredInvoices" :key="invoice.invoiceId">
        <td v-for="(label, column) in columns" :key="column" class="text-center">
          {{ formatColumnValue(getNestedValue(invoice, column), column) }}
        </td>
        <td class="action">
          <button class="btn btn-warning btn-sm me-2" @click="openModal(invoice)">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-danger btn-sm" @click="handleDelete(invoice.invoiceId)">
            <i class="fas fa-trash-alt"></i>
          </button>
        </td>
      </tr>
      </tbody>
    </table>

    <CustomModal v-model="showModal" :title="currentInvoice ? 'Chỉnh sửa hóa đơn' : 'Thêm hóa đơn'">
      <form @submit.prevent="handleSubmit">
        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label">Khách hàng<span class="text-danger">*</span></label>
            <input type="text" class="form-control" v-model="form.customer.fullName" required />
          </div>
          <div class="col-md-6 mb-3">
            <label class="form-label">Số điện thoại<span class="text-danger">*</span></label>
            <input type="tel" class="form-control" v-model="form.customer.phoneNumber" required />
          </div>
        </div>

        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label">Tổng tiền<span class="text-danger">*</span></label>
            <input type="number" class="form-control" v-model="form.totalPrice" required min="0" />
          </div>
          <div class="col-md-6 mb-3">
            <label class="form-label">Trạng thái thanh toán</label>
            <select class="form-control" v-model="form.paymentStatus">
              <option value="paid">Đã thanh toán</option>
              <option value="pending">Chưa thanh toán</option>
            </select>
          </div>
        </div>

        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label">Phương thức thanh toán</label>
            <select class="form-control" v-model="form.paymentMethod">
              <option value="cash">Tiền mặt</option>
              <option value="card">Thẻ</option>
            </select>
          </div>
          <div class="col-md-6 mb-3">
            <label class="form-label">Ngày hóa đơn</label>
            <input type="date" class="form-control" v-model="form.invoiceDate" />
          </div>
        </div>
      </form>

      <template #footer>
        <button class="btn btn-secondary me-2" @click="closeModal">Hủy</button>
        <button class="btn btn-primary" @click="handleSubmit">
          {{ currentInvoice ? 'Lưu thay đổi' : 'Thêm hóa đơn' }}
        </button>
      </template>
    </CustomModal>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { getAllInvoices, createInvoice, updateInvoice, deleteInvoice } from '../services/invoiceService'
import CustomModal from '../components/Modal.vue'

// Reactive state
const invoices = ref([])
const showModal = ref(false)
const currentInvoice = ref(null)
const filters = ref({})

// Columns definition
const columns = {
  invoiceId: 'ID Hóa đơn',
  'customer.userId': 'ID Khách hàng',
  'customer.fullName': 'Tên khách hàng',
  'customer.phoneNumber': 'Số điện thoại',
  totalPrice: 'Tổng tiền',
  paymentStatus: 'Trạng thái thanh toán',
  paymentMethod: 'Phương thức thanh toán',
  invoiceDate: 'Ngày hóa đơn'
}

// Initial form state
const form = ref({
  customer: {
    userId: null,
    fullName: '',
    phoneNumber: ''
  },
  totalPrice: null,
  paymentStatus: 'unpaid',
  paymentMethod: 'cash',
  invoiceDate: new Date().toISOString().split('T')[0]
})

// Utility function to format column values
const formatColumnValue = (value, column) => {
  // Handle date formatting
  if (column === 'invoiceDate') {
    return value ? new Date(value).toLocaleDateString('vi-VN') : ''
  }

  // Handle payment status formatting
  if (column === 'paymentStatus') {
    const statusMap = {
      paid: 'Đã thanh toán',
      pending: 'Chưa thanh toán'
    }
    return statusMap[value] || value
  }

  // Handle payment method formatting
  if (column === 'paymentMethod') {
    const methodMap = {
      cash: 'Tiền mặt',
      card: 'Thẻ'
    }
    return methodMap[value] || value
  }

  // Format total price
  if (column === 'totalPrice') {
    return value ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value) : ''
  }

  return value || ''
}

// Computed filtered invoices
const filteredInvoices = computed(() => {
  return invoices.value.filter((invoice) => {
    return Object.entries(filters.value).every(([key, value]) => {
      if (!value) return true
      const invoiceValue = getNestedValue(invoice, key)
      return invoiceValue.toString().toLowerCase().includes(value.toLowerCase())
    })
  })
})

// Fetch invoices
const fetchInvoices = async () => {
  try {
    invoices.value = await getAllInvoices()
  } catch (error) {
    console.error('Error fetching invoices:', error)
  }
}

// Utility function to get nested object values
const getNestedValue = (obj, path) => {
  return path.split('.').reduce((o, key) => o?.[key], obj) || ''
}

// Modal methods
const openModal = (invoice = null) => {
  currentInvoice.value = invoice
  form.value = invoice
    ? {
      customer: { ...invoice.customer },
      totalPrice: invoice.totalPrice,
      paymentStatus: invoice.paymentStatus,
      paymentMethod: invoice.paymentMethod,
      invoiceDate: invoice.invoiceDate ? new Date(invoice.invoiceDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    }
    : {
      customer: {
        userId: null,
        fullName: '',
        phoneNumber: ''
      },
      totalPrice: null,
      paymentStatus: 'unpaid',
      paymentMethod: 'cash',
      invoiceDate: new Date().toISOString().split('T')[0]
    }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  currentInvoice.value = null
  form.value = {
    customer: {
      userId: null,
      fullName: '',
      phoneNumber: ''
    },
    totalPrice: null,
    paymentStatus: 'unpaid',
    paymentMethod: 'cash',
    invoiceDate: new Date().toISOString().split('T')[0]
  }
}

// Submit handler
const handleSubmit = async () => {
  try {
    const invoiceData = {
      customer: {
        ...form.value.customer,
        userId: currentInvoice.value?.customer?.userId
      },
      totalPrice: form.value.totalPrice,
      paymentStatus: form.value.paymentStatus,
      paymentMethod: form.value.paymentMethod,
      invoiceDate: form.value.invoiceDate
    }

    if (currentInvoice.value) {
      await updateInvoice(currentInvoice.value.invoiceId, invoiceData)
    } else {
      await createInvoice(invoiceData)
    }

    // Fetch updated invoices and close modal in one step
    await fetchInvoices()
    closeModal()
  } catch (error) {
    console.error('Error saving invoice:', error)
    alert('Phải nhập đủ thông tin cần thiết!')
  }
}

// Delete handler
const handleDelete = async (invoiceId) => {
  try {
    await deleteInvoice(invoiceId)
    await fetchInvoices()
  } catch (error) {
    console.error('Error deleting invoice:', error)
  }
}

// Fetch invoices on component mount
onMounted(fetchInvoices)
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

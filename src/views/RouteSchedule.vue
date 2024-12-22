<template>
  <div class="bg-white p-4 rounded-lg border">
    <h2 class="text-primary fw-bold mb-4">Quản lý lịch trình tuyến xe</h2>
    <button
      class="btn btn-success mb-3"
      @click="openModal(null)"
      style="background-color: white; color: green"
    >
      <i class="fas fa-plus"></i> Thêm lịch trình
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
        <tr v-for="schedule in filteredRouteSchedules" :key="schedule.scheduleId">
          <td v-for="(label, column) in columns" :key="column" class="text-center">
            {{ formatColumnValue(getNestedValue(schedule, column), column) }}
          </td>
          <td class="action">
            <button class="btn btn-warning btn-sm me-2" @click="openModal(schedule)">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-danger btn-sm" @click="handleDelete(schedule.scheduleId)">
              <i class="fas fa-trash-alt"></i>
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <CustomModal
      v-model="showModal"
      :title="currentRouteSchedule ? 'Chỉnh sửa lịch trình' : 'Thêm lịch trình mới'"
    >
      <form @submit.prevent="handleSubmit" novalidate>
        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label">Tuyến xe<span class="text-danger">*</span></label>
            <select
              class="form-control"
              v-model="form.routeId"
              :class="{ 'is-invalid': validationErrors.routeId }"
            >
              <option value="" disabled>Chọn tuyến xe</option>
              <option v-for="route in routes" :key="route.routeId" :value="route.routeId">
                {{ route.routeName }} ({{ route.distance }}km)
              </option>
            </select>
            <div class="invalid-feedback" v-if="validationErrors.routeId">
              {{ validationErrors.routeId }}
            </div>
          </div>
          <div class="col-md-6 mb-3">
            <label class="form-label">Giờ khởi hành<span class="text-danger">*</span></label>
            <input
              type="time"
              class="form-control"
              v-model="form.departureTime"
              :class="{ 'is-invalid': validationErrors.departureTime }"
            />
            <div class="invalid-feedback" v-if="validationErrors.departureTime">
              {{ validationErrors.departureTime }}
            </div>
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label">Ngày trong tuần<span class="text-danger">*</span></label>
          <div class="row">
            <div class="col" v-for="day in daysOfWeek" :key="day.value">
              <div class="form-check">
                <input
                  class="form-check-input"
                  type="checkbox"
                  :id="day.value"
                  :value="day.value"
                  v-model="form.daysOfWeek"
                  :class="{ 'is-invalid': validationErrors.daysOfWeek }"
                />
                <label class="form-check-label" :for="day.value">
                  {{ day.label }}
                </label>
              </div>
            </div>
          </div>
          <div class="invalid-feedback d-block" v-if="validationErrors.daysOfWeek">
            {{ validationErrors.daysOfWeek }}
          </div>
        </div>
      </form>

      <template #footer>
        <button class="btn btn-secondary me-2" @click="closeModal">Hủy</button>
        <button class="btn btn-primary" @click="handleSubmit">
          {{ currentRouteSchedule ? 'Lưu thay đổi' : 'Thêm lịch trình' }}
        </button>
      </template>
    </CustomModal>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import {
  getAllRouteSchedules,
  createRouteSchedule,
  updateRouteSchedule,
  deleteRouteSchedule,
} from '../services/routeScheduleService'
import { getAllRoutes } from '../services/routeService'
import CustomModal from '../components/Modal.vue'

// Reactive state
const routeSchedules = ref([])
const routes = ref([])
const showModal = ref(false)
const currentRouteSchedule = ref(null)
const filters = ref({})
const validationErrors = ref({})

// Days of week
const daysOfWeek = [
  { value: 'MONDAY', label: 'Thứ 2' },
  { value: 'TUESDAY', label: 'Thứ 3' },
  { value: 'WEDNESDAY', label: 'Thứ 4' },
  { value: 'THURSDAY', label: 'Thứ 5' },
  { value: 'FRIDAY', label: 'Thứ 6' },
  { value: 'SATURDAY', label: 'Thứ 7' },
  { value: 'SUNDAY', label: 'Chủ nhật' },
]

// Columns definition
const columns = {
  scheduleId: 'ID Lịch trình',
  routeName: 'Tên tuyến xe',
  departureTime: 'Giờ khởi hành',
  daysOfWeek: 'Các ngày trong tuần',
}

// Initial form state
const form = ref({
  routeId: '',
  departureTime: '',
  daysOfWeek: [],
})

// Format day name
const formatDayName = (day) => {
  const dayNames = {
    Monday: 'Thứ 2',
    Tuesday: 'Thứ 3',
    Wednesday: 'Thứ 4',
    Thursday: 'Thứ 5',
    Friday: 'Thứ 6',
    Saturday: 'Thứ 7',
    Sunday: 'Chủ nhật',
  }
  return dayNames[day] || day
}

const validateForm = () => {
  validationErrors.value = {}
  let isValid = true

  if (!form.value.routeId) {
    validationErrors.value.routeId = 'Vui lòng chọn tuyến xe'
    isValid = false
  }

  if (!form.value.departureTime) {
    validationErrors.value.departureTime = 'Vui lòng chọn giờ khởi hành'
    isValid = false
  }

  if (!form.value.daysOfWeek || form.value.daysOfWeek.length === 0) {
    validationErrors.value.daysOfWeek = 'Vui lòng chọn ít nhất một ngày trong tuần'
    isValid = false
  }

  return isValid
}

const formatColumnValue = (value, column) => {
  if (column === 'daysOfWeek' && Array.isArray(value)) {
    return value.map(formatDayName).join(', ')
  }

  if (column === 'departureTime') {
    return value ? value.substring(0, 5) : '' // Remove seconds when displaying
  }

  if (column === 'routeName') {
    const route = routes.value.find((r) => r.routeId === value)
    return route ? route.routeName : value
  }

  return value || ''
}

// Computed filtered route schedules
const filteredRouteSchedules = computed(() => {
  return routeSchedules.value.filter((schedule) => {
    return Object.entries(filters.value).every(([key, value]) => {
      if (!value) return true
      const scheduleValue = getNestedValue(schedule, key)
      return String(scheduleValue).toLowerCase().includes(value.toLowerCase())
    })
  })
})

// Utility function to get nested object values
const getNestedValue = (obj, path) => {
  return path.split('.').reduce((o, key) => o?.[key], obj) || ''
}

// Fetch route schedules
const fetchRouteSchedules = async () => {
  try {
    const response = await getAllRouteSchedules()
    routeSchedules.value = response
  } catch (error) {
    console.error('Error fetching route schedules:', error)
    alert('Có lỗi xảy ra khi tải dữ liệu lịch trình!')
  }
}

// Fetch routes
const fetchRoutes = async () => {
  try {
    const response = await getAllRoutes()
    routes.value = response
  } catch (error) {
    console.error('Error fetching routes:', error)
    alert('Có lỗi xảy ra khi tải dữ liệu tuyến xe!')
  }
}

// Modal methods
const openModal = (schedule = null) => {
  currentRouteSchedule.value = schedule
  validationErrors.value = {}

  if (schedule) {
    form.value = {
      routeId: schedule.routeId,
      departureTime: schedule.departureTime.substring(0, 5), // Remove seconds
      // Đảm bảo daysOfWeek là một mảng mới và đã được chuyển sang chữ hoa
      daysOfWeek: Array.isArray(schedule.daysOfWeek)
        ? schedule.daysOfWeek.map((day) => day.toUpperCase())
        : [],
    }
  } else {
    form.value = {
      routeId: '',
      departureTime: '',
      daysOfWeek: [],
    }
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  currentRouteSchedule.value = null
  validationErrors.value = {}
  form.value = {
    routeId: '',
    departureTime: '',
    daysOfWeek: [],
  }
}

// Submit handler
const handleSubmit = async () => {
  try {
    if (!validateForm()) {
      return
    }

    const scheduleData = {
      route: {
        routeId: parseInt(form.value.routeId),
      },
      departureTime: form.value.departureTime + ':00',
      // Đảm bảo daysOfWeek luôn là mảng mới và ở dạng chữ hoa
      daysOfWeek: [...form.value.daysOfWeek].map((day) => day.toUpperCase()),
    }

    if (currentRouteSchedule.value) {
      await updateRouteSchedule(currentRouteSchedule.value.scheduleId, scheduleData)
      alert('Cập nhật lịch trình thành công!')
    } else {
      await createRouteSchedule(scheduleData)
      alert('Thêm lịch trình thành công!')
    }

    await fetchRouteSchedules()
    closeModal()
  } catch (error) {
    console.error('Error saving route schedule:', error)
    if (error.response?.data?.message) {
      alert(`Lỗi: ${error.response.data.message}`)
    } else {
      alert('Có lỗi xảy ra khi lưu lịch trình!')
    }
  }
}

// Delete handler
const handleDelete = async (scheduleId) => {
  if (confirm('Bạn có chắc chắn muốn xóa lịch trình này?')) {
    try {
      await deleteRouteSchedule(scheduleId)
      await fetchRouteSchedules()
    } catch (error) {
      console.error('Error deleting route schedule:', error)
      alert('Có lỗi xảy ra khi xóa lịch trình!')
    }
  }
}

// Fetch data on component mount
onMounted(() => {
  fetchRouteSchedules()
  fetchRoutes()
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

.form-check-input.is-invalid ~ .form-check-label {
  color: #dc3545;
}

.form-check-label {
  font-size: 12px;
}
</style>

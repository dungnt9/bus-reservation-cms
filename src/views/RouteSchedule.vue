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
      <form @submit.prevent="handleSubmit">
        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label">Tuyến xe<span class="text-danger">*</span></label>
            <select
              class="form-control"
              v-model="form.routeId"
              required
            >
              <option value="" disabled>Chọn tuyến xe</option>
              <option
                v-for="route in routes"
                :key="route.routeId"
                :value="route.routeId"
              >
                {{ route.routeName }} ({{ route.distance }}km)
              </option>
            </select>
          </div>
          <div class="col-md-6 mb-3">
            <label class="form-label">Giờ khởi hành<span class="text-danger">*</span></label>
            <input type="time" class="form-control" v-model="form.departureTime" required />
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label">Ngày trong tuần</label>
          <div class="row">
            <div class="col" v-for="day in daysOfWeek" :key="day">
              <div class="form-check">
                <input
                  class="form-check-input"
                  type="checkbox"
                  :id="day"
                  :value="day"
                  v-model="form.daysOfWeek"
                />
                <label class="form-check-label" :for="day">
                  {{ formatDayName(day) }}
                </label>
              </div>
            </div>
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
  deleteRouteSchedule
} from '../services/routeScheduleService'
import { getAllRoutes } from '../services/routeService'
import CustomModal from '../components/Modal.vue'

// Reactive state
const routeSchedules = ref([])
const routes = ref([])
const showModal = ref(false)
const currentRouteSchedule = ref(null)
const filters = ref({})

// Days of week
const daysOfWeek = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
]

// Columns definition
const columns = {
  scheduleId: 'ID Lịch trình',
  routeId: 'ID Tuyến xe',
  routeName: 'Tên tuyến xe',
  departureTime: 'Giờ khởi hành',
  daysOfWeek: 'Các ngày trong tuần'
}

// Initial form state
const form = ref({
  scheduleId: null,
  routeId: null,
  departureTime: '',
  daysOfWeek: []
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
    Sunday: 'Chủ nhật'
  }
  return dayNames[day] || day
}

// Utility function to format column values
const formatColumnValue = (value, column) => {
  if (column === 'daysOfWeek' && Array.isArray(value)) {
    return value.map(formatDayName).join(', ')
  }
  if (column === 'routeName') {
    const route = routes.value.find(r => r.routeId === value)
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
      return scheduleValue.toString().toLowerCase().includes(value.toLowerCase())
    })
  })
})

// Fetch route schedules
const fetchRouteSchedules = async () => {
  try {
    routeSchedules.value = await getAllRouteSchedules()
  } catch (error) {
    console.error('Error fetching route schedules:', error)
  }
}

// Fetch routes
const fetchRoutes = async () => {
  try {
    routes.value = await getAllRoutes()
  } catch (error) {
    console.error('Error fetching routes:', error)
  }
}

// Utility function to get nested object values
const getNestedValue = (obj, path) => {
  return path.split('.').reduce((o, key) => o?.[key], obj) || ''
}

// Modal methods
const openModal = (schedule = null) => {
  currentRouteSchedule.value = schedule
  form.value = schedule
    ? {
      scheduleId: schedule.scheduleId,
      routeId: schedule.routeId,
      departureTime: schedule.departureTime,
      daysOfWeek: schedule.daysOfWeek
    }
    : {
      scheduleId: null,
      routeId: null,
      departureTime: '',
      daysOfWeek: []
    }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  currentRouteSchedule.value = null
  form.value = {
    scheduleId: null,
    routeId: null,
    departureTime: '',
    daysOfWeek: []
  }
}

// Submit handler
const handleSubmit = async () => {
  // Validate required fields
  if (!form.value.routeId || !form.value.departureTime) {
    alert('Vui lòng nhập đủ thông tin cần thiết!')
    return
  }

  try {
    const routeScheduleData = {
      ...form.value,
      route: { routeId: form.value.routeId } // Ensure route is an object with routeId
    }

    if (currentRouteSchedule.value) {
      await updateRouteSchedule(currentRouteSchedule.value.scheduleId, routeScheduleData)
    } else {
      await createRouteSchedule(routeScheduleData)
    }

    await fetchRouteSchedules()
    closeModal()
  } catch (error) {
    console.error('Error saving route schedule:', error)
    alert('Có lỗi xảy ra khi lưu lịch trình!')
  }
}

// Delete handler
const handleDelete = async (scheduleId) => {
  try {
    await deleteRouteSchedule(scheduleId)
    await fetchRouteSchedules()
  } catch (error) {
    console.error('Error deleting route schedule:', error)
  }
}

// Fetch route schedules and routes on component mount
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
</style>

<template>
  <div class="bg-white p-4 rounded-lg border">
    <h2 class="text-primary fw-bold mb-4">Quản lý Chuyến xe</h2>
    <button
      class="btn btn-success mb-3"
      @click="openModal(null)"
      style="background-color: white; color: green"
    >
      <i class="fas fa-plus"></i> Thêm chuyến xe
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
      <tr v-for="trip in filteredTrips" :key="trip.tripId">
        <td v-for="(label, column) in columns" :key="column" class="text-center">
          {{ formatColumnValue(trip[column], column) }}
        </td>
        <td class="action">
          <button class="btn btn-warning btn-sm me-2" @click="openModal(trip)">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-danger btn-sm" @click="handleDelete(trip.tripId)">
            <i class="fas fa-trash-alt"></i>
          </button>
        </td>
      </tr>
      </tbody>
    </table>

    <CustomModal
      v-model="showModal"
      :title="currentTrip ? 'Chỉnh sửa chuyến xe' : 'Thêm chuyến xe'"
    >
      <form @submit.prevent="handleSubmit" novalidate>
        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label">Lịch trình<span class="text-danger">*</span></label>
            <select
              class="form-control"
              v-model="form.scheduleId"
              :class="{ 'is-invalid': validationErrors.scheduleId }"
              :disabled="currentTrip"
            >
              <option value="">Chọn lịch trình</option>
              <option
                v-for="schedule in routeSchedules"
                :key="schedule.scheduleId"
                :value="schedule.scheduleId"
              >
                {{ schedule.routeName }} - {{ formatTime(schedule.departureTime) }}
                ({{ formatDaysOfWeek(schedule.daysOfWeek) }})
              </option>
            </select>
            <div class="invalid-feedback" v-if="validationErrors.scheduleId">
              {{ validationErrors.scheduleId }}
            </div>
          </div>
          <div class="col-md-6 mb-3">
            <label class="form-label">Tài xế<span class="text-danger">*</span></label>
            <select
              class="form-control"
              v-model="form.driverId"
              :class="{ 'is-invalid': validationErrors.driverId }"
              :disabled="currentTrip"
            >
              <option value="">Chọn tài xế</option>
              <option
                v-for="driver in drivers"
                :key="driver.driverId"
                :value="driver.driverId"
              >
                {{ driver.fullName }}
              </option>
            </select>
            <div class="invalid-feedback" v-if="validationErrors.driverId">
              {{ validationErrors.driverId }}
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label">Phụ xe<span class="text-danger">*</span></label>
            <select
              class="form-control"
              v-model="form.assistantId"
              :class="{ 'is-invalid': validationErrors.assistantId }"
              :disabled="currentTrip"
            >
              <option value="">Chọn phụ xe</option>
              <option
                v-for="assistant in assistants"
                :key="assistant.assistantId"
                :value="assistant.assistantId"
              >
                {{ assistant.fullName }}
              </option>
            </select>
            <div class="invalid-feedback" v-if="validationErrors.assistantId">
              {{ validationErrors.assistantId }}
            </div>
          </div>
          <div class="col-md-6 mb-3" v-if="!currentTrip">
            <label class="form-label">Xe<span class="text-danger">*</span></label>
            <select
              class="form-control"
              v-model="form.vehicleId"
              :class="{ 'is-invalid': validationErrors.vehicleId }"
            >
              <option value="">Chọn xe</option>
              <option
                v-for="vehicle in availableVehicles"
                :key="vehicle.vehicleId"
                :value="vehicle.vehicleId"
              >
                {{ vehicle.plateNumber }} ({{ vehicle.seatCapacity }} ghế)
              </option>
            </select>
            <div class="invalid-feedback" v-if="validationErrors.vehicleId">
              {{ validationErrors.vehicleId }}
            </div>
          </div>
          <div class="col-md-6 mb-3" v-else>
            <label class="form-label">Biển số xe</label>
            <input
              type="text"
              class="form-control"
              :value="form.vehiclePlateNumber"
              disabled
            />
          </div>
        </div>

        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label">Thời gian khởi hành (dự kiến)<span class="text-danger">*</span></label>
            <input
              type="datetime-local"
              class="form-control"
              v-model="form.scheduledDeparture"
              :class="{ 'is-invalid': validationErrors.scheduledDeparture }"
              :disabled="currentTrip"
            />
            <div class="invalid-feedback" v-if="validationErrors.scheduledDeparture">
              {{ validationErrors.scheduledDeparture }}
            </div>
          </div>
          <div class="col-md-6 mb-3">
            <label class="form-label">Thời gian đến (dự kiến)<span class="text-danger">*</span></label>
            <input
              type="datetime-local"
              class="form-control"
              v-model="form.scheduledArrival"
              :class="{ 'is-invalid': validationErrors.scheduledArrival }"
              :disabled="currentTrip"
            />
            <div class="invalid-feedback" v-if="validationErrors.scheduledArrival">
              {{ validationErrors.scheduledArrival }}
            </div>
          </div>
        </div>

        <!-- Hiển thị chỉ khi chỉnh sửa -->
        <div v-if="currentTrip">
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Thời gian khởi hành thực tế</label>
              <input
                type="datetime-local"
                class="form-control"
                v-model="form.actualDeparture"
              />
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Thời gian đến thực tế</label>
              <input
                type="datetime-local"
                class="form-control"
                v-model="form.actualArrival"
              />
            </div>
          </div>

          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Trạng thái chuyến xe</label>
              <select class="form-control" v-model="form.tripStatus">
                <option value="in_progress">Đang chạy</option>
                <option value="completed">Đã hoàn thành</option>
                <option value="cancelled">Đã hủy</option>
              </select>
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Tổng số ghế</label>
              <input
                type="text"
                class="form-control"
                :value="form.totalSeats"
                disabled
              />
            </div>
          </div>

          <div class="row mt-3">
            <div class="col-12">
              <h5>Thông tin ghế</h5>
              <div class="table-responsive">
                <table class="table table-sm">
                  <thead>
                  <tr>
                    <th>Số ghế</th>
                    <th>Biển số xe</th>
                    <th>Trạng thái</th>
                  </tr>
                  </thead>
                  <tbody>
                  <tr v-for="seat in form.tripSeats" :key="seat.tripSeatId">
                    <td>{{ seat.seatNumber }}</td>
                    <td>{{ seat.vehiclePlateNumber }}</td>
                    <td>
                      <select v-model="seat.status" class="form-select form-select-sm">
                        <option value="available">Trống</option>
                        <option value="booked">Đã đặt</option>
                      </select>
                    </td>
                  </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </form>

      <template #footer>
        <button class="btn btn-secondary me-2" @click="closeModal">Hủy</button>
        <button class="btn btn-primary" @click="handleSubmit">
          {{ currentTrip ? 'Lưu thay đổi' : 'Thêm chuyến xe' }}
        </button>
      </template>
    </CustomModal>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import {
  getAllTrips,
  createTrip,
  updateTrip,
  deleteTrip,
  getAvailableDrivers,
  getAvailableAssistants,
  getActiveRouteSchedules,
  getAvailableVehicles
} from '../services/tripService'
import CustomModal from '../components/Modal.vue'

// Reactive state
const trips = ref([])
const drivers = ref([])
const assistants = ref([])
const routeSchedules = ref([])
const availableVehicles = ref([])
const showModal = ref(false)
const currentTrip = ref(null)
const filters = ref({})
const validationErrors = ref({})

// Columns definition
const columns = {
  tripId: 'ID Chuyến xe',
  routeName: 'Tuyến xe',
  driverName: 'Tài xế',
  assistantName: 'Phụ xe',
  vehiclePlateNumber: 'Biển số xe',
  totalSeats: 'Tổng số ghế',
  availableSeats: 'Số ghế trống',
  scheduledDeparture: 'Giờ khởi hành (dự kiến)',
  scheduledArrival: 'Giờ đến (dự kiến)',
  actualDeparture: 'Giờ khởi hành thực tế',
  actualArrival: 'Giờ đến thực tế',
  tripStatus: 'Trạng thái chuyến xe'
}

// Initial form state
const form = ref({
  scheduleId: '',
  driverId: '',
  assistantId: '',
  vehicleId: '',
  scheduledDeparture: '',
  scheduledArrival: '',
  actualDeparture: '',
  actualArrival: '',
  tripStatus: 'in_progress',
  vehiclePlateNumber: '',
  totalSeats: 0,
  availableSeats: 0,
  tripSeats: []
})

// Helper functions
const formatDayOfWeek = (dayString) => {
  const dayMap = {
    'MONDAY': 'Thứ 2',
    'TUESDAY': 'Thứ 3',
    'WEDNESDAY': 'Thứ 4',
    'THURSDAY': 'Thứ 5',
    'FRIDAY': 'Thứ 6',
    'SATURDAY': 'Thứ 7',
    'SUNDAY': 'Chủ nhật'
  }
  return dayMap[dayString] || dayString
}

const formatDaysOfWeek = (days) => {
  return days.map(formatDayOfWeek).join(', ')
}

const formatTime = (time) => {
  if (!time) return ''
  return time.substring(0, 5)
}

const validateForm = () => {
  validationErrors.value = {}
  let isValid = true

  if (!form.value.scheduleId) {
    validationErrors.value.scheduleId = 'Vui lòng chọn lịch trình'
    isValid = false
  }

  if (!form.value.driverId) {
    validationErrors.value.driverId = 'Vui lòng chọn tài xế'
    isValid = false
  }

  if (!form.value.assistantId) {
    validationErrors.value.assistantId = 'Vui lòng chọn phụ xe'
    isValid = false
  }

  if (!currentTrip.value && !form.value.vehicleId) {
    validationErrors.value.vehicleId = 'Vui lòng chọn xe'
    isValid = false
  }

  if (!form.value.scheduledDeparture) {
    validationErrors.value.scheduledDeparture = 'Vui lòng chọn thời gian khởi hành dự kiến'
    isValid = false
  }

  if (!form.value.scheduledArrival) {
    validationErrors.value.scheduledArrival = 'Vui lòng chọn thời gian đến dự kiến'
    isValid = false
  }

  // Validate scheduled departure matches route schedule days
  if (form.value.scheduleId && form.value.scheduledDeparture) {
    const selectedSchedule = routeSchedules.value.find(s => s.scheduleId === form.value.scheduleId)
    if (selectedSchedule) {
      const departureDate = new Date(form.value.scheduledDeparture)
      const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']
      const departureDayName = days[departureDate.getDay()]

      if (!selectedSchedule.daysOfWeek.includes(departureDayName)) {
        validationErrors.value.scheduledDeparture =
          `Ngày khởi hành phải là một trong các ngày: ${formatDaysOfWeek(selectedSchedule.daysOfWeek)}`
        isValid = false
      }
    }
  }

  // Validate departure time is in the future
  if (form.value.scheduledDeparture) {
    const departureTime = new Date(form.value.scheduledDeparture)
    const now = new Date()
    if (departureTime <= now) {
      validationErrors.value.scheduledDeparture = 'Thời gian khởi hành phải là thời gian trong tương lai'
      isValid = false
    }
  }

  // Validate arrival time is after departure time
  if (form.value.scheduledDeparture && form.value.scheduledArrival) {
    const departureTime = new Date(form.value.scheduledDeparture)
    const arrivalTime = new Date(form.value.scheduledArrival)
    if (arrivalTime <= departureTime) {
      validationErrors.value.scheduledArrival = 'Thời gian đến phải sau thời gian khởi hành'
      isValid = false
    }
  }

  // Validate actual times if provided
  if (form.value.actualDeparture && form.value.actualArrival) {
    const actualDepartureTime = new Date(form.value.actualDeparture)
    const actualArrivalTime = new Date(form.value.actualArrival)
    if (actualArrivalTime <= actualDepartureTime) {
      validationErrors.value.actualArrival = 'Thời gian đến thực tế phải sau thời gian khởi hành thực tế'
      isValid = false
    }
  }

  return isValid
}
const formatColumnValue = (value, column) => {
  if (!value) return ''

  if (column.includes('scheduled') || column.includes('actual')) {
    return new Date(value).toLocaleString('vi-VN')
  }

  if (column === 'tripStatus') {
    const statusMap = {
      'in_progress': 'Đang chạy',
      'completed': 'Đã hoàn thành',
      'cancelled': 'Đã hủy'
    }
    return statusMap[value] || value
  }

  return value
}

// Computed
const filteredTrips = computed(() => {
  return trips.value.filter((trip) => {
    return Object.entries(filters.value).every(([key, value]) => {
      if (!value) return true
      const tripValue = trip[key]
      return String(tripValue).toLowerCase().includes(value.toLowerCase())
    })
  })
})

// Methods
const fetchData = async () => {
  try {
    const [tripsData, driversData, assistantsData, schedulesData, vehiclesData] = await Promise.all([
      getAllTrips(),
      getAvailableDrivers(),
      getAvailableAssistants(),
      getActiveRouteSchedules(),
      getAvailableVehicles()
    ])

    trips.value = tripsData
    drivers.value = driversData
    assistants.value = assistantsData
    routeSchedules.value = schedulesData
    availableVehicles.value = vehiclesData
  } catch (error) {
    console.error('Error fetching data:', error)
    alert('Có lỗi xảy ra khi tải dữ liệu!')
  }
}

const openModal = (trip = null) => {
  currentTrip.value = trip
  validationErrors.value = {}

  if (trip) {
    form.value = {
      scheduleId: trip.scheduleId,
      driverId: trip.driverId,
      assistantId: trip.assistantId,
      scheduledDeparture: trip.scheduledDeparture ? new Date(trip.scheduledDeparture).toISOString().slice(0, 16) : '',
      scheduledArrival: trip.scheduledArrival ? new Date(trip.scheduledArrival).toISOString().slice(0, 16) : '',
      actualDeparture: trip.actualDeparture ? new Date(trip.actualDeparture).toISOString().slice(0, 16) : '',
      actualArrival: trip.actualArrival ? new Date(trip.actualArrival).toISOString().slice(0, 16) : '',
      tripStatus: trip.tripStatus,
      vehiclePlateNumber: trip.vehiclePlateNumber,
      totalSeats: trip.totalSeats,
      availableSeats: trip.availableSeats,
      tripSeats: trip.tripSeats.map(seat => ({
        ...seat,
        status: seat.status
      }))
    }
  } else {
    form.value = {
      scheduleId: '',
      driverId: '',
      assistantId: '',
      vehicleId: '',
      scheduledDeparture: '',
      scheduledArrival: '',
      actualDeparture: '',
      actualArrival: '',
      tripStatus: 'in_progress',
      vehiclePlateNumber: '',
      totalSeats: 0,
      availableSeats: 0,
      tripSeats: []
    }
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  currentTrip.value = null
  validationErrors.value = {}
  form.value = {
    scheduleId: '',
    driverId: '',
    assistantId: '',
    vehicleId: '',
    scheduledDeparture: '',
    scheduledArrival: '',
    actualDeparture: '',
    actualArrival: '',
    tripStatus: 'in_progress',
    vehiclePlateNumber: '',
    totalSeats: 0,
    availableSeats: 0,
    tripSeats: []
  }
}

const handleSubmit = async () => {
  try {
    if (!validateForm()) {
      return
    }

    const tripData = {
      scheduleId: form.value.scheduleId,
      driverId: form.value.driverId,
      assistantId: form.value.assistantId,
      vehicleId: form.value.vehicleId,
      scheduledDeparture: form.value.scheduledDeparture ? new Date(form.value.scheduledDeparture).toISOString() : null,
      scheduledArrival: form.value.scheduledArrival ? new Date(form.value.scheduledArrival).toISOString() : null,
      actualDeparture: form.value.actualDeparture ? new Date(form.value.actualDeparture).toISOString() : null,
      actualArrival: form.value.actualArrival ? new Date(form.value.actualArrival).toISOString() : null,
      tripStatus: form.value.tripStatus,
      tripSeats: form.value.tripSeats?.map(seat => ({
        tripSeatId: seat.tripSeatId,
        status: seat.status
      }))
    }

    if (currentTrip.value) {
      await updateTrip(currentTrip.value.tripId, tripData)
    } else {
      await createTrip(tripData)
    }

    await fetchData()
    closeModal()
  } catch (error) {
    console.error('Error saving trip:', error)
    const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi lưu thông tin!'
    alert(errorMessage)
  }
}

const handleDelete = async (tripId) => {
  if (confirm('Bạn có chắc chắn muốn xóa chuyến xe này?')) {
    try {
      await deleteTrip(tripId)
      await fetchData()
    } catch (error) {
      console.error('Error deleting trip:', error)
      alert('Có lỗi xảy ra khi xóa chuyến xe!')
    }
  }
}

// Fetch data on component mount
onMounted(fetchData)
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

.table-responsive {
  max-height: 300px;
  overflow-y: auto;
}

.invalid-feedback {
  display: block;
  margin-top: 0.25rem;
}

/* Add styles for disabled select boxes */
select:disabled {
  background-color: #e9ecef;
  opacity: 1;
}
</style>

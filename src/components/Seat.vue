// src/components/Seat.vue
<template>
  <div class="seat-container">
    <h5 class="text-center mb-3">Tầng 1</h5>

    <div class="seat-layout">
      <div class="driver-area mb-4">
        <div class="position-box bg-secondary text-white">Lái Xe</div>
        <div class="position-box bg-secondary text-white">Phụ Xe</div>
        <div class="position-box bg-secondary text-white">Cửa</div>
      </div>

      <div class="seats-grid">
        <div v-for="i in 45" :key="i" class="seat-item">
          <button
            class="seat-btn"
            :class="{
              'selected': modelValue.includes(i),
              'booked': bookedSeats.includes(i)
            }"
            :disabled="bookedSeats.includes(i)"
            @click="toggleSeat(i)"
          >
            {{ i }}
          </button>
        </div>
      </div>

      <div class="seat-legend mt-4">
        <div class="legend-item">
          <div class="legend-box available"></div>
          <span>Ghế trống</span>
        </div>
        <div class="legend-item">
          <div class="legend-box selected"></div>
          <span>Ghế đã chọn</span>
        </div>
        <div class="legend-item">
          <div class="legend-box booked"></div>
          <span>Ghế đã đặt</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  bookedSeats: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue'])

const toggleSeat = (seatNumber) => {
  let newSelected = [...props.modelValue]
  const index = newSelected.indexOf(seatNumber)

  if (index === -1) {
    newSelected.push(seatNumber)
  } else {
    newSelected.splice(index, 1)
  }

  emit('update:modelValue', newSelected)
}
</script>

<style scoped>
.seat-container {
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.driver-area {
  display: flex;
  justify-content: space-between;
  padding: 0 40px;
}

.position-box {
  padding: 8px 16px;
  border-radius: 4px;
  text-align: center;
}

.seats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  padding: 20px;
}

.seat-btn {
  width: 40px;
  height: 40px;
  border: 1px solid #dee2e6;
  background-color: white;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.seat-btn:hover:not(:disabled) {
  background-color: #e9ecef;
}

.seat-btn.selected {
  background-color: #28a745;
  color: white;
  border-color: #28a745;
}

.seat-btn.booked {
  background-color: #dc3545;
  color: white;
  border-color: #dc3545;
  cursor: not-allowed;
}

.seat-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.seat-legend {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-box {
  width: 20px;
  height: 20px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
}

.legend-box.available {
  background-color: white;
}

.legend-box.selected {
  background-color: #28a745;
}

.legend-box.booked {
  background-color: #dc3545;
}
</style>

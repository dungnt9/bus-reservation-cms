<template>
  <div class="dashboard-container">
    <!-- Header Section -->
    <div class="dashboard-header">
      <div class="header-content">
        <h1 class="dashboard-title">
          <i class="fas fa-chart-line mr-2"></i>
          Dashboard Thống Kê
        </h1>

        <!-- Date Filter Section -->
        <div class="date-filters">
          <div class="filter-group">
            <label>
              <i class="far fa-calendar-alt"></i>
              Từ ngày:
            </label>
            <input
              type="date"
              v-model="filters.startDate"
              :max="filters.endDate"
              class="date-input"
            />
          </div>
          <div class="filter-group">
            <label>
              <i class="far fa-calendar-alt"></i>
              Đến ngày:
            </label>
            <input
              type="date"
              v-model="filters.endDate"
              :min="filters.startDate"
              class="date-input"
            />
          </div>
          <button @click="fetchData" class="filter-button">
            <i class="fas fa-filter mr-2"></i>
            Lọc Dữ Liệu
          </button>
        </div>
      </div>
    </div>

    <!-- Quick Stats Section -->
    <div class="quick-stats">
      <div class="stat-card revenue">
        <div class="stat-icon">
          <i class="fas fa-money-bill-wave"></i>
        </div>
        <div class="stat-content">
          <h3>Tổng Doanh Thu</h3>
          <p class="stat-value">{{ formatCurrency(dashboardData.totalRevenue) }}</p>
          <p class="stat-label">Kỳ hiện tại</p>
        </div>
      </div>

      <div class="stat-card trips">
        <div class="stat-icon">
          <i class="fas fa-bus"></i>
        </div>
        <div class="stat-content">
          <h3>Tổng Chuyến</h3>
          <p class="stat-value">{{ dashboardData.tripStats?.total || 0 }}</p>
          <p class="stat-label">Chuyến xe đã thực hiện</p>
        </div>
      </div>

      <div class="stat-card customers">
        <div class="stat-icon">
          <i class="fas fa-users"></i>
        </div>
        <div class="stat-content">
          <h3>Khách Hàng Mới</h3>
          <p class="stat-value">{{ dashboardData.newCustomers || 0 }}</p>
          <p class="stat-label">Trong kỳ</p>
        </div>
      </div>

      <div class="stat-card performance">
        <div class="stat-icon">
          <i class="fas fa-chart-pie"></i>
        </div>
        <div class="stat-content">
          <h3>Tỷ Lệ Hoàn Thành</h3>
          <p class="stat-value">{{ calculateCompletionRate() }}%</p>
          <p class="stat-label">Chuyến xe thành công</p>
        </div>
      </div>
    </div>

    <!-- Charts Grid -->
    <div class="charts-grid">
      <!-- Revenue Chart -->
      <div class="chart-card wide">
        <div class="chart-header">
          <h3><i class="fas fa-chart-line mr-2"></i> Xu Hướng Doanh Thu</h3>
        </div>
        <div class="chart-body">
          <Line :data="revenueTrendChart" :options="lineChartOptions" />
        </div>
      </div>

      <!-- Trip Status Chart -->
      <div class="chart-card">
        <div class="chart-header">
          <h3><i class="fas fa-chart-pie mr-2"></i> Trạng Thái Chuyến Xe</h3>
        </div>
        <div class="chart-body">
          <Pie :data="tripStatusChart" :options="pieChartOptions" />
        </div>
      </div>

      <!-- Customer Trend Chart -->
      <div class="chart-card">
        <div class="chart-header">
          <h3><i class="fas fa-users mr-2"></i> Xu Hướng Khách Hàng</h3>
        </div>
        <div class="chart-body">
          <Line :data="customerTrendChart" :options="lineChartOptions" />
        </div>
      </div>

      <!-- Time Comparison Chart -->
      <div class="chart-card">
        <div class="chart-header">
          <h3><i class="fas fa-clock mr-2"></i> So Sánh Thời Gian</h3>
        </div>
        <div class="chart-body">
          <Bar :data="timeComparisonChart" :options="barChartOptions" />
        </div>
      </div>

      <!-- Route Performance Chart -->
      <div class="chart-card">
        <div class="chart-header">
          <h3><i class="fas fa-route mr-2"></i> Hiệu Suất Tuyến Xe</h3>
        </div>
        <div class="chart-body">
          <Bar :data="tripsByRouteChart" :options="barChartOptions" />
        </div>
      </div>
    </div>

    <!-- Loading Overlay -->
    <div class="loading-overlay" v-if="isLoading">
      <div class="loader"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { Bar, Line, Pie } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
} from 'chart.js'
import api from '@/services/api'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement,
)

// State
const dashboardData = ref({})
const filters = ref({
  startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString()
    .split('T')[0], // First day of current month
  endDate: new Date().toISOString().split('T')[0], // Today
})

// Chart Options
const barChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
}

const lineChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
}

const pieChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
}

const tripStatusChart = computed(() => ({
  labels: ['Hoàn thành', 'Đang chạy', 'Đã hủy'],
  datasets: [
    {
      data: [
        dashboardData.value.tripStatusDistribution?.completed || 0,
        dashboardData.value.tripStatusDistribution?.in_progress || 0,
        dashboardData.value.tripStatusDistribution?.cancelled || 0,
      ],
      backgroundColor: [
        'rgba(75, 192, 192, 0.5)',
        'rgba(54, 162, 235, 0.5)',
        'rgba(255, 99, 132, 0.5)',
      ],
      borderColor: ['rgb(75, 192, 192)', 'rgb(54, 162, 235)', 'rgb(255, 99, 132)'],
      borderWidth: 1,
    },
  ],
}))

const customerTrendChart = computed(() => {
  const sortedDates = Object.keys(dashboardData.value.newCustomersOverTime || {}).sort()
  return {
    labels: sortedDates,
    datasets: [
      {
        label: 'Khách hàng mới',
        data: sortedDates.map((date) => dashboardData.value.newCustomersOverTime?.[date] || 0),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
        fill: false,
      },
    ],
  }
})

const timeComparisonChart = computed(() => {
  const routes = Object.keys(dashboardData.value.timeComparison || {})
  return {
    labels: routes,
    datasets: [
      {
        label: 'Thời gian dự kiến (phút)',
        data: routes.map((route) => dashboardData.value.timeComparison?.[route]?.scheduled || 0),
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgb(54, 162, 235)',
        borderWidth: 1,
      },
      {
        label: 'Thời gian thực tế (phút)',
        data: routes.map((route) => dashboardData.value.timeComparison?.[route]?.actual || 0),
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderColor: 'rgb(255, 99, 132)',
        borderWidth: 1,
      },
    ],
  }
})

const tripsByRouteChart = computed(() => ({
  labels: Object.keys(dashboardData.value.tripsByRoute || {}),
  datasets: [
    {
      label: 'Số chuyến theo tuyến',
      data: Object.values(dashboardData.value.tripsByRoute || {}),
      backgroundColor: 'rgba(153, 102, 255, 0.5)',
      borderColor: 'rgb(153, 102, 255)',
      borderWidth: 1,
    },
  ],
}))

const revenueTrendChart = computed(() => {
  const sortedDates = Object.keys(dashboardData.value.revenueOverTime || {}).sort()
  return {
    labels: sortedDates,
    datasets: [
      {
        label: 'Doanh thu theo thời gian',
        data: sortedDates.map((date) => dashboardData.value.revenueOverTime?.[date] || 0),
        borderColor: 'rgb(255, 159, 64)',
        tension: 0.1,
        fill: false,
      },
    ],
  }
})

const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value || 0)
}

// Add new method for completion rate calculation
const calculateCompletionRate = () => {
  const total = dashboardData.value.tripStats?.total || 0
  const completed = dashboardData.value.tripStats?.completed || 0
  return total > 0 ? Math.round((completed / total) * 100) : 0
}

// Add loading state
const isLoading = ref(false)

// Enhanced fetchData with loading state
const fetchData = async () => {
  isLoading.value = true
  try {
    const response = await api.get('/reports/dashboard', {
      params: {
        startDate: filters.value.startDate,
        endDate: filters.value.endDate,
      },
    })
    dashboardData.value = response
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
  } finally {
    isLoading.value = false
  }
}

// Lifecycle hooks
onMounted(fetchData)
</script>

<style scoped>
.dashboard-container {
  background-color: #f8f9fa;
  min-height: 100vh;
  padding: 1.5rem 1.5rem 1.5rem 1.5rem;
  position: relative;
  font-size: 0.8rem;
}

.dashboard-header {
  background: linear-gradient(135deg, #4a90e2 0%, #2c5282 100%);
  color: white;
  padding: 2rem;
  border-radius: 1rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
}

.dashboard-title {
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
}

.date-filters {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.date-input {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  padding: 0.5rem;
  color: white;
  outline: none;
}

.filter-button {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-button:hover {
  background: rgba(255, 255, 255, 0.2);
}

.quick-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); /* Điều chỉnh kích thước thẻ */
  gap: 1rem;
  margin-bottom: 1rem;
}

.stat-card {
  background: white;
  border-radius: 1rem;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-icon {
  background: #4a90e2;
  color: white;
  width: 3rem;
  height: 3rem;
  border-radius: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #482d2d;
  margin: 0.5rem 0;
}

.stat-label {
  color: #718096;
  font-size: 0.75rem;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.chart-card {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.chart-card.wide {
  grid-column: span 2;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.chart-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2d3748;
}

.chart-actions {
  display: flex;
  gap: 0.5rem;
}

.chart-action-btn {
  background: none;
  border: none;
  color: #718096;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
}

.chart-action-btn:hover {
  background: #f7fafc;
  color: #4a90e2;
}

.chart-body {
  height: 250px;
  position: relative;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loader {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #4a90e2;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Responsive Adjustments */
@media (max-width: 1024px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }

  .chart-card.wide {
    grid-column: auto;
  }
}

@media (max-width: 768px) {
  .quick-stats {
    grid-template-columns: 1fr;
  }

  .date-filters {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-group {
    flex-direction: column;
    align-items: stretch;
  }
}

/* Color variations for stat cards */
.stat-card.revenue .stat-icon {
  background: #48bb78;
}
.stat-card.trips .stat-icon {
  background: #4299e1;
}
.stat-card.customers .stat-icon {
  background: #9f7aea;
}
.stat-card.performance .stat-icon {
  background: #ed8936;
}
</style>

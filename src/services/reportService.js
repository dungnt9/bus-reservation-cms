import api from './api'

export const getDashboardData = async (startDate, endDate) => {
  try {
    const response = await api.get('/reports/dashboard', {
      params: { startDate, endDate },
    })
    return response
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    throw error
  }
}

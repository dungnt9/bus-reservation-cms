import api from './api'

// Create a new route schedule
export const createRouteSchedule = async (routeSchedule) => {
  try {
    const response = await api.post('/route-schedules', routeSchedule)
    return response
  } catch (error) {
    console.error('Error creating route schedule:', error.response?.data?.message || error.message)
    throw error
  }
}

// Get all route schedules
export const getAllRouteSchedules = async (page = 0, size = 10, filters = {}) => {
  try {
    const { daysOfWeek, ...otherFilters } = filters

    const params = {
      page,
      size,
      ...otherFilters,
      ...(daysOfWeek
        ? { daysOfWeek: typeof daysOfWeek === 'string' ? daysOfWeek : daysOfWeek.join(',') }
        : {}),
    }

    const response = await api.get('/route-schedules', { params })
    return response
  } catch (error) {
    console.error('Error fetching route schedules:', error)
    throw error
  }
}

// Get a route schedule by ID
export const getRouteScheduleById = async (scheduleId) => {
  try {
    const response = await api.get(`/route-schedules/${scheduleId}`)
    return response
  } catch (error) {
    console.error(`Error fetching route schedule with ID ${scheduleId}:`, error)
    throw error
  }
}

// Update route schedule details
export const updateRouteSchedule = async (scheduleId, routeScheduleDetails) => {
  try {
    const response = await api.put(`/route-schedules/${scheduleId}`, routeScheduleDetails)
    return response
  } catch (error) {
    console.error(`Error updating route schedule with ID ${scheduleId}:`, error)
    throw error
  }
}

import api from './api'

export const createTrip = async (trip) => {
  try {
    const response = await api.post('/trips', trip) // Bỏ /api/ vì api.js đã có baseURL
    return response
  } catch (error) {
    console.error('Error creating trip:', error.response?.data?.message || error.message)
    throw error
  }
}

export const getAllTrips = async () => {
  try {
    const response = await api.get('/trips')
    return response
  } catch (error) {
    console.error('Error fetching trips:', error)
    throw error
  }
}

export const getAllTripsWithFilters = async (page = 0, size = 10, filters = {}) => {
  try {
    const params = {
      page,
      size,
      ...filters,
    }

    const response = await api.get('/trips', { params })
    return response
  } catch (error) {
    console.error('Error fetching trips:', error)
    throw error
  }
}

export const getTripById = async (tripId) => {
  try {
    const response = await api.get(`/trips/${tripId}`)
    return response
  } catch (error) {
    console.error(`Error fetching trip with ID ${tripId}:`, error)
    throw error
  }
}

export const updateTrip = async (tripId, tripDetails) => {
  try {
    const response = await api.put(`/trips/${tripId}`, tripDetails)
    return response
  } catch (error) {
    console.error(`Error updating trip with ID ${tripId}:`, error)
    throw error
  }
}

export const getAvailableDrivers = async () => {
  try {
    const response = await api.get('/trips/drivers/available')
    return response
  } catch (error) {
    console.error('Error fetching available drivers:', error)
    throw error
  }
}

export const getAvailableAssistants = async () => {
  try {
    const response = await api.get('/trips/assistants/available')
    return response
  } catch (error) {
    console.error('Error fetching available assistants:', error)
    throw error
  }
}

export const getActiveRouteSchedules = async () => {
  try {
    const response = await api.get('/trips/schedules/active')
    return response
  } catch (error) {
    console.error('Error fetching active route schedules:', error)
    throw error
  }
}

export const getAvailableVehicles = async () => {
  try {
    // Chỉ lấy những xe có status = active và không trong chuyến nào
    const response = await api.get('/vehicles/available-not-in-trip')
    return response
  } catch (error) {
    console.error('Error fetching available vehicles:', error)
    throw error
  }
}

// Tài xế đang chạy
export const getDriversForTrip = async (tripId) => {
  try {
    const response = await api.get(`/trips/${tripId}/drivers`)
    return response
  } catch (error) {
    console.error('Error fetching drivers for trip:', error)
    throw error
  }
}

export const getAssistantsForTrip = async (tripId) => {
  try {
    const response = await api.get(`/trips/${tripId}/assistants`)
    return response
  } catch (error) {
    console.error('Error fetching assistants for trip:', error)
    throw error
  }
}

export const getVehiclesForTrip = async (tripId) => {
  try {
    const response = await api.get(`/trips/${tripId}/vehicles/available`)
    return response
  } catch (error) {
    console.error('Error fetching vehicles for trip:', error)
    throw error
  }
}

// driverService.js
import api from './api' // Import the api instance from api.js

// Create a new driver
export const createDriver = async (driver) => {
  try {
    const response = await api.post('/drivers', driver)
    return response
  } catch (error) {
    console.error('Error creating driver:', error.response?.data?.message || error.message)
    throw error
  }
}

// Get all drivers
export const getAllDrivers = async (page = 0, size = 10, filters = {}) => {
  try {
    if (filters.gender) {
      const genderMap = {
        nam: 'male',
        nữ: 'female',
        khác: 'other',
      }
      filters.gender = genderMap[filters.gender.toLowerCase()] || filters.gender
    }

    if (filters.driverStatus) {
      const statusMap = {
        'sẵn sàng': 'available',
        'đang trong chuyến': 'on_trip',
        'nghỉ làm': 'off_duty',
      }
      filters.driverStatus = statusMap[filters.driverStatus.toLowerCase()] || filters.driverStatus
    }

    const params = {
      page,
      size,
      ...filters,
    }

    const response = await api.get('/drivers', { params })
    return response
  } catch (error) {
    console.error('Error fetching drivers:', error)
    throw error
  }
}

// Get a driver by ID
export const getDriverById = async (driverId) => {
  try {
    const response = await api.get(`/drivers/${driverId}`) // Using api instance to make a GET request by ID
    return response
  } catch (error) {
    console.error(`Error fetching driver with ID ${driverId}:`, error)
    throw error
  }
}

// Update driver details
export const updateDriver = async (driverId, driverDetails) => {
  try {
    const response = await api.put(`/drivers/${driverId}`, driverDetails) // Using api instance for PUT request
    return response
  } catch (error) {
    console.error(`Error updating driver with ID ${driverId}:`, error)
    throw error
  }
}

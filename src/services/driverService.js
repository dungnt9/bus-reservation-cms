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
export const getAllDrivers = async (page = 0, size = 10) => {
  try {
    const response = await api.get('/drivers', {
      params: { page, size },
    })
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

// Delete a driver
export const deleteDriver = async (driverId) => {
  try {
    const response = await api.delete(`/drivers/${driverId}`) // Using api instance for DELETE request
    return response
  } catch (error) {
    console.error(`Error deleting driver with ID ${driverId}:`, error)
    throw error
  }
}

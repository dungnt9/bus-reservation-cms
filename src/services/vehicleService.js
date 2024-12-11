// vehicleService.js
import api from './api' // Import the api instance from api.js

// Create a new vehicle
export const createVehicle = async (vehicle) => {
  try {
    const response = await api.post('/vehicles', vehicle)
    return response
  } catch (error) {
    console.error('Error creating vehicle:', error.response?.data?.message || error.message)
    throw error
  }
}

// Get all vehicles
export const getAllVehicles = async () => {
  try {
    const response = await api.get('/vehicles')
    console.log(response)
    return response
  } catch (error) {
    console.error('Error fetching vehicles:', error)
    throw error
  }
}

// Get a vehicle by ID
export const getVehicleById = async (vehicleId) => {
  try {
    const response = await api.get(`/vehicles/${vehicleId}`)
    return response
  } catch (error) {
    console.error(`Error fetching vehicle with ID ${vehicleId}:`, error)
    throw error
  }
}

// Update vehicle details
export const updateVehicle = async (vehicleId, vehicleDetails) => {
  try {
    const response = await api.put(`/vehicles/${vehicleId}`, vehicleDetails)
    return response
  } catch (error) {
    console.error(`Error updating vehicle with ID ${vehicleId}:`, error)
    throw error
  }
}

// Delete a vehicle
export const deleteVehicle = async (vehicleId) => {
  try {
    const response = await api.delete(`/vehicles/${vehicleId}`)
    return response
  } catch (error) {
    console.error(`Error deleting vehicle with ID ${vehicleId}:`, error)
    throw error
  }
}

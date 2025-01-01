// assistantService.js
import api from './api' // Import the api instance from api.js

// Create a new assistant
export const createAssistant = async (assistant) => {
  try {
    const response = await api.post('/assistants', assistant)
    return response
  } catch (error) {
    console.error('Error creating assistant:', error.response?.data?.message || error.message)
    throw error
  }
}

// Get all assistants
export const getAllAssistants = async (page = 0, size = 10, filters = {}) => {
  try {
    if (filters.gender) {
      const genderMap = {
        nam: 'male',
        nữ: 'female',
        khác: 'other',
      }
      filters.gender = genderMap[filters.gender.toLowerCase()] || filters.gender
    }

    if (filters.assistantStatus) {
      const statusMap = {
        'sẵn sàng': 'available',
        'đang trong chuyến': 'on_trip',
        'nghỉ làm': 'off_duty',
      }
      filters.assistantStatus =
        statusMap[filters.assistantStatus.toLowerCase()] || filters.assistantStatus
    }

    const params = {
      page,
      size,
      ...filters,
    }

    const response = await api.get('/assistants', { params })
    return response
  } catch (error) {
    console.error('Error fetching assistants:', error)
    throw error
  }
}

// Get an assistant by ID
export const getAssistantById = async (assistantId) => {
  try {
    const response = await api.get(`/assistants/${assistantId}`)
    return response
  } catch (error) {
    console.error(`Error fetching assistant with ID ${assistantId}:`, error)
    throw error
  }
}

// Update assistant details
export const updateAssistant = async (assistantId, assistantDetails) => {
  try {
    const response = await api.put(`/assistants/${assistantId}`, assistantDetails)
    return response
  } catch (error) {
    console.error(`Error updating assistant with ID ${assistantId}:`, error)
    throw error
  }
}

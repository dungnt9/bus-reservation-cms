import api from './api' // Import the api instance from api.js

// Create a new admin
export const createAdmin = async (admin) => {
  try {
    const response = await api.post('/admins', admin)
    return response
  } catch (error) {
    console.error('Error creating admin:', error.response?.data?.message || error.message)
    throw error
  }
}

// Get all admins
export const getAllAdmins = async (page = 0, size = 10, filters = {}) => {
  try {
    // Convert Vietnamese gender to English for API
    if (filters.gender) {
      const genderMap = {
        nam: 'male',
        nữ: 'female',
        khác: 'other',
      }
      filters.gender = genderMap[filters.gender.toLowerCase()] || filters.gender
    }

    // Xây dựng query params
    const params = {
      page,
      size,
      ...filters,
    }

    const response = await api.get('/admins', { params })
    return response
  } catch (error) {
    console.error('Error fetching admins:', error)
    throw error
  }
}

// Get an admin by ID
export const getAdminById = async (adminId) => {
  try {
    const response = await api.get(`/admins/${adminId}`)
    return response
  } catch (error) {
    console.error(`Error fetching admin with ID ${adminId}:`, error)
    throw error
  }
}

// Update admin details
export const updateAdmin = async (adminId, adminDetails) => {
  try {
    const response = await api.put(`/admins/${adminId}`, adminDetails)
    return response
  } catch (error) {
    console.error(`Error updating admin with ID ${adminId}:`, error)
    throw error
  }
}

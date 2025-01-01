// customerService.js
import api from './api' // Import the api instance from api.js

// Create a new customer
export const createCustomer = async (customer) => {
  try {
    const response = await api.post('/customers', customer)
    return response
  } catch (error) {
    console.error('Error creating customer:', error.response?.data?.message || error.message)
    throw error
  }
}

// Get all customers
export const getAllCustomers = async (page = 0, size = 10, filters = {}) => {
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

    const params = {
      page,
      size,
      ...filters,
    }

    const response = await api.get('/customers', { params })
    return response
  } catch (error) {
    console.error('Error fetching customers:', error)
    throw error
  }
}

// Get a customer by ID
export const getCustomerById = async (customerId) => {
  try {
    const response = await api.get(`/customers/${customerId}`)
    return response
  } catch (error) {
    console.error(`Error fetching customer with ID ${customerId}:`, error)
    throw error
  }
}

// Update customer details
export const updateCustomer = async (customerId, customerDetails) => {
  try {
    const response = await api.put(`/customers/${customerId}`, customerDetails)
    return response
  } catch (error) {
    console.error(`Error updating customer with ID ${customerId}:`, error)
    throw error
  }
}

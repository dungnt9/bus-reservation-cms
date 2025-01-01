// routeService.js
import api from './api' // Import the api instance from api.js

// Create a new route
export const createRoute = async (route) => {
  try {
    const response = await api.post('/routes', route)
    return response
  } catch (error) {
    console.error('Error creating route:', error.response?.data?.message || error.message)
    throw error
  }
}

// Get all routes
export const getAllRoutes = async (page = 0, size = 10, filters = {}) => {
  try {
    if (filters.routeStatus) {
      const statusMap = {
        'hoạt động': 'active',
        'không hoạt động': 'inactive',
      }
      filters.routeStatus = statusMap[filters.routeStatus.toLowerCase()] || filters.routeStatus
    }

    const response = await api.get('/routes', {
      params: {
        page,
        size,
        ...filters,
      },
    })
    return response
  } catch (error) {
    console.error('Error fetching routes:', error)
    throw error
  }
}

// Get a route by ID
export const getRouteById = async (routeId) => {
  try {
    const response = await api.get(`/routes/${routeId}`)
    return response
  } catch (error) {
    console.error(`Error fetching route with ID ${routeId}:`, error)
    throw error
  }
}

// Update route details
export const updateRoute = async (routeId, routeDetails) => {
  try {
    const response = await api.put(`/routes/${routeId}`, routeDetails)
    return response
  } catch (error) {
    console.error(`Error updating route with ID ${routeId}:`, error)
    throw error
  }
}

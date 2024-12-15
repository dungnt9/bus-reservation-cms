import api from './api'

export const createInvoice = async (invoiceData) => {
  try {
    const response = await api.post('/invoices', {
      customerId: invoiceData.customerId,
      tripId: invoiceData.tripId,
      selectedSeats: invoiceData.selectedSeats,
      paymentStatus: invoiceData.paymentStatus,
      paymentMethod: invoiceData.paymentMethod
    });
    return response;
  } catch (error) {
    console.error('Error creating invoice:', error.response?.data?.message || error.message);
    throw error;
  }
};

export const getAllInvoices = async () => {
  try {
    const response = await api.get('/invoices')
    return response
  } catch (error) {
    console.error('Error fetching invoices:', error)
    throw error
  }
}

export const getInvoiceById = async (invoiceId) => {
  try {
    const response = await api.get(`/invoices/${invoiceId}`)
    return response
  } catch (error) {
    console.error(`Error fetching invoice with ID ${invoiceId}:`, error)
    throw error
  }
}

export const updateInvoice = async (invoiceId, invoiceDetails) => {
  try {
    const response = await api.put(`/invoices/${invoiceId}`, invoiceDetails)
    return response
  } catch (error) {
    console.error(`Error updating invoice with ID ${invoiceId}:`, error)
    throw error
  }
}

export const deleteInvoice = async (invoiceId) => {
  try {
    const response = await api.delete(`/invoices/${invoiceId}`)
    return response
  } catch (error) {
    console.error(`Error deleting invoice with ID ${invoiceId}:`, error)
    throw error
  }
}

// Get all available trips for dropdown
export const getAvailableTrips = async () => {
  try {
    const response = await api.get('/trips')
    return response
  } catch (error) {
    console.error('Error fetching available trips:', error)
    throw error
  }
}

// Get trip seats by trip ID
export const getTripSeats = async (tripId) => {
  try {
    const response = await api.get(`/trips/${tripId}`)
    return response
  } catch (error) {
    console.error(`Error fetching seats for trip ID ${tripId}:`, error)
    throw error
  }
}

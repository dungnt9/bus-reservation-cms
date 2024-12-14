// invoiceService.js
import api from './api'

// Create a new invoice
export const createInvoice = async (invoice) => {
  try {
    const response = await api.post('/invoices', invoice)
    return response
  } catch (error) {
    console.error('Error creating invoice:', error.response?.data?.message || error.message)
    throw error
  }
}

// Get all invoices
export const getAllInvoices = async () => {
  try {
    const response = await api.get('/invoices')
    console.log('response.data:', response)
    return response
  } catch (error) {
    console.error('Error fetching invoices:', error)
    throw error
  }
}

// Get an invoice by ID
export const getInvoiceById = async (invoiceId) => {
  try {
    const response = await api.get(`/invoices/${invoiceId}`)
    return response
  } catch (error) {
    console.error(`Error fetching invoice with ID ${invoiceId}:`, error)
    throw error
  }
}

// Update invoice details
export const updateInvoice = async (invoiceId, invoiceDetails) => {
  try {
    const response = await api.put(`/invoices/${invoiceId}`, invoiceDetails)
    return response
  } catch (error) {
    console.error(`Error updating invoice with ID ${invoiceId}:`, error)
    throw error
  }
}

// Delete an invoice
export const deleteInvoice = async (invoiceId) => {
  try {
    const response = await api.delete(`/invoices/${invoiceId}`)
    return response
  } catch (error) {
    console.error(`Error deleting invoice with ID ${invoiceId}:`, error)
    throw error
  }
}

// authService.js
import api from './api'

const TOKEN_KEY = 'admin_token'
const USER_KEY = 'admin_user'

const authService = {
  async login(phoneNumber, password) {
    try {
      // Gọi API login
      const response = await api.post('/auth/admin-login', {
        phoneNumber,
        password,
      })

      // Nếu login thành công, lưu token và thông tin user
      if (response.token) {
        localStorage.setItem(TOKEN_KEY, response.token)
        localStorage.setItem(USER_KEY, JSON.stringify(response.user))
        api.defaults.headers.common['Authorization'] = `Bearer ${response.token}`
      }

      return response
    } catch (error) {
      if (error.response) {
        switch (error.response.status) {
          case 401:
            throw new Error('Số điện thoại hoặc mật khẩu không chính xác')
          case 403:
            throw new Error('Tài khoản của bạn không có quyền truy cập')
          default:
            throw new Error('Đăng nhập thất bại. Vui lòng thử lại sau')
        }
      }
      throw new Error('Lỗi kết nối. Vui lòng kiểm tra lại mạng')
    }
  },

  logout() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    delete api.defaults.headers.common['Authorization']
  },

  getCurrentUser() {
    const userStr = localStorage.getItem(USER_KEY)
    return userStr ? JSON.parse(userStr) : null
  },

  getToken() {
    return localStorage.getItem(TOKEN_KEY)
  },

  isAuthenticated() {
    const token = this.getToken()
    if (!token) return false

    // Kiểm tra token có hợp lệ
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      if (payload.exp < Date.now() / 1000) {
        this.logout()
        return false
      }
      return true
    } catch (error) {
      this.logout()
      return false
    }
  },

  async updateProfile(userData) {
    return api
      .put(`/users/${userData.userId}`, userData)
      .then((response) => {
        // Cập nhật thông tin user trong localStorage
        const currentUser = this.getCurrentUser()
        const updatedUser = { ...currentUser, ...response }
        localStorage.setItem(USER_KEY, JSON.stringify(updatedUser))
        return response
      })
      .catch((error) => {
        throw new Error(
          'Cập nhật thông tin thất bại: ' + (error.response?.data?.message || error.message),
        )
      })
  },

  async changePassword(userId, currentPassword, newPassword) {
    return api
      .post(`/users/${userId}/change-password`, {
        currentPassword,
        newPassword,
      })
      .catch((error) => {
        throw new Error(
          'Đổi mật khẩu thất bại: ' + (error.response?.data?.message || error.message),
        )
      })
  },

  //Quên mật khẩu
  async forgotPassword(phoneNumber) {
    try {
      const response = await api.post('/auth/forgot-password', { phoneNumber })
      return response
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data?.message || 'Gửi mã OTP thất bại')
      }
      throw new Error('Lỗi kết nối. Vui lòng kiểm tra lại mạng')
    }
  },

  async resetPassword(phoneNumber, otp, newPassword) {
    try {
      const response = await api.post('/auth/reset-password', {
        phoneNumber,
        otp,
        newPassword,
      })
      return response
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data?.message || 'Đặt lại mật khẩu thất bại')
      }
      throw new Error('Lỗi kết nối. Vui lòng kiểm tra lại mạng')
    }
  },

  async requestPhoneChangeOTP({ userId, currentPhone, newPhone, password }) {
    try {
      const response = await api.post('/auth/request-phone-change', {
        userId,
        currentPhone,
        newPhone,
        password,
      })
      return response
    } catch (error) {
      if (error.response) {
        switch (error.response.status) {
          case 401:
            throw new Error('Mật khẩu không đúng')
          case 409:
            throw new Error('Số điện thoại đã được đăng ký')
          case 403:
            throw new Error('Không có quyền thực hiện thao tác này')
          default:
            throw new Error(error.response.data?.message || 'Không thể gửi mã OTP')
        }
      }
      throw new Error('Lỗi kết nối. Vui lòng kiểm tra lại')
    }
  },

  // Verify OTP for phone number change
  async verifyPhoneChangeOTP({ userId, phoneNumber, otp }) {
    try {
      const response = await api.post('/auth/verify-phone-change', {
        userId,
        phoneNumber,
        otp,
      })

      if (response.message === 'Phone number updated successfully') {
        // Update user information in localStorage
        const currentUser = this.getCurrentUser()
        const updatedUser = { ...currentUser, phoneNumber: phoneNumber }
        localStorage.setItem(USER_KEY, JSON.stringify(updatedUser))
      }

      return response
    } catch (error) {
      if (error.response) {
        switch (error.response.status) {
          case 400:
            throw new Error('Mã OTP không hợp lệ')
          case 408:
            throw new Error('Mã OTP đã hết hạn')
          case 403:
            throw new Error('Không có quyền thực hiện thao tác này')
          default:
            throw new Error(error.response.data?.message || 'Không thể xác thực OTP')
        }
      }
      throw new Error('Lỗi kết nối. Vui lòng kiểm tra lại')
    }
  },
}

export default authService

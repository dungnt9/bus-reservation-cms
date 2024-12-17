// src/services/authService.js
import api from './api'

const TOKEN_KEY = 'admin_token'
const USER_KEY = 'admin_user'

const authService = {
  async login(phoneNumber, password) {
    try {
      // Gọi API login
      const response = await api.post('/auth/admin-login', {
        phoneNumber,
        password
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
  }
}

export default authService

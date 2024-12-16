<template>
  <div class="login-container">
    <div class="login-box">
      <!-- Logo và Header -->
      <div class="login-header">
        <img src="/bus_logo.svg" alt="Bus Logo" class="logo" />
        <h1>Welcome Back</h1>
        <p>Please sign in to continue</p>
      </div>

      <!-- Form đăng nhập -->
      <form @submit.prevent="handleLogin" class="login-form">
        <!-- Số điện thoại -->
        <div class="form-group">
          <label>
<!--            <i class="fas fa-phone"></i>-->
            Phone Number
          </label>
          <input
            type="text"
            v-model="phoneNumber"
            placeholder="Enter your phone number"
            :class="{ 'error': errors.phoneNumber }"
          />
          <span class="error-message" v-if="errors.phoneNumber">{{ errors.phoneNumber }}</span>
        </div>

        <!-- Mật khẩu -->
        <div class="form-group">
          <label>
<!--            <i class="fas fa-lock"></i>-->
            Password
          </label>
          <div class="password-input">
            <input
              :type="showPassword ? 'text' : 'password'"
              v-model="password"
              placeholder="Enter your password"
              :class="{ 'error': errors.password }"
            />
            <button
              type="button"
              class="toggle-password"
              @click="togglePassword"
            >
              <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </button>
          </div>
          <span class="error-message" v-if="errors.password">{{ errors.password }}</span>
        </div>

        <!-- Thông báo lỗi -->
        <div class="alert-error" v-if="errorMessage">
          <i class="fas fa-exclamation-circle"></i>
          {{ errorMessage }}
        </div>

        <!-- Nút đăng nhập -->
        <button type="submit" class="login-button" :disabled="loading">
          <span v-if="!loading">Sign In</span>
          <div v-else class="spinner"></div>
        </button>
      </form>

      <!-- Footer -->
      <div class="login-footer">
        <p>Bus Management System</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import authService from '@/services/authService'

const router = useRouter()
const phoneNumber = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const errorMessage = ref('')
const errors = reactive({
  phoneNumber: '',
  password: ''
})

const validateForm = () => {
  let isValid = true
  errors.phoneNumber = ''
  errors.password = ''

  if (!phoneNumber.value) {
    errors.phoneNumber = 'Phone number is required'
    isValid = false
  } else if (!/^\d{10}$/.test(phoneNumber.value)) {
    errors.phoneNumber = 'Please enter a valid 10-digit phone number'
    isValid = false
  }

  if (!password.value) {
    errors.password = 'Password is required'
    isValid = false
  }

  return isValid
}

const handleLogin = async () => {
  if (!validateForm()) return

  try {
    loading.value = true
    errorMessage.value = ''

    const response = await authService.login(phoneNumber.value, password.value)

    if (response.token) {
      router.push('/admin')
    }
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    loading.value = false
  }
}

const togglePassword = () => {
  showPassword.value = !showPassword.value
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-box {
  width: 100%;
  max-width: 420px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  padding: 40px;
  transition: transform 0.3s ease;
}

.login-box:hover {
  transform: translateY(-5px);
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.logo {
  width: 100px;
  height: 100px;
  margin-bottom: 20px;
  object-fit: contain;
}

.login-header h1 {
  color: #2d3748;
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 8px;
}

.login-header p {
  color: #718096;
  font-size: 16px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #4a5568;
  font-weight: 500;
  font-size: 14px;
}

.form-group label i {
  color: #667eea;
}

.form-group input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.form-group input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  outline: none;
}

.password-input {
  position: relative;
}

.toggle-password {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #718096;
  cursor: pointer;
  padding: 0;
}

.toggle-password:hover {
  color: #667eea;
}

.error-message {
  color: #e53e3e;
  font-size: 12px;
  margin-top: 4px;
}

input.error {
  border-color: #e53e3e;
}

.alert-error {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background-color: #fff5f5;
  border: 1px solid #fed7d7;
  border-radius: 10px;
  color: #e53e3e;
  font-size: 14px;
}

.login-button {
  width: 100%;
  padding: 14px;
  background: linear-gradient(to right, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.login-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.login-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s infinite linear;
  margin: 0 auto;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.login-footer {
  text-align: center;
  margin-top: 30px;
  color: #718096;
  font-size: 14px;
}

/* Responsive Design */
@media (max-width: 480px) {
  .login-box {
    padding: 30px 20px;
  }

  .login-header h1 {
    font-size: 24px;
  }

  .login-header p {
    font-size: 14px;
  }

  .form-group input {
    padding: 10px 14px;
  }

  .login-button {
    padding: 12px;
    font-size: 14px;
  }
}
</style>

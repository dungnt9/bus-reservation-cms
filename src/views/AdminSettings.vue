// AdminSettings.vue
<template>
  <div class="bg-white p-4 rounded-lg border">
    <h2 class="text-primary fw-bold mb-4">Thông tin tài khoản</h2>

    <div class="settings-tabs mb-4">
      <button
        :class="['tab-btn', { active: activeTab === 'profile' }]"
        @click="activeTab = 'profile'"
      >
        Thông tin cá nhân
      </button>
      <button
        :class="['tab-btn', { active: activeTab === 'password' }]"
        @click="activeTab = 'password'"
      >
        Đổi mật khẩu
      </button>
      <button :class="['tab-btn', { active: activeTab === 'phone' }]" @click="activeTab = 'phone'">
        Đổi số điện thoại
      </button>
    </div>

    <!-- Profile Settings -->
    <div v-if="activeTab === 'profile'" class="settings-form">
      <form @submit.prevent="handleUpdateProfile" novalidate>
        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label">Họ và tên<span class="text-danger">*</span></label>
            <input
              type="text"
              class="form-control"
              v-model="profileForm.fullName"
              :class="{ 'is-invalid': validationErrors.fullName }"
            />
            <div class="invalid-feedback" v-if="validationErrors.fullName">
              {{ validationErrors.fullName }}
            </div>
          </div>
          <div class="col-md-6 mb-3">
            <label class="form-label">Số điện thoại<span class="text-danger">*</span></label>
            <input type="tel" class="form-control" v-model="profileForm.phoneNumber" disabled />
          </div>
        </div>

        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label">Email</label>
            <input
              type="email"
              class="form-control"
              v-model="profileForm.email"
              :class="{ 'is-invalid': validationErrors.email }"
            />
            <div class="invalid-feedback" v-if="validationErrors.email">
              {{ validationErrors.email }}
            </div>
          </div>
          <div class="col-md-6 mb-3">
            <label class="form-label">Giới tính</label>
            <select class="form-control" v-model="profileForm.gender">
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
              <option value="other">Khác</option>
            </select>
          </div>
        </div>

        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label">Địa chỉ</label>
            <input
              type="text"
              class="form-control"
              v-model="profileForm.address"
              :class="{ 'is-invalid': validationErrors.address }"
            />
            <div class="invalid-feedback" v-if="validationErrors.address">
              {{ validationErrors.address }}
            </div>
          </div>
          <div class="col-md-6 mb-3">
            <label class="form-label">Ngày sinh</label>
            <input
              type="date"
              class="form-control"
              v-model="profileForm.dateOfBirth"
              :max="maxBirthDate"
            />
          </div>
        </div>

        <div class="d-flex justify-content-end">
          <button type="submit" class="btn btn-primary">Cập nhật</button>
        </div>
      </form>
    </div>

    <!-- Change Password -->
    <div v-if="activeTab === 'password'" class="settings-form">
      <form @submit.prevent="handleChangePassword" novalidate>
        <div class="mb-3">
          <label class="form-label">Mật khẩu hiện tại<span class="text-danger">*</span></label>
          <div class="position-relative">
            <input
              :type="showCurrentPassword ? 'text' : 'password'"
              class="form-control"
              v-model="passwordForm.currentPassword"
              :class="{ 'is-invalid': validationErrors.currentPassword }"
            />
            <button
              type="button"
              class="btn position-absolute end-0 top-50 translate-middle-y bg-transparent border-0"
              @click="showCurrentPassword = !showCurrentPassword"
            >
              <img
                :src="
                  showCurrentPassword ? '/images/setting/eye-slash.svg' : '/images/setting/eye.svg'
                "
                alt="toggle password visibility"
                width="20"
                height="20"
              />
            </button>
            <div class="invalid-feedback" v-if="validationErrors.currentPassword">
              {{ validationErrors.currentPassword }}
            </div>
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label">Mật khẩu mới<span class="text-danger">*</span></label>
          <div class="position-relative">
            <input
              :type="showNewPassword ? 'text' : 'password'"
              class="form-control"
              v-model="passwordForm.newPassword"
              :class="{ 'is-invalid': validationErrors.newPassword }"
            />
            <button
              type="button"
              class="btn position-absolute end-0 top-50 translate-middle-y bg-transparent border-0"
              @click="showNewPassword = !showNewPassword"
            >
              <img
                :src="showNewPassword ? '/images/setting/eye-slash.svg' : '/images/setting/eye.svg'"
                alt="toggle password visibility"
                width="20"
                height="20"
              />
            </button>
            <div class="invalid-feedback" v-if="validationErrors.newPassword">
              {{ validationErrors.newPassword }}
            </div>
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label">Nhập lại mật khẩu mới<span class="text-danger">*</span></label>
          <div class="position-relative">
            <input
              :type="showConfirmPassword ? 'text' : 'password'"
              class="form-control"
              v-model="passwordForm.confirmPassword"
              :class="{ 'is-invalid': validationErrors.confirmPassword }"
            />
            <button
              type="button"
              class="btn position-absolute end-0 top-50 translate-middle-y bg-transparent border-0"
              @click="showConfirmPassword = !showConfirmPassword"
            >
              <img
                :src="
                  showConfirmPassword ? '/images/setting/eye-slash.svg' : '/images/setting/eye.svg'
                "
                alt="toggle password visibility"
                width="20"
                height="20"
              />
            </button>
            <div class="invalid-feedback" v-if="validationErrors.confirmPassword">
              {{ validationErrors.confirmPassword }}
            </div>
          </div>
        </div>

        <div class="d-flex justify-content-end">
          <button type="submit" class="btn btn-primary">Đổi mật khẩu</button>
        </div>
      </form>
    </div>

    <div v-if="activeTab === 'phone'" class="settings-form">
      <form @submit.prevent="handlePhoneChange" novalidate>
        <div class="mb-3">
          <label class="form-label">Số điện thoại hiện tại</label>
          <input type="tel" class="form-control" v-model="phoneForm.currentPhone" disabled />
        </div>

        <div class="mb-3">
          <label class="form-label">Mật khẩu<span class="text-danger">*</span></label>
          <div class="position-relative">
            <input
              :type="showPhonePassword ? 'text' : 'password'"
              class="form-control"
              v-model="phoneForm.password"
              :class="{ 'is-invalid': validationErrors.password }"
            />
            <button
              type="button"
              class="btn position-absolute end-0 top-50 translate-middle-y bg-transparent border-0"
              @click="showPhonePassword = !showPhonePassword"
            >
              <img
                :src="
                  showPhonePassword ? '/images/setting/eye-slash.svg' : '/images/setting/eye.svg'
                "
                alt="toggle password visibility"
                width="20"
                height="20"
              />
            </button>
            <div class="invalid-feedback" v-if="validationErrors.password">
              {{ validationErrors.password }}
            </div>
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label">Số điện thoại mới<span class="text-danger">*</span></label>
          <input
            type="tel"
            class="form-control"
            v-model="phoneForm.newPhone"
            :class="{ 'is-invalid': validationErrors.newPhone }"
            placeholder="Nhập số điện thoại mới"
          />
          <div class="invalid-feedback" v-if="validationErrors.newPhone">
            {{ validationErrors.newPhone }}
          </div>
        </div>

        <div class="d-flex justify-content-end">
          <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
            {{ isSubmitting ? 'Đang xử lý...' : 'Đổi số điện thoại' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Add this OTP Modal -->
    <div class="modal" tabindex="-1" :class="{ 'd-block': showOtpModal }" v-if="showOtpModal">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Xác thực OTP</h5>
            <button type="button" class="btn-close" @click="closeOtpModal"></button>
          </div>
          <div class="modal-body">
            <p>Vui lòng nhập mã OTP được gửi đến số điện thoại {{ phoneForm.newPhone }}</p>
            <input
              type="text"
              class="form-control text-center"
              v-model="otpForm.otp"
              placeholder="Nhập mã 6 số"
              maxlength="6"
              :class="{ 'is-invalid': validationErrors.otp }"
            />
            <div class="invalid-feedback" v-if="validationErrors.otp">
              {{ validationErrors.otp }}
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeOtpModal">Hủy</button>
            <button
              type="button"
              class="btn btn-primary"
              @click="handleOtpVerification"
              :disabled="isVerifying"
            >
              {{ isVerifying ? 'Đang xác thực...' : 'Xác nhận' }}
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-backdrop fade show" v-if="showOtpModal"></div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import authService from '@/services/authService'
import { validEmail, validName, validAddress, validPhone } from '@/utils/validators'

const router = useRouter()
const activeTab = ref('profile')
const validationErrors = reactive({})

const isSubmitting = ref(false)
const isVerifying = ref(false)
const showOtpModal = ref(false)

const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)
const showPhonePassword = ref(false)

// Profile form
const profileForm = reactive({
  fullName: '',
  phoneNumber: '',
  email: '',
  gender: 'male',
  address: '',
  dateOfBirth: '',
})

// Password form
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

// Computed max birth date
const maxBirthDate = computed(() => {
  const today = new Date()
  const minAge = 18
  return new Date(today.getFullYear() - minAge, today.getMonth(), today.getDate())
    .toISOString()
    .split('T')[0]
})

const phoneForm = reactive({
  currentPhone: '',
  password: '',
  newPhone: '',
})

const otpForm = reactive({
  otp: '',
})

// Load user data
onMounted(() => {
  const currentUser = authService.getCurrentUser()
  if (currentUser) {
    profileForm.fullName = currentUser.fullName || ''
    profileForm.email = currentUser.email || ''
    profileForm.gender = currentUser.gender || 'male'
    profileForm.address = currentUser.address || ''
    profileForm.dateOfBirth = currentUser.dateOfBirth || ''

    // Set current phone number
    phoneForm.currentPhone = currentUser.phoneNumber
  }
})

// Validate profile form
const validateProfileForm = () => {
  validationErrors.value = {}
  let isValid = true

  if (!validName(profileForm.fullName)) {
    validationErrors.fullName = 'Tên phải có ít nhất 2 ký tự và không chứa ký tự đặc biệt'
    isValid = false
  }

  if (profileForm.email && !validEmail(profileForm.email)) {
    validationErrors.email = 'Không đúng định dạng email'
    isValid = false
  }

  if (profileForm.address && !validAddress(profileForm.address)) {
    validationErrors.address = 'Địa chỉ không được bao gồm emoji và phải ít hơn 255 ký tự.'
    isValid = false
  }

  return isValid
}

// Validate password form
const validatePasswordForm = () => {
  validationErrors.value = {}
  let isValid = true

  if (!passwordForm.currentPassword) {
    validationErrors.currentPassword = 'Mật khẩu hiện tại không được để trống'
    isValid = false
  }

  if (!passwordForm.newPassword || passwordForm.newPassword.length < 6) {
    validationErrors.newPassword = 'Mật khẩu mới phải có ít nhất 6 ký tự'
    isValid = false
  }

  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    validationErrors.confirmPassword = 'Mật khẩu không khớp'
    isValid = false
  }

  return isValid
}

const validatePhoneForm = () => {
  const errors = {}
  let isValid = true

  if (!phoneForm.password) {
    alert('Vui lòng nhập mật khẩu')
    isValid = false
  }

  if (!phoneForm.newPhone) {
    alert('Vui lòng nhập số điện thoại mới')
    isValid = false
  } else if (!validPhone(phoneForm.newPhone)) {
    alert('Số điện thoại không hợp lệ (phải bắt đầu bằng 0 và có 10 chữ số)')
    isValid = false
  } else if (phoneForm.newPhone === phoneForm.currentPhone) {
    alert('Số điện thoại mới phải khác số điện thoại hiện tại')
    isValid = false
  }

  validationErrors.value = errors
  return isValid
}

const validateOtp = () => {
  const errors = {}
  let isValid = true

  if (!otpForm.otp) {
    alert('Vui lòng nhập mã OTP')
    isValid = false
  } else if (!/^\d+$/.test(otpForm.otp)) {
    alert('Mã OTP phải có 6 chữ số')
    isValid = false
  }

  validationErrors.value = errors
  return isValid
}

const handlePhoneChange = async () => {
  if (!validatePhoneForm()) return

  try {
    isSubmitting.value = true
    await authService.requestPhoneChangeOTP({
      userId: authService.getCurrentUser().userId,
      currentPhone: phoneForm.currentPhone,
      newPhone: phoneForm.newPhone,
      password: phoneForm.password,
    })

    showOtpModal.value = true
  } catch (error) {
    alert(error.message || 'Không thể gửi mã OTP')
  } finally {
    isSubmitting.value = false
  }
}

const handleOtpVerification = async () => {
  if (!validateOtp()) return

  try {
    isVerifying.value = true
    await authService.verifyPhoneChangeOTP({
      userId: authService.getCurrentUser().userId,
      phoneNumber: phoneForm.newPhone,
      otp: otpForm.otp,
    })

    alert('Đổi số điện thoại thành công! Vui lòng đăng nhập lại.')
    authService.logout()
    router.push('/login')
  } catch (error) {
    alert(error.message || 'Xác thực OTP thất bại')
  } finally {
    isVerifying.value = false
  }
}

const closeOtpModal = () => {
  showOtpModal.value = false
  otpForm.otp = ''
  validationErrors.value = {}
}

// Handle profile update
const handleUpdateProfile = () => {
  if (!validateProfileForm()) return

  authService
    .updateProfile({
      userId: authService.getCurrentUser().userId,
      ...profileForm,
    })
    .then((response) => {
      alert('Cập nhật thông tin thành công!')
    })
    .catch((error) => {
      alert(error.message || 'Lỗi khi cập nhật thông tin')
    })
}

// Handle password change
const handleChangePassword = () => {
  if (!validatePasswordForm()) return

  authService
    .changePassword(
      authService.getCurrentUser().userId,
      passwordForm.currentPassword,
      passwordForm.newPassword,
    )
    .then(() => {
      alert('Đổi mật khẩu thành công! Vui lòng đăng nhập lại.')
      authService.logout()
      router.push('/login')
    })
    .catch((error) => {
      alert(error.message || 'Lỗi khi đổi mật khẩu')
    })
}

onUnmounted(() => {
  if (showOtpModal.value) {
    closeOtpModal()
  }
})
</script>

<style scoped>
.border {
  border-radius: 10px;
  margin: 30px;
  box-shadow: 5px 5px 5px rgba(0, 0, 0, 0.1);
}

.settings-tabs {
  display: flex;
  gap: 1rem;
  border-bottom: 2px solid #e2e8f0;
  margin-bottom: 2rem;
}

.tab-btn {
  padding: 0.5rem 1rem;
  border: none;
  background: none;
  font-weight: 500;
  color: #718096;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.tab-btn:hover {
  color: #2d3748;
}

.tab-btn.active {
  color: #3182ce;
}

.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #3182ce;
}

.settings-form {
  max-width: 800px;
  margin: 0 auto;
}

.btn-primary {
  background-color: #3182ce;
  border-color: #3182ce;
  padding: 0.5rem 1.5rem;
}

.btn-primary:hover {
  background-color: #2c5282;
  border-color: #2c5282;
}

.modal {
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1040;
}

.modal {
  z-index: 1050;
}

.position-relative {
  position: relative;
}

.position-relative input {
  padding-right: 40px;
}

.position-relative button {
  padding: 0.375rem;
  margin-right: 0.25rem;
}

.position-relative button:focus {
  outline: none;
  box-shadow: none;
}

.position-relative img {
  opacity: 0.6;
}

.position-relative button:hover img {
  opacity: 1;
}
</style>

// AdminSettings.vue
<template>
  <div class="bg-white p-4 rounded-lg border">
    <h2 class="text-primary fw-bold mb-4">Account Settings</h2>

    <div class="settings-tabs mb-4">
      <button
        :class="['tab-btn', { active: activeTab === 'profile' }]"
        @click="activeTab = 'profile'"
      >
        Profile
      </button>
      <button
        :class="['tab-btn', { active: activeTab === 'password' }]"
        @click="activeTab = 'password'"
      >
        Change Password
      </button>
    </div>

    <!-- Profile Settings -->
    <div v-if="activeTab === 'profile'" class="settings-form">
      <form @submit.prevent="handleUpdateProfile" novalidate>
        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label">Full Name<span class="text-danger">*</span></label>
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
            <label class="form-label">Phone Number<span class="text-danger">*</span></label>
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
            <label class="form-label">Gender</label>
            <select class="form-control" v-model="profileForm.gender">
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label">Address</label>
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
            <label class="form-label">Date of Birth</label>
            <input
              type="date"
              class="form-control"
              v-model="profileForm.dateOfBirth"
              :max="maxBirthDate"
            />
          </div>
        </div>

        <div class="d-flex justify-content-end">
          <button type="submit" class="btn btn-primary">Update Profile</button>
        </div>
      </form>
    </div>

    <!-- Change Password -->
    <div v-if="activeTab === 'password'" class="settings-form">
      <form @submit.prevent="handleChangePassword" novalidate>
        <div class="mb-3">
          <label class="form-label">Current Password<span class="text-danger">*</span></label>
          <input
            type="password"
            class="form-control"
            v-model="passwordForm.currentPassword"
            :class="{ 'is-invalid': validationErrors.currentPassword }"
          />
          <div class="invalid-feedback" v-if="validationErrors.currentPassword">
            {{ validationErrors.currentPassword }}
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label">New Password<span class="text-danger">*</span></label>
          <input
            type="password"
            class="form-control"
            v-model="passwordForm.newPassword"
            :class="{ 'is-invalid': validationErrors.newPassword }"
          />
          <div class="invalid-feedback" v-if="validationErrors.newPassword">
            {{ validationErrors.newPassword }}
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label">Confirm New Password<span class="text-danger">*</span></label>
          <input
            type="password"
            class="form-control"
            v-model="passwordForm.confirmPassword"
            :class="{ 'is-invalid': validationErrors.confirmPassword }"
          />
          <div class="invalid-feedback" v-if="validationErrors.confirmPassword">
            {{ validationErrors.confirmPassword }}
          </div>
        </div>

        <div class="d-flex justify-content-end">
          <button type="submit" class="btn btn-primary">Change Password</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import authService from '@/services/authService'
import { validEmail, validName, validAddress } from '@/utils/validators'

const router = useRouter()
const activeTab = ref('profile')
const validationErrors = reactive({})

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

// Load user data
onMounted(() => {
  const currentUser = authService.getCurrentUser()
  if (currentUser) {
    profileForm.fullName = currentUser.fullName
    profileForm.phoneNumber = currentUser.phoneNumber
    profileForm.email = currentUser.email || ''
    profileForm.gender = currentUser.gender || 'male'
    profileForm.address = currentUser.address || ''
    profileForm.dateOfBirth = currentUser.dateOfBirth || ''
  }
})

// Validate profile form
const validateProfileForm = () => {
  validationErrors.value = {}
  let isValid = true

  if (!validName(profileForm.fullName)) {
    validationErrors.fullName = 'Full name must be 2-100 characters without special characters'
    isValid = false
  }

  if (profileForm.email && !validEmail(profileForm.email)) {
    validationErrors.email = 'Invalid email format'
    isValid = false
  }

  if (profileForm.address && !validAddress(profileForm.address)) {
    validationErrors.address = 'Address cannot contain emoji and must be under 255 characters'
    isValid = false
  }

  return isValid
}

// Validate password form
const validatePasswordForm = () => {
  validationErrors.value = {}
  let isValid = true

  if (!passwordForm.currentPassword) {
    validationErrors.currentPassword = 'Current password is required'
    isValid = false
  }

  if (!passwordForm.newPassword || passwordForm.newPassword.length < 6) {
    validationErrors.newPassword = 'New password must be at least 6 characters'
    isValid = false
  }

  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    validationErrors.confirmPassword = 'Passwords do not match'
    isValid = false
  }

  return isValid
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
      alert('Profile updated successfully!')
    })
    .catch((error) => {
      alert(error.message || 'Failed to update profile')
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
      alert('Password changed successfully! Please login again.')
      authService.logout()
      router.push('/login')
    })
    .catch((error) => {
      alert(error.message || 'Failed to change password')
    })
}
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
</style>

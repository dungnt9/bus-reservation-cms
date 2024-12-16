<script setup>
import { ref, computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import Sidebar from './components/Sidebar.vue'

const route = useRoute()
const isCollapsed = ref(true)

// Kiểm tra xem có phải trang login không
const isLoginPage = computed(() => route.name === 'Login')
</script>

<template>
  <div :class="['app-container', { 'login-container': isLoginPage }]">
    <!-- Chỉ hiển thị Sidebar khi không phải trang login -->
    <Sidebar
      v-if="!isLoginPage"
      v-model:isCollapsed="isCollapsed"
      class="sidebar-component"
    />
    <div
      :class="[
        'content',
        {
          'content-expanded': !isCollapsed,
          'login-content': isLoginPage
        }
      ]"
    >
      <RouterView />
    </div>
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  position: relative;
  height: 100vh;
  overflow: hidden;
}

/* Loại bỏ các style không cần thiết cho trang login */
.login-container {
  display: block;
  overflow: auto;
}

.sidebar-component {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1000;
}

.content {
  flex-grow: 1;
  overflow-y: auto;
  transition: margin-left 0.3s ease;
  margin-left: 92px; /* Default collapsed width */
  width: calc(100% - 92px);
  background-color: #f9fafb;
}

/* Khi ở trang login, content sẽ chiếm toàn bộ màn hình */
.login-content {
  margin-left: 0;
  width: 100%;
}

.content-expanded {
  margin-left: 200px; /* Full sidebar width */
  width: calc(100% - 200px);
}

* {
  box-sizing: border-box;
}
</style>

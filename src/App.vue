<script setup>
import { ref } from 'vue'
import { RouterView } from 'vue-router'
import Sidebar from './components/Sidebar.vue'

const isCollapsed = ref(false) // Trạng thái thu gọn của Sidebar
</script>

<template>
  <div class="app-container">
    <Sidebar :is-collapsed="isCollapsed" />
    <div class="content">
      <button @click="isCollapsed = !isCollapsed">Toggle Sidebar</button>
      <RouterView />
    </div>
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  width: 100%;
  min-height: 100vh;
}

.sidebar {
  width: 250px; /* Chiều rộng mặc định */
  flex-shrink: 0;
  transition: width 0.3s ease; /* Thêm hiệu ứng chuyển đổi */
}

.sidebar.collapsed {
  width: 70px; /* Chiều rộng khi thu gọn */
}

.content {
  flex-grow: 1; /* Nội dung chiếm không gian còn lại */
  padding: 20px;
  transition: margin-left 0.3s ease; /* Hiệu ứng chuyển đổi mượt */
}
</style>

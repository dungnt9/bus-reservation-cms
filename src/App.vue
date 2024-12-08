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
      <RouterView />
    </div>
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
}
* {
  background-color: #f9fafb;
}
</style>

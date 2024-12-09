<script setup>
import { ref } from 'vue'
import { RouterView } from 'vue-router'
import Sidebar from './components/Sidebar.vue'

const isCollapsed = ref(true)
</script>

<template>
  <div class="app-container">
    <Sidebar v-model:isCollapsed="isCollapsed" class="sidebar-component" />
    <div class="content" :class="{ 'content-expanded': !isCollapsed }">
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

.content-expanded {
  margin-left: 200px; /* Full sidebar width */
  width: calc(100% - 200px);
}

* {
  box-sizing: border-box;
}
</style>

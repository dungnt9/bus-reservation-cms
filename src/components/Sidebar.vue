<template>
  <div class="container">
    <div
      class="sidebar"
      :class="{ expanded: isExpanded }"
      @mouseenter="isExpanded = true"
      @mouseleave="isExpanded = false"
    >
      <div class="head">
        <div class="user-img">
          <img src="\images\sidebar\account.svg" alt="" />
        </div>
        <div class="user-details" :class="{ 'show-details': isExpanded }">
          <p class="title">Admin</p>
          <p class="name">John Doe</p>
        </div>
      </div>

      <div class="nav">
        <div class="menu">
          <ul>
            <li
              v-for="item in menuItems"
              :key="item.key"
              :class="{ active: activeMenu === item.key }"
            >
              <router-link :to="item.to" @click="setActiveMenu(item.key)" class="menu-link">
                <div class="icon-wrapper">
                  <img class="img-li" :src="item.icon" :alt="item.text" />
                </div>
                <span class="text" :class="{ 'show-text': isExpanded }">
                  {{ item.text }}
                </span>
              </router-link>
            </li>
            <li>
              <a href="#" @click="handleLogout" class="menu-link">
                <div class="icon-wrapper">
                  <img class="img-li" src="\images\sidebar\account.svg" alt="" />
                </div>
                <span class="text" :class="{ 'show-text': isExpanded }">Logout</span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// State for sidebar expansion
const isExpanded = ref(false)
const activeMenu = ref('')

// Menu items for easier management
const menuItems = [
  {
    key: 'account',
    to: '/account',
    icon: '\\images\\sidebar\\account.svg',
    text: 'Tài khoản',
  },
  {
    key: 'admin',
    to: '/admin',
    icon: '\\images\\sidebar\\account.svg',
    text: 'Admin',
  },
  {
    key: 'customer',
    to: '/customer',
    icon: '\\images\\sidebar\\account.svg',
    text: 'Khách hàng',
  },
  {
    key: 'driver',
    to: '/driver',
    icon: '\\images\\sidebar\\driver.svg',
    text: 'Tài xế',
  },
  {
    key: 'vehicle-seat',
    to: '/vehicle-seat',
    icon: '\\images\\sidebar\\account.svg',
    text: 'Xe & Ghế xe',
  },
  {
    key: 'route',
    to: '/route',
    icon: '\\images\\sidebar\\account.svg',
    text: 'Tuyến xe',
  },
  {
    key: 'route-schedule',
    to: '/route-schedule',
    icon: '\\images\\sidebar\\account.svg',
    text: 'Lịch tuyến xe',
  },
  {
    key: 'trip',
    to: '/trip',
    icon: '\\images\\sidebar\\account.svg',
    text: 'Chuyến xe',
  },
  {
    key: 'invoice',
    to: '/invoice',
    icon: '\\images\\sidebar\\account.svg',
    text: 'Hóa đơn',
  },
  {
    key: 'report',
    to: '/',
    icon: '\\images\\sidebar\\account.svg',
    text: 'Báo cáo thống kê',
  },
]

// Set active menu item
const setActiveMenu = (menu) => {
  activeMenu.value = menu
}

// Placeholder logout method
const handleLogout = () => {
  console.log('Logout clicked')
}
</script>

<style scoped>
.user-img img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Inter', sans-serif;
}

.container {
  width: 92px;
  min-height: 100vh;
  transition: width 0.3s ease;
}

.sidebar {
  width: 92px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 20px;
  background-color: #fff;
  padding: 24px;
  transition: width 0.3s ease;
  position: relative;
  box-shadow: 4px 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.sidebar.expanded {
  width: 210px;
}

.head {
  display: flex;
  gap: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #dbdada;
  align-items: center;
}

.user-details {
  opacity: 0;
  max-width: 0;
  transition:
    opacity 0.3s ease,
    max-width 0.3s ease;
  white-space: nowrap;
  overflow: hidden;
}

.user-details.show-details {
  opacity: 1;
  max-width: 200px;
}

.nav {
  flex: 1;
}

.menu ul li {
  list-style: none;
}

li {
  margin: 10px 0;
}

.menu-link {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  font-weight: 500;
  color: black;
  text-decoration: none;
  padding: 10px 2px 10px 40px; /* Thay đổi padding */
  border-radius: 8px;
  transition: all 0.3s;
  position: relative;
}

.icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 25px;
  height: 40px;
  position: absolute;
  top: 50%;
  left: 8px;
  transform: translateY(-50%);
}

.menu ul li a .text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 0;
  opacity: 0;
  transition:
    max-width 0.3s ease,
    opacity 0.3s ease;
  flex: 1; /* Thêm flex để cân đối khoảng cách */
}

.menu ul li a .text.show-text {
  max-width: 150px;
  opacity: 1;
  margin-right: 10px;
}

.menu ul li a:hover,
.menu ul li.active a {
  background-color: rgb(202, 255, 127);
}

.img-li {
  width: 1.75rem;
  height: auto;
  flex-shrink: 0;
}
</style>

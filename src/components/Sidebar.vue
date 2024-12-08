<template>
  <div class="container">
    <div
      class="sidebar"
      :class="{ active: isSidebarCollapsed }"
      @mouseover="isSidebarCollapsed = false"
      @mouseleave="isSidebarCollapsed = true"
    >
      <div class="head">
        <div class="user-img">
          <img src="\images\sidebar\assistant.png" alt="" />
        </div>
        <div class="user-details">
          <p class="title">Admin</p>
          <p class="name">John Doe</p>
        </div>
      </div>

      <div class="nav">
        <div class="menu">
          <ul>
            <!-- Updated links to use <router-link> -->
            <li :class="{ active: activeMenu === 'account' }">
              <router-link to="/account" @click="setActiveMenu('account')">
                <img class="img-li" src="\images\sidebar\assistant.png" alt="" />
                <span class="text">Tài khoản</span>
              </router-link>
            </li>
            <li :class="{ active: activeMenu === 'admin' }">
              <router-link to="/admin" @click="setActiveMenu('admin')">
                <img class="img-li" src="\images\sidebar\assistant.png" alt="" />
                <span class="text">Admin</span>
              </router-link>
            </li>
            <li :class="{ active: activeMenu === 'customer' }">
              <router-link to="/customer" @click="setActiveMenu('customer')">
                <img class="img-li" src="\images\sidebar\assistant.png" alt="" />
                <span class="text">Khách hàng</span>
              </router-link>
            </li>
            <li :class="{ active: activeMenu === 'driver' }">
              <router-link to="/driver" @click="setActiveMenu('driver')">
                <img class="img-li" src="\images\sidebar\assistant.png" alt="" />
                <span class="text">Tài xế</span>
              </router-link>
            </li>
            <li :class="{ active: activeMenu === 'vehicle-seat' }">
              <router-link to="/vehicle-seat" @click="setActiveMenu('vehicle-seat')">
                <img class="img-li" src="\images\sidebar\assistant.png" alt="" />
                <span class="text">Xe & Ghế xe</span>
              </router-link>
            </li>
            <li :class="{ active: activeMenu === 'route' }">
              <router-link to="/route" @click="setActiveMenu('route')">
                <img class="img-li" src="\images\sidebar\assistant.png" alt="" />
                <span class="text">Tuyến xe</span>
              </router-link>
            </li>
            <li :class="{ active: activeMenu === 'route-schedule' }">
              <router-link to="/route-schedule" @click="setActiveMenu('route-schedule')">
                <img class="img-li" src="\images\sidebar\assistant.png" alt="" />
                <span class="text">Lịch tuyến xe</span>
              </router-link>
            </li>
            <li :class="{ active: activeMenu === 'trip' }">
              <router-link to="/trip" @click="setActiveMenu('trip')">
                <img class="img-li" src="\images\sidebar\assistant.png" alt="" />
                <span class="text">Chuyến xe</span>
              </router-link>
            </li>
            <li :class="{ active: activeMenu === 'invoice' }">
              <router-link to="/invoice" @click="setActiveMenu('invoice')">
                <img class="img-li" src="\images\sidebar\assistant.png" alt="" />
                <span class="text">Hóa đơn</span>
              </router-link>
            </li>
            <li :class="{ active: activeMenu === 'report' }">
              <router-link to="/" @click="setActiveMenu('report')">
                <img class="img-li" src="\images\sidebar\assistant.png" alt="" />
                <span class="text">Báo cáo thống kê</span>
              </router-link>
            </li>
            <li>
              <a href="#" @click="handleLogout">
                <img class="img-li" src="\images\sidebar\logout.png" alt="" />
                <span class="text">Logout</span>
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

// State for sidebar and menu
const isSidebarCollapsed = ref(true)
const activeMenu = ref('')
const openSubmenu = ref(null)

// Set active menu item
const setActiveMenu = (menu) => {
  activeMenu.value = menu
  // Close any open submenu when selecting a menu item
  openSubmenu.value = null
}

// Placeholder methods for help and logout
const handleHelp = () => {
  // Implement help functionality
  console.log('Help clicked')
}

const handleLogout = () => {
  // Implement logout functionality
  console.log('Logout clicked')
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Inter', sans-serif;
}

.container {
  width: 120px;
  min-height: 100vh;
}

.sidebar {
  width: 200px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 20px;
  background-color: #fff;
  padding: 24px;
  transition: width 0.3s ease;
  position: relative;
  box-shadow: 4px 4px 12px rgba(0, 0, 0, 0.1); /* Shadow effect */
}

.sidebar.active {
  width: 92px;
}

.sidebar .head {
  display: flex;
  gap: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #dbdada;
}

.user-img {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  overflow: hidden;
}
.img-li {
  width: 1rem;
  height: 1rem;
}
.user-img img {
  width: 100%;
  object-fit: cover;
}

.user-details .title {
  font-size: 10px;
  font-weight: 500;
  color: #757575;
  text-transform: uppercase;
}

.user-details .name {
  font-size: 14px;
  font-weight: 500;
}

.nav {
  flex: 1;
}
.menu ul li {
  list-style: none;
}
li {
  margin: 10px 0px;
}
.menu ul li a {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  font-weight: 500;
  color: black;
  text-decoration: none;
  padding: 10px 8px;
  border-radius: 8px;
  transition: all 0.3s;
}

.menu ul li .arrow {
  font-size: 14px;
  transition: all 0.3s;
}
.menu ul li a:hover,
.menu ul li.active a {
  background-color: rgb(202, 255, 127);
}

.menu ul li.active .arrow {
  transform: rotate(180deg);
}

.menu .sub-menu {
  margin-left: 20px;
  padding-left: 20px;
  padding-top: 5px;
  border-left: 1px solid #f6f6f6;
}

.menu .sub-menu li a {
  padding: 10px 8px;
  font-size: 12px;
}

.menu:not(:last-child) {
  padding-bottom: 10px;
  margin-bottom: 20px;
  border-bottom: 2px solid #f6f6f6;
}

.menu-btn {
  position: absolute;
  right: -14px;
  top: 3.5%;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #757575;
  border: 2px solid #f6f6f6;
  background-color: #fff;
}

.sidebar.active .user-details {
  display: none;
}
.sidebar.active .menu .title {
  text-align: center;
}
.sidebar.active .menu ul li .arrow {
  display: none;
}
.sidebar.active .menu > ul > li > a {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}
.sidebar.active .menu > ul > li > a .text {
  position: absolute;
  left: 70px;
  top: 50%;
  transform: translateY(-50%);
  padding: 10px;
  border-radius: 4px;
  color: #fff;
  background-color: #000;
  opacity: 0;
  visibility: hidden;
}
.sidebar.active .menu > ul > li > a .text::after {
  content: '';
  position: absolute;
  left: -5px;
  top: 20%;
  width: 20px;
  height: 20px;
  border-radius: 2px;
  background-color: #000;
  transform: rotate(45deg);
  z-index: -1;
}
.sidebar.active .menu .sub-menu {
  position: absolute;
  top: 0;
  left: 20px;
  width: 200px;
  border-radius: 20px;
  padding: 10px 20px;
  border: 1px solid #f6f6f6;
  background-color: #fff;
}
</style>

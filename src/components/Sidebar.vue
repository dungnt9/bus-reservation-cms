<template>
  <div class="container">
    <div class="sidebar" :class="{ active: isSidebarCollapsed }">
      <div class="head">
        <div class="user-img">
          <img src="\images\sidebar\assistant.png" alt="" />
        </div>
        <div class="user-details">
          <p class="title">web developer</p>
          <p class="name">John Doe</p>
        </div>
      </div>

      <div class="nav">
        <div class="menu">
          <p class="title">Main</p>
          <ul>
            <li :class="{ active: activeMenu === 'dashboard' }">
              <a href="#" @click="setActiveMenu('dashboard')">
                <img class="img-li" src="\images\sidebar\assistant.png" alt="" />
                <span class="text">Dashboard</span>
              </a>
            </li>
            <!-- <li
              :class="{ active: activeMenu === 'audience' }"
              @click.stop="toggleSubmenu('audience')"
            >
              <a href="#">
                <img class="img-li" src="\images\sidebar\assistant.png" alt="" />
                <span class="text">Audience</span>
                <i class="arrow ph-bold ph-caret-down"></i>
              </a>
              <ul class="sub-menu" v-if="openSubmenu === 'audience'">
                <li>
                  <a href="#" @click="setActiveMenu('users')">
                    <span class="text">Users</span>
                  </a>
                </li>
                <li>
                  <a href="#" @click="setActiveMenu('subscribers')">
                    <span class="text">Subscribers</span>
                  </a>
                </li>
              </ul>
            </li> -->
            <li :class="{ active: activeMenu === 'dashboard' }">
              <a href="#" @click="setActiveMenu('dashboard')">
                <img class="img-li" src="\images\sidebar\assistant.png" alt="" />
                <span class="text">Dashboard</span>
              </a>
            </li>
            <li :class="{ active: activeMenu === 'dashboard' }">
              <a href="#" @click="setActiveMenu('dashboard')">
                <img class="img-li" src="\images\sidebar\assistant.png" alt="" />
                <span class="text">Dashboard</span>
              </a>
            </li>
            <li :class="{ active: activeMenu === 'dashboard' }">
              <a href="#" @click="setActiveMenu('dashboard')">
                <img class="img-li" src="\images\sidebar\assistant.png" alt="" />
                <span class="text">Dashboard</span>
              </a>
            </li>
            <li :class="{ active: activeMenu === 'dashboard' }">
              <a href="#" @click="setActiveMenu('dashboard')">
                <img class="img-li" src="\images\sidebar\assistant.png" alt="" />
                <span class="text">Dashboard</span>
              </a>
            </li>
            <li :class="{ active: activeMenu === 'dashboard' }">
              <a href="#" @click="setActiveMenu('dashboard')">
                <img class="img-li" src="\images\sidebar\assistant.png" alt="" />
                <span class="text">Dashboard</span>
              </a>
            </li>
          </ul>
        </div>

        <div class="menu">
          <p class="title">Account</p>
          <ul>
            <li>
              <a href="#" @click="handleHelp">
                <img class="img-li" src="\images\sidebar\help.svg" alt="" />
                <span class="text">Help</span>
              </a>
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

      <div class="menu-btn" @click="toggleSidebar">
        <img class="img-li" src="\images\sidebar\menu.png" alt="" />
        <i class="ph-bold" :class="isSidebarCollapsed ? 'ph-arrow-right' : 'ph-arrow-left'"></i>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// State for sidebar and menu
const isSidebarCollapsed = ref(false)
const activeMenu = ref('dashboard')
const openSubmenu = ref(null)

// Toggle sidebar collapse
const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
}

// Set active menu item
const setActiveMenu = (menu) => {
  activeMenu.value = menu
  // Close any open submenu when selecting a menu item
  openSubmenu.value = null
}

// Toggle submenu visibility
const toggleSubmenu = (submenu) => {
  openSubmenu.value = openSubmenu.value === submenu ? null : submenu
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
  width: 100%;
  min-height: 100vh;
}

.sidebar {
  width: 256px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 20px;
  background-color: #fff;
  padding: 24px;
  border-radius: 30px;
  transition: width 0.3s ease;
  position: relative;
  /* background-color: rgb(77, 221, 77); */
}

.sidebar.active {
  width: 92px;
}

.sidebar .head {
  display: flex;
  gap: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f6f6f6;
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
  margin-bottom: 5px;
}

.menu ul li a {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  font-weight: 500;
  color: #757575;
  text-decoration: none;
  padding: 12px 8px;
  border-radius: 8px;
  transition: all 0.3s;
}

.menu ul li:hover a,
.menu ul li.active a {
  color: #000;
  background-color: #f6f6f6;
}

.menu ul li .icon {
  font-size: 20px;
}

.menu ul li .text {
  flex: 1;
}

.menu ul li .arrow {
  font-size: 14px;
  transition: all 0.3s;
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

.menu-btn:hover i {
  color: #000;
}

.menu-btn i {
  transition: all 0.3s;
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
.sidebar.active .menu > ul > li > a:hover .text {
  left: 50px;
  opacity: 1;
  visibility: visible;
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

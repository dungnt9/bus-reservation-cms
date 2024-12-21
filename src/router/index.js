import { createRouter, createWebHistory } from 'vue-router'
import Assistant from '@/views/Assistant.vue'
import Driver from '@/views/Driver.vue'
import Invoice from '@/views/Invoice.vue'
import Report from '@/views/Report.vue'
import Trip from '@/views/Trip.vue'
import Admin from '@/views/Admin.vue'
import Customer from '@/views/Customer.vue'
import RouteSchedule from '@/views/RouteSchedule.vue'
import Route from '@/views/Route.vue'
import Vehicle from '@/views/Vehicle.vue'
import Login from '@/views/Login.vue'
import authService from '@/services/authService'
import AdminSettings from '@/views/AdminSettings.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: Login,
      meta: { requiresAuth: false },
    },
    {
      path: '/account-settings',
      name: 'AccountSettings',
      component: AdminSettings,
      meta: { requiresAuth: true },
    },
    {
      path: '/admin',
      name: 'Admin',
      component: Admin,
      meta: { requiresAuth: true },
    },
    {
      path: '/customer',
      name: 'Customer',
      component: Customer,
      meta: { requiresAuth: true },
    },
    {
      path: '/driver',
      name: 'Driver',
      component: Driver,
      meta: { requiresAuth: true },
    },
    {
      path: '/assistant',
      name: 'Assistant',
      component: Assistant,
      meta: { requiresAuth: true },
    },
    {
      path: '/vehicle',
      name: 'Vehicle',
      component: Vehicle,
      meta: { requiresAuth: true },
    },
    {
      path: '/route',
      name: 'Route',
      component: Route,
      meta: { requiresAuth: true },
    },
    {
      path: '/route-schedule',
      name: 'RouteSchedule',
      component: RouteSchedule,
      meta: { requiresAuth: true },
    },
    {
      path: '/trip',
      name: 'Trip',
      component: Trip,
      meta: { requiresAuth: true },
    },
    {
      path: '/invoice',
      name: 'Invoice',
      component: Invoice,
      meta: { requiresAuth: true },
    },
    {
      path: '/',
      name: 'Report',
      component: Report,
      meta: { requiresAuth: true },
    },
    // Redirect any unknown routes to login
    {
      path: '/:pathMatch(.*)*',
      redirect: '/login',
    },
  ],
})

router.beforeEach((to, from, next) => {
  const isAuthenticated = authService.isAuthenticated()

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } else if (to.path === '/login' && isAuthenticated) {
    next('/admin') // or wherever you want authenticated users to go
  } else {
    next()
  }
})

export default router

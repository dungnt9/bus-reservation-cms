import { createRouter, createWebHistory } from 'vue-router'
import Assistant from '@/views/Assistant.vue'
import Driver from '@/views/Driver.vue'
import Invoice from '@/views/Invoice.vue'
import Report from '@/views/Report.vue'
import Trip from '@/views/Trip.vue'
import Admin from '@/views/Admin.vue'
import Customer from '@/views/Customer.vue'
import VehicleSeat from '@/views/VehicleSeat.vue'
import RouteSchedule from '@/views/RouteSchedule.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/admin', name: 'Admin', component: Admin },
    { path: '/customer', name: 'Customer', component: Customer },
    { path: '/driver', name: 'Driver', component: Driver },
    { path: '/assistant', name: 'Assistant', component: Assistant },
    { path: '/vehicle-seat', name: 'VehicleSeat', component: VehicleSeat },
    { path: '/route-schedule', name: 'RouteSchedule', component: RouteSchedule },
    { path: '/trip', name: 'Trip', component: Trip },
    { path: '/invoice', name: 'Invoice', component: Invoice },
    { path: '/', name: 'Report', component: Report },
  ],
})

export default router

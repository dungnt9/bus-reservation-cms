import { createRouter, createWebHistory } from 'vue-router'
import Assistant from '@/views/Assistant.vue'
import Driver from '@/views/Driver.vue'
import Invoice from '@/views/Invoice.vue'
import Report from '@/views/Report.vue'
import Route from '@/views/Route.vue'
import Trip from '@/views/Trip.vue'
import Account from '@/views/Account.vue'
import Admin from '@/views/Admin.vue'
import Customer from '@/views/Customer.vue'
import VehicleSeat from '@/views/VehicleSeat.vue'
import Vehicle from '@/views/Vehicle.vue'
import RouteSchedule from '@/views/RouteSchedule.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/account', name: 'Account', component: Account },
    { path: '/admin', name: 'Admin', component: Admin },
    { path: '/customer', name: 'Customer', component: Customer },
    { path: '/driver', name: 'Driver', component: Driver },
    { path: '/assistant', name: 'Assistant', component: Assistant },
    { path: '/vehicle', name: 'Vehicle', component: Vehicle },
    { path: '/route', name: 'Route', component: Route },
    { path: '/route-schedule', name: 'RouteSchedule', component: RouteSchedule },
    { path: '/trip', name: 'Trip', component: Trip },
    { path: '/invoice', name: 'Invoice', component: Invoice },
    { path: '/', name: 'Report', component: Report },
  ],
})

export default router

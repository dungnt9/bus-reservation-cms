import { createRouter, createWebHistory } from 'vue-router'
import Assistant from '@/views/Assistant.vue'
import Driver from '@/views/Driver.vue'
import HomeView from '@/views/HomeView.vue'
import Invoice from '@/views/Invoice.vue'
import Report from '@/views/Report.vue'
import Route from '@/views/Route.vue'
import Ticket from '@/views/Ticket.vue'
import Trip from '@/views/Trip.vue'
import User from '@/views/User.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'Home', component: HomeView },
    { path: '/assistant', name: 'Assistant', component: Assistant },
    { path: '/driver', name: 'Driver', component: Driver },
    { path: '/invoice', name: 'Invoice', component: Invoice },
    { path: '/report', name: 'Report', component: Report },
    { path: '/route', name: 'Route', component: Route },
    { path: '/ticket', name: 'Ticket', component: Ticket },
    { path: '/trip', name: 'Trip', component: Trip },
    { path: '/user', name: 'User', component: User },
  ],
})

export default router

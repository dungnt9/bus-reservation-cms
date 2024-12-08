import './assets/main.css'
import 'bootstrap/dist/css/bootstrap.min.css'
// import 'bootstrap/dist/css/bootstrap.css'
// import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import '@fortawesome/fontawesome-free/css/all.css'
// import 'bootstrap-vue-3/dist/bootstrap-vue-3.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
// import { BootstrapVue3 } from 'bootstrap-vue-3'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
// app.use(BootstrapVue3)
app.mount('#app')

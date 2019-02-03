import Vue from 'vue'
import './plugins/vuetify'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'
import interceptorSetup from './plugins/interceptors'

Vue.prototype.$http = axios
Vue.config.productionTip = false

interceptorSetup()

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')

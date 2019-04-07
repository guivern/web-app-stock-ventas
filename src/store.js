import Vue from 'vue'
import Vuex from 'vuex'
import decode from 'jwt-decode'
import router from './router'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    token: localStorage.getItem("stockVentasToken")?localStorage.getItem("stockVentasToken"):null,
    usuario: localStorage.getItem("stockVentasToken")?decode(localStorage.getItem("stockVentasToken")):null
  },
  mutations: {
    // logica para cambiar de estado
    setToken(state, token) {
      state.token = token
    },
    setUsuario(state, usuario) {
      state.usuario = usuario
    }
  },
  actions: {
    // logica para realizar mutaciones
    guardarToken({commit}, token) {
      //almacena el token del usuario logeado
      commit("setToken", token)
      commit("setUsuario", decode(token))
      localStorage.setItem("stockVentasToken", token)
    },
    autoLogin({commit}) {
      let token = localStorage.getItem("stockVentasToken")
      if (token) {
        commit("setToken", token)
        commit("setUsuario", decode(token))
      }
      //router.push({ name: 'home' })
      //router.forward();
    },
    salir({commit}) {
      commit("setToken", null)
      commit("setUsuario", null)
      localStorage.removeItem("stockVentasToken")
      router.push({name: 'login'})
    }
  }
})

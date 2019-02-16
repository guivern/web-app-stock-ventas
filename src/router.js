import Vue from "vue";
import store from "./store";
import Router from "vue-router";
import Home from "./views/Home.vue";
import Categoria from "./components/Categoria.vue";
import Articulo from "./components/Articulo.vue";
import Rol from "./components/Rol.vue";
import Usuario from "./components/Usuario.vue";
import Cliente from "./components/Cliente.vue";
import Proveedor from "./components/Proveedor.vue";
import Login from "./components/Login";
import Ingreso from "./components/Ingreso.vue";
import IngresoForm from "./components/IngresoForm.vue";
import Venta from "./components/Venta.vue";
import VentaForm from "./components/VentaForm.vue";

Vue.use(Router);

var router = new Router({
  base: process.env.BASE_URL,
  routes: [
    {
      path: "/",
      name: "home",
      component: Home,
      meta: {
        administrador: true,
        almacenero: true,
        vendedor: true
      }
    },
    {
      path: "/categorias",
      name: "categorias",
      component: Categoria,
      meta: {
        administrador: true,
        almacenero: true
      }
    },
    {
      path: "/articulos",
      name: "articulos",
      component: Articulo,
      meta: {
        administrador: true,
        almacenero: true
      }
    },
    {
      path: "/ingresos",
      component: {
        render(c) {
          return c("router-view");
        }
      },
      children: [
        {
          path: "",
          component: Ingreso,
          meta: { administrador: true, almacenero: true }
        },
        {
          path: "nuevo",
          component: IngresoForm,
          meta: { administrador: true, almacenero: true },
          props: { titulo: "Ingreso de Artículos" }
        },
        //{ path: ':id', component: IngresoForm, meta: { administrador: true, almacenero: true } },
        {
          path: ":id",
          component: IngresoForm,
          props: route => ({
            id: parseInt(route.params.id),
            titulo: "Detalle de Ingreso"
          }),
          meta: { administrador: true, almacenero: true }
        }
      ]
    },

    {
      path: "/roles",
      name: "roles",
      component: Rol,
      meta: {
        administrador: true
      }
    },
    {
      path: "/usuarios",
      name: "usuarios",
      component: Usuario,
      meta: {
        administrador: true
      }
    },
    {
      path: "/clientes",
      name: "clientes",
      component: Cliente,
      meta: {
        administrador: true,
        vendedor: true
      }
    },

    {
      path: "/ventas",
      component: {
        render(c) {
          return c("router-view");
        }
      },
      children: [
        {
          path: "",
          component: Venta,
          meta: { administrador: true, vendedor: true }
        },
        {
          path: "nuevo",
          component: VentaForm,
          meta: { administrador: true, vendedor: true },
          props: { titulo: "Registro de Venta" }
        },
        //{ path: ':id', component: IngresoForm, props: (route) => ({ id: parseInt(route.params.id), titulo: "Detalle de Ingreso" }), meta: { administrador: true, almacenero: true } }
      ]
    },

    {
      path: "/proveedores",
      name: "proveedores",
      component: Proveedor,
      meta: {
        administrador: true,
        almacenero: true
      }
    },
    {
      path: "/login",
      name: "login",
      component: Login,
      meta: {
        libre: true
      }
    }
  ]
});

// validacion de acceso
router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.libre)) {
    next();
  } else if (
    store.state.usuario &&
    store.state.usuario.rol == "Administrador"
  ) {
    if (to.matched.some(record => record.meta.administrador)) {
      next();
    }
  } else if (store.state.usuario && store.state.usuario.rol == "Almacenero") {
    if (to.matched.some(record => record.meta.almacenero)) {
      next();
    }
  } else if (store.state.usuario && store.state.usuario.rol == "Vendedor") {
    if (to.matched.some(record => record.meta.vendedor)) {
      next();
    }
  } else {
    next({
      name: "login"
    });
  }
});

export default router;

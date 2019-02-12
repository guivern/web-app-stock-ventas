<template>
  <v-layout>
    <v-flex>
      <v-card>
        <v-toolbar color="info" dark flat>
          <v-toolbar-title>
            <v-btn icon @click="volver()" type="button">
              <v-icon>arrow_back</v-icon>
            </v-btn>
            {{this.titulo}}
          </v-toolbar-title>
        </v-toolbar>
        <div v-if="cargando" class="text-xs-center" style="padding:50px">
          <v-progress-circular :size="50" color="info" indeterminate></v-progress-circular>
        </div>
        <div v-if="getError" class="text-xs-center" style="padding:50px">
          <v-alert
            :value="getError"
            transition="scale-transition"
            type="error"
            outline
          >Ocurrió un error al intentar obtener los datos, por favor verifique su conexión e intente nuevamente.</v-alert>
          <v-btn v-if="id" color="info" title="recargar" @click="getIngreso()">Reintentar
            <v-icon small>refresh</v-icon>
          </v-btn>
          <v-btn v-else color="info" title="recargar" @click="getProveedores()">Reintentar
            <v-icon small>refresh</v-icon>
          </v-btn>
        </div>
        <template v-if="!cargando && !getError">
          <v-card>
            <v-card-text>
              <v-layout row wrap>
                <v-flex xs12 sm6 md6 lg6 x6>
                  <v-select
                    :readonly="soloLectura"
                    v-model="ingreso.tipoComprobante"
                    :items="tiposComprobantes"
                    label="Tipo Comprobante"
                    :error-messages="mensajeValidacion['TipoComprobante']"
                    class="mx-3"
                  ></v-select>
                </v-flex>
                <v-spacer></v-spacer>
                <v-flex xs12 sm6 md6 lg6 x6>
                  <v-text-field
                    :readonly="soloLectura"
                    v-model="ingreso.nroComprobante"
                    label="Nro. Comprobante"
                    :error-messages="mensajeValidacion['NroComprobante']"
                    class="mx-3"
                  ></v-text-field>
                </v-flex>
                <v-flex xs12 sm6 md6 lg6 x6>
                  <v-select
                    :readonly="soloLectura"
                    v-model="ingreso.idProveedor"
                    :items="proveedores"
                    item-text="razonSocial"
                    item-value="id"
                    label="Proveedor"
                    :error-messages="mensajeValidacion['IdProveedor']"
                    class="mx-3"
                  ></v-select>
                </v-flex>
                <v-spacer></v-spacer>
                <v-flex xs12 sm6 md6 lg6 x6>
                  <v-select
                    :readonly="soloLectura"
                    :items="impuestos"
                    item-text="descripcion"
                    item-value="value"
                    v-model="ingreso.impuesto"
                    label="Impuesto"
                    :error-messages="mensajeValidacion['Impuesto']"
                    class="mx-3"
                  ></v-select>
                </v-flex>
                <v-flex xs8 sm6 md6 lg6 x6>
                  <v-text-field
                    v-if="!soloLectura"
                    id="buscadorCodigo"
                    v-model="codigo"
                    label="Código"
                    @keyup.enter="buscarArticulo()"
                    :loading="buscando"
                    append-icon="search"
                    :autofocus="focusBuscador"
                    class="mx-3"
                  ></v-text-field>
                </v-flex>
                <v-flex xs4 sm5 md5 lg5 x5>
                  <v-btn small fab dark color="teal" v-if="!soloLectura">
                    <v-icon dark @click="activarBusqueda = true">list</v-icon>
                  </v-btn>
                </v-flex>
                <buscar-articulos v-model="activarBusqueda" @getArticulo="agregarDetalle"></buscar-articulos>
              </v-layout>
            </v-card-text>
          </v-card>
          <v-card>
            <v-card-text>
              <v-layout row wrap class="mx-3">
                <v-flex>
                  <v-data-table
                    :headers="headers"
                    :items="ingreso.detalles"
                    hide-actions
                    class="elevation-1"
                  >
                    <template slot="items" slot-scope="props">
                      <td class="justify-center layout px-0">
                        <v-icon @click="eliminarDetalle(props.item)" class="icon">delete</v-icon>
                      </td>
                      <td>{{ props.item.nombre }}</td>
                      <td>
                        <v-text-field
                          :readonly="soloLectura"
                          type="number"
                          :autofocus="focusDetalle"
                          v-model="props.item.cantidad"
                        ></v-text-field>
                      </td>
                      <td>
                        <v-text-field
                          :readonly="soloLectura"
                          type="number"
                          v-model="props.item.precio"
                          @keyup.enter="nuevoDetalle()"
                        ></v-text-field>
                      </td>
                      <td
                        class="text-xs-right"
                      >{{columnMoney(props.item.cantidad * props.item.precio)}}</td>
                    </template>
                    <template slot="no-data">
                      <div class="text-xs-center">No hay artículos agregados al detalle.</div>
                    </template>
                  </v-data-table>
                  <div v-if="ingreso.detalles.length > 0" style="margin:20px 5px">
                    <tr>
                      <td width="120px">
                        <b>Total Parcial:</b>
                      </td>
                      <td class="text-xs-right">{{columnMoney(calcularTotal - calcularImpuesto)}}</td>
                    </tr>
                    <tr>
                      <td>
                        <b>Total Impuesto:</b>
                      </td>
                      <td class="text-xs-right">{{columnMoney(calcularImpuesto)}}</td>
                    </tr>
                    <tr>
                      <td>
                        <b>Total Neto:</b>
                      </td>
                      <td class="text-xs-right">{{columnMoney(calcularTotal)}}</td>
                    </tr>
                  </div>
                </v-flex>
              </v-layout>
            </v-card-text>
          </v-card>
        </template>
      </v-card>
    </v-flex>
    <v-snackbar :timeout="2000" v-model="snackbar.visible" :color="snackbar.color">
      {{snackbar.message}}
      <v-icon>{{snackbar.icon}}</v-icon>
    </v-snackbar>
    <v-btn
      v-if="!soloLectura"
      fixed
      dark
      fab
      bottom
      right
      type="button"
      title="Guardar"
      color="info"
      @click="guardar"
      :loading="guardando"
    >
      <v-icon>send</v-icon>
    </v-btn>
  </v-layout>
</template>

<script>
import columnasMixin from "../Mixins/columnasMixin.js";
import usuarioMixin from "../Mixins/usuarioMixin.js";
import BuscarArticulos from "./BuscadorArticulos";
export default {
  mixins: [columnasMixin, usuarioMixin],
  components: { BuscarArticulos },
  name: "ingreso-form",
  props: {
    id: {
      type: Number,
      default: null,
      required: false
    },
    titulo: {
      type: String,
      default: null,
      required: true
    }
  },
  data() {
    return {
      headers: [
        { text: "Borrar", value: "borrar", sortable: false },
        { text: "Artículo", value: "nombre", sortable: false },
        { text: "Cantidad", value: "cantidad", sortable: false, width: "15%" },
        { text: "Precio", value: "precio", sortable: false, width: "15%" },
        { text: "Subtotal", value: "subtotal", sortable: false }
      ],
      ingreso: {
        id: null,
        idProveedor: null,
        idUsuario: null,
        tipoComprobante: null,
        nroComprobante: null,
        impuesto: null,
        total: null,
        detalles: []
      },
      tiposComprobantes: ["FACTURA", "RECIBO", "BOLETA"],
      impuestos: [
        { descripcion: "IVA 10%", value: 10 },
        { descripcion: "IVA 5%", value: 5 }
      ],
      proveedores: [],
      mensajeValidacion: [],
      totalParcial: 0.0,
      totalImpuesto: 0.0,
      codigo: null,
      cargando: false,
      guardando: false,
      getError: false,
      activarBusqueda: false,
      focusDetalle: false,
      focusBuscador: false,
      buscando: false,
      snackbar: {
        visible: false,
        message: null,
        color: "info",
        icon: ""
      }
    };
  },
  methods: {
    getIngreso() {
      this.cargando = true;
      this.getError = false;
      this.$http
        .get(`${process.env.VUE_APP_ROOT_API}ingresos/` + this.id)
        .then(response => {
          this.ingreso = response.data;
          this.getDetalles();
        })
        .catch(error => {
          console.log(error);
          this.cargando = false;
          this.getError = true;
        });
    },
    getDetalles() {
      this.$http
        .get(`${process.env.VUE_APP_ROOT_API}ingresos/detalle/` + this.id)
        .then(response => {
          this.ingreso.detalles = response.data;
          this.getProveedores();
        })
        .catch(error => {
          console.log(error);
          this.cargando = false;
          this.getError = true;
        });
    },
    getProveedores() {
      this.getError = false;
      this.$http
        .get(`${process.env.VUE_APP_ROOT_API}proveedores`)
        .then(response => {
          this.proveedores = response.data;
          this.cargando = false;
        })
        .catch(error => {
          console.log(error);
          this.cargando = false;
          this.getError = true;
        });
    },
    buscarArticulo() {
      this.buscando = true;
      this.focusDetalle = false;
      this.focusBuscador = false;
      this.$http
        .get(
          `${process.env.VUE_APP_ROOT_API}articulos/buscar?codigo=` +
            this.codigo
        )
        .then(response => {
          this.agregarDetalle(response.data);
          this.buscando = false;
        })
        .catch(error => {
          console.log(error);
          this.focusBuscador = true;
          this.snackbar.visible = true;
          this.buscando = false;
          if (error.response) {
            this.snackbar.icon = "info";
            this.snackbar.color = "info";
            this.snackbar.message = "Artículo no encontrado.";
          } else {
            this.snackbar.icon = "error";
            this.snackbar.color = "error";
            this.snackbar.message =
              "Ocurrió un error, revise su conexión e intente nuevamente.";
          }
        });
    },
    agregarDetalle(data = []) {
      // verifica si ya se agrego el articulo al detalle
      if (this.ingreso.detalles.find(d => d.idArticulo == data["id"])) {
        console.log("Ya existe");
        this.focusBuscador = true;
        return;
      }
      // sino, se agrega al detalle
      this.ingreso.detalles.push({
        idArticulo: data["id"],
        nombre: data["nombre"],
        cantidad: null,
        precio: null
      });
      this.focusDetalle = true;
    },
    nuevoDetalle() {
      this.codigo = null;
      document.getElementById("buscadorCodigo").focus();
    },
    eliminarDetalle(item) {
      console.log(item);
      console.log(this.ingreso.detalles);
      if (this.id) {
        this.snackbar.icon = "warning";
        this.snackbar.color = "error";
        this.snackbar.message = "Accion no permitida";
        this.snackbar.visible = true;
      } else {
        this.ingreso.detalles = this.ingreso.detalles.filter(
          d => d.idArticulo != item.idArticulo
        );
      }
    },
    guardar() {
      this.guardando = true;
      this.mensajeValidacion = [];
      this.ingreso.idUsuario = this.getUserId();
      this.$http
        .post(`${process.env.VUE_APP_ROOT_API}ingresos`, this.ingreso)
        .then(response => {
          this.guardando = false;
          //TODO: Redireccionar a ingresos/id
          this.snackbar.icon = "check_circle";
          this.snackbar.color = "success";
          this.snackbar.message = "Registro exitoso";
          this.snackbar.visible = true;
          setTimeout(() => {
            this.volver();
          }, 2000);
        })
        .catch(error => {
          this.guardando = false;
          if (error.response.data.errors) {
            this.mensajeValidacion = error.response.data.errors;
          } else if (error.response.data.detallesError) {
            this.snackbar.icon = "info";
            this.snackbar.color = "error";
            this.snackbar.message = error.response.data.detallesError;
            this.snackbar.visible = true;
          } else {
            this.snackbar.color = "error";
            this.snackbar.message = "Ocurrió un error, revise su conexión.";
            this.snackbar.visible = true;
          }
        });
    },
    volver() {
      this.$router.push(".");
    }
  },
  created() {
    console.log(this.id);
    if (this.id) {
      this.getIngreso();
    }
    this.getProveedores();
  },
  computed: {
    calcularTotal() {
      var sum = 0;
      this.ingreso.detalles.forEach(d => (sum += d.cantidad * d.precio));
      this.ingreso.total = sum;
      return sum;
    },
    calcularImpuesto() {
      var impuesto = this.ingreso.impuesto
        ? parseInt(this.ingreso.impuesto)
        : null;
      return (this.ingreso.total * impuesto) / (100 + impuesto);
    },
    soloLectura() {
      return this.id ? true : false;
    }
  }
};
</script>

<style scoped>
.icon:hover {
  color: #ff5252;
}
.icon {
  color: grey;
}
.column {
  margin: 0 20px;
}
</style>
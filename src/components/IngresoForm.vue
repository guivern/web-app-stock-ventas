<template>
  <v-layout>
    <v-flex>
      <v-card>
        <v-toolbar color="info" dark>
          <v-toolbar-title>
            <v-btn icon @click="$router.push('.')" type="button">
              <v-icon>arrow_back</v-icon>
            </v-btn>
            {{formTitle()}}
          </v-toolbar-title>
        </v-toolbar>

        <v-card>
          <v-card-text>
            <v-container grid-list-sm class="pa-4 white">
              <v-layout row wrap>
                <v-flex xs12 sm6 md6 lg6 x6>
                  <v-select
                    v-model="ingreso.tipoComprobante"
                    :items="tiposComprobantes"
                    label="Tipo Comprobante"
                    :error-messages="mensajeValidacion['TipoComprobante']"
                  ></v-select>
                </v-flex>
                <v-flex xs12 sm6 md6 lg6 x6>
                  <v-text-field
                    v-model="ingreso.nroComprobante"
                    label="Nro. Comprobante"
                    :error-messages="mensajeValidacion['NroComprobante']"
                  ></v-text-field>
                </v-flex>
                <v-flex xs12 sm6 md6 lg6 x6>
                  <v-select
                    v-model="ingreso.idProveedor"
                    :items="proveedores"
                    item-text="razonSocial"
                    item-value="id"
                    label="Proveedor"
                    :error-messages="mensajeValidacion['IdProveedor']"
                  ></v-select>
                </v-flex>
                <v-flex xs12 sm6 md6 lg6 x6>
                  <!--<v-text-field type="number" v-model="ingreso.impuesto" label="Impuesto"></v-text-field>-->
                  <v-select
                    :items="impuestos"
                    item-text="descripcion"
                    item-value="value"
                    v-model="ingreso.impuesto"
                    label="Impuesto"
                    :error-messages="mensajeValidacion['Impuesto']"
                  ></v-select>
                </v-flex>
                <v-flex xs8 sm6 md6 lg6 x6>
                  <v-text-field
                    id="buscadorCodigo"
                    v-model="codigo"
                    label="Código"
                    @keyup.enter="buscarArticulo()"
                    :loading="cargando"
                    append-icon="search"
                  ></v-text-field>
                </v-flex>
                <v-flex xs4 sm6 md6 lg6 x6>
                  <v-btn small fab dark color="secondary">
                    <v-icon dark @click="activarBusqueda = true">list</v-icon>
                  </v-btn>
                </v-flex>
                <buscar-articulos v-model="activarBusqueda" @getArticulo="agregarDetalle"></buscar-articulos>
              </v-layout>
            </v-container>
          </v-card-text>
        </v-card>
        <v-card>
          <v-flex xs12 sm12 md12 lg12 x12>
            <v-data-table
              :headers="headers"
              :items="ingreso.detalles"
              hide-actions
              class="elevation-1"
            >
              <template slot="items" slot-scope="props">
                <td class="justify-center layout px-0">
                  <v-icon @click="eliminarDetalle(props.item)">delete</v-icon>
                </td>
                <td>{{ props.item.nombre }}</td>
                <td>
                  <v-text-field type="number" autofocus v-model="props.item.cantidad"></v-text-field>
                </td>
                <td>
                  <v-text-field type="number" v-model="props.item.precio" @keyup.enter="nuevoDetalle()"></v-text-field>
                </td>
                <td class="text-xs-right">{{columnMoney(props.item.cantidad * props.item.precio)}}</td>
              </template>
              <template slot="no-data">
                <div class="text-xs-center">No hay artículos seleccionados.</div>
              </template>
            </v-data-table>
            <v-container>
              <v-layout>
                <v-flex class="text-rs-right">
                  <b>Total Parcial:</b>
                  {{columnMoney(calcularTotal - calcularImpuesto)}}
                </v-flex>
                <v-flex class="text-rs-right">
                  <b>Total Impuesto:</b>
                  {{columnMoney(calcularImpuesto)}}
                </v-flex>
                <v-flex class="text-rs-right">
                  <b>Total Neto:</b>
                  {{columnMoney(calcularTotal)}}
                </v-flex>
              </v-layout>
            </v-container>
          </v-flex>
        </v-card>
      </v-card>
    </v-flex>
    <v-snackbar :timeout="2000" v-model="snackbar.visible" :color="snackbar.color">
      {{snackbar.message}}
      <v-icon>{{snackbar.icon}}</v-icon>
    </v-snackbar>
    <v-btn
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
import usuarioMixin from "../Mixins/usuarioMixin.js"
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
    }
  },
  data() {
    return {
      headers: [
        { text: "Borrar", value: "borrar", sortable: false },
        { text: "Artículo", value: "nombre", sortable: false },
        { text: "Cantidad", value: "cantidad", sortable: false },
        { text: "Precio", value: "precio", sortable: false },
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
      ingresoDefault: {
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
      mensajeValidacion: [],
      proveedores: [],
      snackbar: {
        visible: false,
        message: null,
        color: "info"
      },
      totalParcial: 0.0,
      totalImpuesto: 0.0,
      codigo: null,
      cargando: false,
      guardando: false,
      getError: false,
      snackbar: {
        visible: false,
        message: null,
        color: "info",
        icon: ""
      },
      impuestos: [
        { descripcion: "IVA 10%", value: 10 },
        { descripcion: "IVA 5%", value: 5 }
      ],
      activarBusqueda: false
    };
  },
  methods: {
    getIngreso() {},
    getProveedores() {
      this.cargando = true;
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
      this.cargando = true;
      this.getError = false;
      this.$http
        .get(
          `${process.env.VUE_APP_ROOT_API}articulos/buscar?codigo=` +
            this.codigo
        )
        .then(response => {
          //this.ingreso.detalles.push(response.data);
          this.agregarDetalle(response.data);
          this.cargando = false;
        })
        .catch(error => {
          console.log(error);
          this.snackbar.visible = true;
          this.cargando = false;
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
      if (this.ingreso.detalles.find(d => d.id == data["id"])) {
        return;
      }
      // sino, se agrega al detalle
      this.ingreso.detalles.push({
        idArticulo: data["id"],
        nombre: data["nombre"],
        cantidad: null,
        precio: null
      });
    },
    nuevoDetalle(){
      this.codigo = null;
      document.getElementById("buscadorCodigo").focus();
    },
    eliminarDetalle(item) {
      this.ingreso.detalles = this.ingreso.detalles.filter(
        d => d.id != item.id
      );
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
        })
        .catch(error => {
          this.guardando = false;
          if (error.response.data.errors) {
            this.mensajeValidacion = error.response.data.errors;
          }
          else if(error.response.data.detallesError){
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
    limpiar() {
      this.ingreso = Object.assign({}, this.ingresoDefault);
      this.mensajeValidacion = [];
    },
    formTitle() {
      return !this.ingreso.id ? "Ingreso de Artículos" : "Actualizar Ingreso";
    }
  },
  created() {
    this.getProveedores();
    if (this.id != null) {
      this.getIngreso();
    }
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
    }
  }
};
</script>

<style scoped>
</style>
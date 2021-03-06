<template>
  <v-layout align-start>
    <v-flex>
      <v-card>
        <v-toolbar flat color="info" dark>
          <v-toolbar-title>Ventas</v-toolbar-title>
          <v-divider class="mx-4" inset vertical></v-divider>
        </v-toolbar>
        <div>
          <v-layout row wrap>
            <v-flex xs8 md6>
              <v-text-field
                class="ml-4"
                v-model="search"
                prepend-icon="search"
                label="Búsqueda"
                @keyup="searchTimeOut()"
              ></v-text-field>
            </v-flex>
          </v-layout>
          <v-layout row wrap>
            <v-flex xs8 md3>
              <v-text-field
                class="ml-4"
                type="date"
                label="Fecha Desde"
                v-model="fechaInicio"
                prepend-icon="date_range"
                @input="listar"
              ></v-text-field>
            </v-flex>
            <v-flex xs8 md3>
              <v-text-field
                class="ml-4"
                type="date"
                label="Fecha Hasta"
                v-model="fechaFin"
                prepend-icon="date_range"
                @input="listar"
              ></v-text-field>
            </v-flex>
          </v-layout>
        </div>
        <v-data-table
          :headers="headers"
          :items="ventas"
          class="elevation-1"
          :loading="cargando"
          :rows-per-page-items="rowsPerPageItems"
          :pagination.sync="pagination"
        >
          <template slot="items" slot-scope="props">
            <td>
              <v-icon
                @click="$router.push({path: '/ventas/' + props.item.id, append: true})"
                title="ver detalle"
              >visibility</v-icon>
              <template v-if="props.item.estado == 'Aceptado'">
                <v-icon @click="mostrarDialog(props.item.id)" title="anular" class="icon">block</v-icon>
              </template>
              <template v-else>
                <span>Anulado</span>
              </template>
            </td>
            <td>{{ props.item.nombreUsuario }}</td>
            <td>{{ props.item.nombreCliente }}</td>
            <td>{{ props.item.tipoComprobante }}</td>
            <td>{{ props.item.nroComprobante }}</td>
            <td>{{ columnDate(props.item.fechaHora) }}</td>
            <td>{{ columnIva(props.item.impuesto) }}</td>
            <td class="text-xs-right">{{ columnMoney(props.item.total) }}</td>
            <!--<td
              :class="{'indigo--text':props.item.estado == 'Aceptado', 'red--text':props.item.estado !== 'Aceptado'}"
            >{{ props.item.estado == 'Aceptado' ? 'Aceptado' : props.item.estado }}</td>-->
          </template>

          <template slot="no-data">
            <div v-if="cargando" class="text-xs-center">
              <p>Cargando...</p>
            </div>
            <div v-else-if="getError" class="text-xs-center">
              <v-alert
                :value="getError"
                transition="scale-transition"
                type="error"
                outline
              >Ocurrió un error al intentar obtener los datos, por favor verifique su conexión e intente nuevamente.</v-alert>
              <v-btn color="info" title="recargar" @click="listar()">
                Reintentar
                <v-icon small>refresh</v-icon>
              </v-btn>
            </div>
            <div v-else class="text-xs-center">No se encontraron registros</div>
          </template>
        </v-data-table>
      </v-card>
      <v-btn
        fixed
        dark
        fab
        bottom
        right
        type="button"
        title="Nuevo"
        color="info"
        @click="$router.push({path: 'nuevo', append: true})"
      >
        <v-icon>add</v-icon>
      </v-btn>
    </v-flex>
    <v-dialog v-model="dialog" max-width="420">
      <v-card>
        <v-toolbar color="secondary" flat dark dense extense>
          <v-toolbar-title>
            <v-icon class="mr-1">warning</v-icon>Anular venta
          </v-toolbar-title>
        </v-toolbar>
        <v-card-text>Esto provocará una actualización de stock</v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn flat color="error" @click="cerrarDialog()">Cancelar</v-btn>

          <v-btn flat color="primary" @click="anular()">Confirmar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar :timeout="2000" v-model="snackbar.visible" :color="snackbar.color">
      {{snackbar.message}}
      <v-icon>{{snackbar.icon}}</v-icon>
    </v-snackbar>
  </v-layout>
</template>

<script>
import columnasMixin from "../Mixins/columnasMixin.js";
export default {
  mixins: [columnasMixin],
  data() {
    return {
      ventas: [],
      cargando: false,
      getError: false,
      search: null,
      headers: [
        { text: "Opciones", value: "opciones", sortable: false },
        { text: "Usuario", value: "nombreUsuario" },
        { text: "Cliente", value: "nombreCliente" },
        { text: "Tipo Comprobante", value: "tipoComprobante" },
        { text: "Nro. Comprobante", value: "nroComprobante", sortable: false },
        { text: "Fecha", value: "fechaHora" },
        { text: "Impuesto", value: "impuesto", sortable: false },
        { text: "Total", value: "total", sortable: false }
        //{ text: "Estado", value: "estado", sortable: false }
      ],
      snackbar: {
        visible: false,
        message: null,
        color: "",
        icon: ""
      },
      timer: null,
      rowsPerPageItems: [5, 10, 25],
      pagination: {
        rowsPerPage: 5
      },
      dialog: false,
      idAnular: null,
      anulando: false,
      fechaInicio: null,
      fechaFin: null,
    };
  },
  methods: {
    listar() {
      var url = "ventas";
      if (
        this.search != null &&
        this.fechaInicio != null &&
        this.fechaFin != null
      ) {
        url +=
          "/search?filtro=" +
          this.search +
          "&fechaInicio=" +
          this.fechaInicio +
          "&fechaFin=" +
          this.fechaFin;
      } else if (
        this.search == null &&
        this.fechaInicio != null &&
        this.fechaFin != null
      ) {
        url +=
          "/search?fechaInicio=" +
          this.fechaInicio +
          "&fechaFin=" +
          this.fechaFin;
      } else if (
        this.search != null &&
        (this.fechaInicio == null || this.fechaFin == null)
      ) {
        url += "/search?filtro=" + this.search;
      }
      this.cargando = true;
      this.getError = false;
      this.$http
        .get(`${process.env.VUE_APP_ROOT_API}${url}`)
        .then(response => {
          this.ventas = response.data;
          this.cargando = false;
        })
        .catch(error => {
          console.log(error);
          this.cargando = false;
          this.getError = true;
        });
    },
    searchTimeOut() {
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }
      this.timer = setTimeout(() => {
        this.listar();
      }, 800); // agrega delay luego de cada tipeo
    },
    anular() {
      this.anulando = true;
      this.$http
        .put(`${process.env.VUE_APP_ROOT_API}ventas/anular/${this.idAnular}`)
        .then(() => {
          this.snackbar.icon = "info";
          this.snackbar.color = "success";
          this.snackbar.message = "Venta anulada";
          this.snackbar.visible = true;
          this.anulando = false;
          this.cerrarDialog();
          this.listar();
        })
        .catch(error => {
          console.log(error);
          this.snackbar.color = "error";
          this.snackbar.message = "Ocurrió un error, revise su conexión.";
          this.snackbar.visible = true;
          this.anulando = false;
          this.idAnular = null;
        });
    },
    mostrarDialog(id) {
      this.dialog = true;
      this.idAnular = id;
    },
    cerrarDialog() {
      this.dialog = false;
      this.idAnular = null;
    }
  },
  computed: {},

  watch: {},

  created() {
    this.listar();
  }
};
</script>
<style scoped>
.icon:hover {
  color: #1976d2;
}
.icon {
  color: grey;
}
</style>
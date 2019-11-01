<template>
  <v-layout align-start>
    <v-flex>
      <v-card>
        <v-toolbar flat color="info" dark>
          <v-toolbar-title>Consulta Ventas</v-toolbar-title>
        </v-toolbar>

        <v-layout row wrap>
          <v-flex xs4 md4 class="ml-4">
            <v-text-field
              label="Fecha desde"
              type="date"
              class="text-xs-center"
              v-model="fechaInicio"
              
            ></v-text-field>
          </v-flex>
          <v-flex xs4 md4 class="ml-4">
            <v-text-field
              label="Fecha Hasta"
              type="date"
              class="text-xs-center"
              v-model="fechaFin"
              
            ></v-text-field>
            </v-flex>

            <v-btn class="ml-4 accent" hide-details @click="listar">
              <v-icon>search</v-icon>
            </v-btn>
          
        </v-layout>

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
                class="icon mx-1"
              >visibility</v-icon>
            </td>
            <td>{{ props.item.nombreUsuario }}</td>
            <td>{{ props.item.nombreCliente }}</td>
            <td>{{ props.item.tipoComprobante }}</td>
            <td>{{ props.item.nroComprobante }}</td>
            <td>{{ columnDate(props.item.fechaHora) }}</td>
            <td>{{ columnIva(props.item.impuesto) }}</td>
            <td class="text-xs-right">{{ columnMoney(props.item.total) }}</td>
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
    </v-flex>
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
      search: "",
      headers: [
        { text: "Opciones", value: "opciones", sortable: false, width: "14%" },
        { text: "Usuario", value: "nombreUsuario" },
        { text: "Cliente", value: "nombreCliente" },
        { text: "Tipo Comprobante", value: "tipoComprobante" },
        { text: "Nro. Comprobante", value: "nroComprobante", sortable: false },
        { text: "Fecha", value: "fechaHora" },
        { text: "Impuesto", value: "impuesto", sortable: false },
        { text: "Total", value: "total", sortable: false, width: "15%" }
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
      fechaFin: null
    };
  },
  methods: {
    listar() {
      var url =
        "ventas" +
        (this.fechaInicio && this.fechaFin
          ? "/consulta?fechaInicio=" +
            this.fechaInicio +
            "&fechaFin=" +
            this.fechaFin
          : "");
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
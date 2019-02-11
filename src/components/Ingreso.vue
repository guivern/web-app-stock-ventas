<template>
  <v-layout align-start>
    <v-flex>
      <v-card>
        <v-toolbar flat color="white">
          <v-toolbar-title>Ingresos</v-toolbar-title>
          <v-divider class="mx-2" inset vertical></v-divider>
          <v-spacer></v-spacer>
          <v-text-field
            class="text-xs-center"
            v-model="search"
            append-icon="search"
            label="Búsqueda"
            single-line
            hide-details
          ></v-text-field>
          <v-spacer></v-spacer>
        </v-toolbar>
        <v-data-table
          :headers="headers"
          :items="ingresos"
          class="elevation-1"
          :search="search"
          :loading="cargando"
        >
          <template slot="items" slot-scope="props">
            <td>
              <v-icon
                @click="$router.push({path: '/ingresos/' + props.item.id, append: true})"
                title="ver detalle"
                @mouseover="e => e.target.classList.toggle('indigo--text')"
                @mouseleave="e => e.target.classList.remove('indigo--text')"
              >visibility</v-icon>
              <template v-if="props.item.estado == 'Aceptado'">
                <v-icon
                  @click="anular(props.item)"
                  title="anular"
                  @mouseover="e => e.target.classList.toggle('indigo--text')"
                  @mouseleave="e => e.target.classList.remove('indigo--text')"
                >block</v-icon>
              </template>
            </td>
            <td>{{ props.item.nombreUsuario }}</td>
            <td>{{ props.item.nombreProveedor }}</td>
            <td>{{ props.item.tipoComprobante }}</td>
            <td>{{ props.item.nroComprobante }}</td>
            <td>{{ columnDate(props.item.fechaHora) }}</td>
            <td>{{ columnIva(props.item.impuesto) }}</td>
            <td class="text-xs-right">{{ columnMoney(props.item.total) }}</td>
            <td
              :class="{'indigo--text':props.item.estado == 'Aceptado', 'red--text':props.item.estado !== 'Aceptado'}"
            >{{ props.item.estado == 'Aceptado' ? 'Aceptado' : props.item.estado }}</td>
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
              <v-btn color="info" title="recargar" @click="listar()">Reintentar
                <v-icon small>refresh</v-icon>
              </v-btn>
            </div>
            <div v-else class="text-xs-center">No se encontraron registros</div>
          </template>
        </v-data-table>
      </v-card>
    </v-flex>
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
      ingresos: [],
      cargando: false,
      getError: false,
      search: "",
      headers: [
        { text: "Opciones", value: "opciones", sortable: false },
        { text: "Usuario", value: "nombreUsuario" },
        { text: "Proveedor", value: "nombreProveedor" },
        { text: "Tipo Comprobante", value: "tipoComprobante" },
        { text: "Nro. Comprobante", value: "nroComprobante", sortable: false },
        { text: "Fecha", value: "fechaHora" },
        { text: "Impuesto", value: "impuesto", sortable: false },
        { text: "Total", value: "total", sortable: false },
        { text: "Estado", value: "estado", sortable: false }
      ],
      snackbar: {
        visible: false,
        message: null,
        color: "",
        icon: ""
      },
    };
  },
  methods: {
    listar() {
      this.cargando = true;
      this.getError = false;
      this.$http
        .get(`${process.env.VUE_APP_ROOT_API}ingresos`)
        .then(response => {
          this.ingresos = response.data;
          this.cargando = false;
        })
        .catch(error => {
          console.log(error);
          this.cargando = false;
          this.getError = true;
        });
    },
    anular(item) {
      this.$http
        .put(
          `${process.env.VUE_APP_ROOT_API}ingresos/anular/${item.id}`
        )
        .then(() => {
          this.snackbar.icon = "info";
          this.snackbar.color = "success";
          this.snackbar.message = "Ingreso anulado";
          this.snackbar.visible = true;
          this.listar();
        })
        .catch(error => {
          console.log(error);
          this.snackbar.color = "error";
          this.snackbar.message = "Ocurrió un error, revise su conexión.";
          this.snackbar.visible = true;
        });
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
</style>
<template>
  <v-layout align-start>
    <v-flex>
      <v-card>
        <v-toolbar flat color="white">
          <v-toolbar-title>Proveedores</v-toolbar-title>
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

          <v-dialog v-model="dialog" max-width="500px">
            <!--<v-btn slot="activator" color="primary" class="mb-2" round>Nuevo</v-btn>-->
            <v-card>
              <v-toolbar flat dark class="info">
                <v-toolbar-title>
                  <span class="headline">{{ formTitle() }}</span>
                </v-toolbar-title>
                <v-spacer></v-spacer>
              </v-toolbar>
              <v-divider></v-divider>
              <v-card-text v-on:keyup.enter="guardar">
                <v-container grid-list-md>
                  <v-layout wrap>
                    <v-flex xs12 sm12 md12>
                      <v-text-field
                        v-model="proveedor.razonSocial"
                        label="Razon Social"
                        :error-messages="mensajeValidacion['RazonSocial']"
                      ></v-text-field>
                    </v-flex>
                    <v-flex xs6 sm6 md6>
                      <v-select
                        v-model="proveedor.tipoDocumento"
                        :items="tiposDocumentos"
                        label="Tipo Documento"
                        :loading="cargando"
                        :error-messages="mensajeValidacion['TipoDocumento']"
                      ></v-select>
                    </v-flex>
                    <v-flex xs6 sm6 md6>
                      <v-text-field
                        v-model="proveedor.nroDocumento"
                        label="Nro. Documento"
                        :error-messages="mensajeValidacion['NroDocumento']"
                      ></v-text-field>
                    </v-flex>
                    <v-flex xs12 sm12 md12>
                      <v-text-field
                        v-model="proveedor.direccion"
                        label="Direccion"
                        :error-messages="mensajeValidacion['Direccion']"
                      ></v-text-field>
                    </v-flex>
                    <v-flex xs6 sm6 md6>
                      <v-text-field
                        v-model="proveedor.telefono"
                        label="Telefono"
                        :error-messages="mensajeValidacion['Telefono']"
                      ></v-text-field>
                    </v-flex>
                    <v-flex xs6 sm6 md6>
                      <v-text-field
                        type="email"
                        v-model="proveedor.email"
                        label="Email"
                        :error-messages="mensajeValidacion['Email']"
                      ></v-text-field>
                    </v-flex>
                  </v-layout>
                </v-container>
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn flat color="error" @click="close" round :disabled="guardando">Cancelar</v-btn>
                <v-btn
                  flat
                  round
                  color="primary"
                  @click="guardar"
                  :loading="guardando"
                  :disabled="guardando"
                >Guardar</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-toolbar>
        <v-data-table
          :headers="headers"
          :items="proveedores"
          class="elevation-1"
          :search="search"
          :loading="cargando"
        >
          <template slot="items" slot-scope="props">
            <td>
              <v-icon class="mr-2" @click="editItem(props.item)">edit</v-icon>
            </td>
            <td>{{ props.item.razonSocial }}</td>
            <td>{{ props.item.tipoDocumento }}</td>
            <td>{{ props.item.nroDocumento }}</td>
            <td>{{ culumnNullable(props.item.direccion) }}</td>
            <td>{{ culumnNullable(props.item.telefono) }}</td>
            <td>{{ culumnNullable(props.item.email) }}</td>
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
      @click="dialog = true"
    >
      <v-icon>add</v-icon>
    </v-btn>
    <v-snackbar
      :timeout="1500"
      bottom
      left
      v-model="snackbar.visible"
      :color="snackbar.color"
    >{{snackbar.message}}</v-snackbar>
  </v-layout>
</template>

<script>
import columnasMixin from "../Mixins/columnasMixin.js";
export default {
  mixins: [columnasMixin],
  data() {
    return {
      proveedores: [],
      tiposDocumentos: [],
      dialog: false,
      cargando: false,
      guardando: false,
      getError: false,
      headers: [
        { text: "Opciones", value: "opciones", sortable: false },
        { text: "Razon Social", value: "razonSocial" },
        { text: "Tipo Documento", value: "tipoDocumento", sortable: false },
        { text: "Nro. Documento", value: "nroDocumento", sortable: false },
        { text: "Direccion", value: "direccion", sortable: false },
        { text: "Telefono", value: "telefono", sortable: false },
        { text: "Email", value: "email", sortable: false }
      ],
      proveedor: {
        id: null,
        razonSocial: null,
        tipoDocumento: null,
        nroDocumento: null,
        direccion: null,
        telefono: null,
        email: null
      },
      proveedorDefault: {
        id: null,
        razonSocial: null,
        tipoDocumento: null,
        nroDocumento: null,
        direccion: null,
        telefono: null,
        email: null
      },
      search: "",
      mensajeValidacion: [],
      snackbar: {
        visible: false,
        message: null,
        color: "info"
      }
    };
  },
  methods: {
    listar() {
      this.cargando = true;
      this.getError = false;
      this.$http
        .get(`${process.env.VUE_APP_ROOT_API}proveedores?Inactivos=true`)
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
    getproveedores() {
      this.cargando = true;
      this.getError = false;
      this.$http
        .get(`${process.env.VUE_APP_ROOT_API}tiposDocumentos`)
        .then(response => {
          this.tiposDocumentos = response.data;
          this.cargando = false;
        })
        .catch(error => {
          console.log(error);
          this.cargando = false;
          this.getError = true;
        });
    },
    editItem(item) {
      this.proveedor = Object.assign({}, item);
      this.dialog = true;
    },

    close() {
      this.dialog = false;
      setTimeout(() => {
        this.limpiar();
      }, 300);
    },
    guardar() {
      this.guardando = true;
      if (this.proveedor.id) {
        // Editar
        this.$http
          .put(
            `${process.env.VUE_APP_ROOT_API}proveedores/${this.proveedor.id}`,
            this.proveedor
          )
          .then(response => {
            this.guardando = false;
            this.close();
            this.listar();
          })
          .catch(error => {
            this.guardando = false;
            if (error.response) {
              this.mensajeValidacion = error.response.data.errors;
            } else {
              this.snackbar.color = "error";
              this.snackbar.message = "Ocurrió un error, revise su conexión.";
              this.snackbar.visible = true;
            }
          });
      } else {
        // Guardar
        this.$http
          .post(`${process.env.VUE_APP_ROOT_API}proveedores`, this.proveedor)
          .then(response => {
            this.guardando = false;
            this.close();
            this.listar();
          })
          .catch(error => {
            this.guardando = false;
            if (error.response) {
              this.mensajeValidacion = error.response.data.errors;
            } else {
              this.snackbar.color = "error";
              this.snackbar.message = "Ocurrió un error, revise su conexión.";
              this.snackbar.visible = true;
            }
          });
      }
    },
    limpiar() {
      this.proveedor = Object.assign({}, this.proveedorDefault);
      this.mensajeValidacion = [];
      this.matchError = false;
    },
    formTitle() {
      return !this.proveedor.id ? "Nuevo proveedor" : "Actualizar proveedor";
    }
  },
  computed: {},

  watch: {
    dialog(val) {
      val || this.close();
    }
  },

  created() {
    this.listar();
    this.getproveedores();
  }
};
</script>
<style scoped>
</style>
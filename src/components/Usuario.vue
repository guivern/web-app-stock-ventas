<template>
  <v-layout align-start>
    <v-flex>
      <v-toolbar flat color="white">
        <v-toolbar-title>Usuarios</v-toolbar-title>
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
          <v-btn slot="activator" color="primary" class="mb-2" round>Nuevo</v-btn>
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
                  <v-flex xs6 sm6 md6>
                    <v-text-field
                      v-model="usuario.username"
                      label="Username"
                      :error-messages="mensajeValidacion['Username']"
                    ></v-text-field>
                  </v-flex>
                  <v-flex xs6 sm6 md6>
                    <v-select
                      v-model="usuario.idRol"
                      :items="roles"
                      item-text="nombre"
                      item-value="id"
                      label="Rol"
                      :loading="cargando"
                      :error-messages="mensajeValidacion['IdRol']"
                    ></v-select>
                  </v-flex>
                  <v-flex xs6 sm6 md6>
                    <v-text-field
                      v-model="usuario.nombre"
                      label="Nombre"
                      :error-messages="mensajeValidacion['Nombre']"
                    ></v-text-field>
                  </v-flex>
                  <v-flex xs6 sm6 md6>
                    <v-text-field
                      v-model="usuario.apellido"
                      label="Apellido"
                      :error-messages="mensajeValidacion['Apellido']"
                    ></v-text-field>
                  </v-flex>
                  <v-flex xs6 sm6 md6>
                    <v-text-field
                      type="password"
                      v-model="usuario.password1"
                      label="Password"
                      :error-messages="mensajeValidacion['Password1']"
                    ></v-text-field>
                  </v-flex>
                  <v-flex xs6 sm6 md6>
                    <v-text-field
                      type="password"
                      v-model="usuario.password2"
                      label="Confirmar password"
                      :error-messages="mensajeValidacion['Password2']"
                    ></v-text-field>
                  </v-flex>
                </v-layout>
                <v-alert
                    v-show="matchError"
                    outline
                    transition="scale-transition"
                    type="error">
                    Los passwords no coinciden
                  </v-alert>
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
        :items="usuarios"
        class="elevation-1"
        :search="search"
        :loading="cargando"
      >
        <template slot="items" slot-scope="props">
          <td>
            <v-icon @click="editItem(props.item)">edit</v-icon>
            <template v-if="props.item.activo">
              <v-icon color="info" @click="activarDesactivar(props.item)">toggle_off</v-icon>
            </template>
            <template v-else>
              <v-icon @click="activarDesactivar(props.item)">toggle_on</v-icon>
            </template>
          </td>
          <td>{{ props.item.username }}</td>
          <td>{{ props.item.nombreRol }}</td>
          <td>{{ props.item.nombre }}</td>
          <td>{{ props.item.apellido }}</td>
          <td
            :class="{'indigo--text':props.item.activo, 'blue-grey--text':!props.item.activo}"
          >{{ props.item.activo ? 'Activo' : 'Inactivo' }}</td>
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
    </v-flex>
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
export default {
  data() {
    return {
      usuarios: [],
      roles: [],
      dialog: false,
      cargando: false,
      guardando: false,
      getError: false,
      matchError: false,
      headers: [
        { text: "Opciones", value: "opciones", sortable: false },
        { text: "Username", value: "username", sortable: false },
        { text: "Rol", value: "rol" },
        { text: "Nombre", value: "nombre" },
        { text: "Apellido", value: "apellido" },
        { text: "Estado", value: "activo" }
      ],
      usuario: {
        id: null,
        nombre: null,
        apellido: null,
        idRol: null,
        password1: null,
        password2: null,
        activo: true
      },
      usuarioDefault: {
        id: null,
        nombre: null,
        apellido: null,
        idRol: null,
        password1: null,
        password2: null,
        activo: true
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
        .get(`${process.env.VUE_APP_ROOT_API}usuarios?Inactivos=true`)
        .then(response => {
          this.usuarios = response.data;
          this.cargando = false;
        })
        .catch(error => {
          console.log(error);
          this.cargando = false;
          this.getError = true;
        });
    },
    getRoles() {
      this.cargando = true;
      this.getError = false;
      this.$http
        .get(`${process.env.VUE_APP_ROOT_API}roles`)
        .then(response => {
          this.roles = response.data;
          this.cargando = false;
        })
        .catch(error => {
          console.log(error);
          this.cargando = false;
          this.getError = true;
        });
    },
    editItem(item) {
      this.usuario = Object.assign({}, item);
      this.dialog = true;
    },
    activarDesactivar(item) {
      this.$http
        .put(
          `${process.env.VUE_APP_ROOT_API}usuarios/${
            item.activo ? "desactivar" : "activar"
          }/${item.id}`
        )
        .then(() => {
          item.activo = !item.activo;
        })
        .catch(error => {
          console.log(error);
          this.snackbar.color = "error";
          this.snackbar.message = "Ocurrió un error, revise su conexión.";
          this.snackbar.visible = true;
        });
    },

    close() {
      this.dialog = false;
      setTimeout(() => {
        this.limpiar();
      }, 300);
    },
    guardar() {
      this.guardando = true;
      if (this.usuario.id) {
        // Editar
        this.$http
          .put(
            `${process.env.VUE_APP_ROOT_API}usuarios/${this.usuario.id}`,
            this.usuario
          )
          .then(response => {
            this.guardando = false;
            this.close();
            this.listar();
          })
          .catch(error => {
            this.guardando = false;
            if (error.response.data.errors) {
              this.mensajeValidacion = error.response.data.errors;
            } else if (error.response.data.usernameError) {
              this.mensajeValidacion = {
                Username: error.response.data.usernameError
              };
            } else if (error.response.data.password1Error) {
              this.mensajeValidacion = {
                Password1: error.response.data.password1Error
              };
            } else if (error.response.data.password2Error) {
              this.mensajeValidacion = {
                Password2: error.response.data.password2Error
              };
            } else if (error.response.data.matchError) {
              this.matchError = true;
            } else {
              this.snackbar.color = "error";
              this.snackbar.message = "Ocurrió un error, revise su conexión.";
              this.snackbar.visible = true;
            }
          });
      } else {
        // Guardar
        this.$http
          .post(`${process.env.VUE_APP_ROOT_API}usuarios`, this.usuario)
          .then(response => {
            this.guardando = false;
            this.close();
            this.listar();
          })
          .catch(error => {
            this.guardando = false;
            if (error.response.data.errors) {
              this.mensajeValidacion = error.response.data.errors;
            } else if (error.response.data.usernameError) {
              this.mensajeValidacion = {
                Username: error.response.data.usernameError
              };
            } else if (error.response.data.password1Error) {
              this.mensajeValidacion = {
                Password1: error.response.data.password1Error
              };
            } else if (error.response.data.password2Error) {
              this.mensajeValidacion = {
                Password2: error.response.data.password2Error
              };
            } else if (error.response.data.matchError) {
              this.matchError = true;
            } else {
              this.snackbar.color = "error";
              this.snackbar.message = "Ocurrió un error, revise su conexión.";
              this.snackbar.visible = true;
            }
          });
      }
    },
    limpiar() {
      this.usuario = Object.assign({}, this.usuarioDefault);
      this.mensajeValidacion = [];
      this.matchError = false;
    },
    formTitle() {
      return !this.usuario.id ? "Nuevo usuario" : "Actualizar usuario";
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
    this.getRoles();
  }
};
</script>
<style scoped>
</style>
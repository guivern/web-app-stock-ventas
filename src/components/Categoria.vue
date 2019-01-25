<template>
  <v-layout align-start>
    <v-flex>
      <v-toolbar flat color="white">
        <v-toolbar-title>Categorías</v-toolbar-title>
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
          <v-btn slot="activator" color="primary" dark class="mb-2">Nuevo</v-btn>
          <v-card>
            <v-card-title>
              <span class="headline">{{ formTitle }}</span>
            </v-card-title>

            <v-card-text>
              <v-container grid-list-md>
                <v-layout wrap>
                  <v-flex xs12 sm12 md12>
                    <v-text-field v-model="categoria.nombre" label="Nombre" :error-messages="mensajeValidacion['Nombre']"></v-text-field>
                  </v-flex>
                  <v-flex xs12 sm12 md12>
                    <v-text-field v-model="categoria.descripcion" label="Descripcion"></v-text-field>
                  </v-flex>
                </v-layout>
              </v-container>
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" flat @click="close">Cancelar</v-btn>
              <v-btn color="blue darken-1" flat @click="guardar" :loading="guardando">Guardar</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-toolbar>
      <v-data-table
        :headers="headers"
        :items="categorias"
        class="elevation-1"
        :search="search"
        :loading="cargando"
      >
        <template slot="items" slot-scope="props">
          <td>
            <v-icon small class="mr-2" @click="editItem(props.item)">edit</v-icon>
            <v-icon small @click="deleteItem(props.item)">delete</v-icon>
          </td>
          <td>{{ props.item.nombre }}</td>
          <td>{{ props.item.descripcion }}</td>
          <td
            :class="{'indigo--text':props.item.activo, 'blue-grey--text':!props.item.activo}"
          >{{ props.item.activo ? 'Activo' : 'Inactivo' }}</td>
        </template>
        <template slot="no-data">
          <v-btn color="primary" @click="initialize">Resetear</v-btn>
        </template>
      </v-data-table>
      <!--<v-btn
        fixed
        dark
        fab
        bottom
        right
        type="button"
        title="Nuevo"
        color="primary"
        @click="dialog = true"
      >
        <v-icon>add</v-icon>
      </v-btn>-->
    </v-flex>
  </v-layout>
</template>

<script>
export default {
  data() {
    return {
      id: null,
      categorias: [],
      dialog: false,
      cargando: false,
      guardando: false,
      headers: [
        { text: "Opciones", value: "opciones", sortable: false },
        { text: "Nombre", value: "nombre" },
        { text: "Descripcion", value: "descripcion", sortable: false },
        { text: "Estado", value: "activo" }
      ],
      categoria: {
        nombre: "",
        descripcion: ""
      },
      categoriaDefault: {
        nombre: "",
        descripcion: ""
      },
      search: "",
      mensajeValidacion: [],
    };
  },
  methods: {
    listar() {
      this.cargando = true;
      this.$http
        .get(`${process.env.VUE_APP_ROOT_API}categorias`)
        .then(response => {
          this.categorias = response.data;
          this.cargando = false;
        })
        .catch(function(error) {
          console.log(error);
          this.cargando = false;
        });
    },
    editItem(item) {
      this.id = item.id;
      this.categoria.nombre = item.nombre;
      this.categoria.descripcion = item.descripcion;
      this.dialog = true;
    },

    deleteItem(item) {
      const index = this.desserts.indexOf(item);
      confirm("Are you sure you want to delete this item?") &&
        this.desserts.splice(index, 1);
    },

    close() {
      this.dialog = false;
      setTimeout(() => {
        this.limpiar();  
      }, 300);
    },
    guardar() {
      this.guardando = true;
      if (this.id) {
        // Editar
        this.$http
          .put(`${process.env.VUE_APP_ROOT_API}categorias/${this.id}`, this.categoria)
          .then(response => {
            this.guardando = false;
            this.close();
            this.listar();
            this.limpiar();
          })
          .catch(error => {
            this.guardando = false;
            this.mensajeValidacion = error.response.data.errors 
          });
      } else {
        // Guardar
        this.$http
          .post(`${process.env.VUE_APP_ROOT_API}categorias`, this.categoria)
          .then(response => {
            this.guardando = false;
            this.close();
            this.listar();
            this.limpiar();
          })
          .catch(error => {
            this.guardando = false;
            this.mensajeValidacion = error.response.data.errors 
          });
      }
    },
    limpiar() {
      this.categoria = Object.assign({}, this.categoriaDefault);
      this.mensajeValidacion = [];
      this.id = null;
    },
  },
  computed: {
    formTitle() {
      return this.id
        ? "Nueva categoria"
        : "Actualizar categoria";
    }
  },

  watch: {
    dialog(val) {
      val || this.close();
    }
  },

  created() {
    this.listar();
  }
};
</script>
<style scoped>
</style>
<template>
  <v-layout align-start>
    <v-flex>
      <v-card>
        <v-toolbar flat color="info" dark>
          <v-toolbar-title>Artículos</v-toolbar-title>
        </v-toolbar>

        <v-layout row wrap>
          <v-flex xs1>
            <v-btn class="ml-1" flat fab @click="reporte()">
              <v-icon>print</v-icon>
            </v-btn>
          </v-flex>  
            <v-flex xs10 md4>
            <v-text-field
              class="text-xs-center ml-4"
              v-model="search"
              append-icon="search"
              label="Búsqueda"
              single-line
              hide-details
            ></v-text-field>
          </v-flex>
        </v-layout>

        <v-data-table
          :headers="headers"
          :items="articulos"
          class="elevation-1"
          :search="search"
          :loading="cargando"
          :rows-per-page-items="rowsPerPageItems"
          :pagination.sync="pagination"
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
            <td>{{ props.item.codigo }}</td>
            <td>{{ props.item.nombre }}</td>
            <td>{{ props.item.nombreCategoria }}</td>
            <td class="text-xs-right">{{ props.item.stock }}</td>
            <td class="text-xs-right">{{ props.item.precioVenta }}</td>
            <td>{{ props.item.descripcion }}</td>
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
              <v-flex xs6 sm6 md6>
                <v-text-field
                  v-model="articulo.codigo"
                  label="Código"
                  :error-messages="mensajeValidacion['Codigo']"
                ></v-text-field>
              </v-flex>
              <v-flex xs6 sm6 md6>
                <v-select
                  v-model="articulo.idCategoria"
                  :items="categorias"
                  item-text="nombre"
                  item-value="id"
                  label="Categoría"
                  :loading="cargando"
                  :error-messages="mensajeValidacion['IdCategoria']"
                ></v-select>
              </v-flex>
              <v-flex xs12 sm12 md12>
                <v-text-field
                  v-model="articulo.nombre"
                  label="Nombre"
                  :error-messages="mensajeValidacion['Nombre']"
                ></v-text-field>
              </v-flex>
              <v-flex xs6 sm6 md6>
                <v-text-field
                  type="number"
                  v-model="articulo.stock"
                  label="Stock"
                  :error-messages="mensajeValidacion['Stock']"
                ></v-text-field>
              </v-flex>
              <v-flex xs6 sm6 md6>
                <v-text-field
                  type="number"
                  v-model="articulo.precioVenta"
                  label="Precio Venta"
                  :error-messages="mensajeValidacion['PrecioVenta']"
                ></v-text-field>
              </v-flex>
              <v-flex xs12 sm12 md12>
                <v-text-field v-model="articulo.descripcion" label="Descripción"></v-text-field>
              </v-flex>
            </v-layout>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="secondary" @click="close" flat :disabled="guardando">Cancelar</v-btn>
          <v-btn
            flat
            color="primary"
            @click="guardar"
            :loading="guardando"
            :disabled="guardando"
          >Guardar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

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
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
export default {
  data() {
    return {
      articulos: [],
      categorias: [],
      dialog: false,
      cargando: false,
      guardando: false,
      getError: false,
      headers: [
        { text: "Opciones", value: "opciones", sortable: false },
        { text: "Código", value: "codigo", sortable: false },
        { text: "Nombre", value: "nombre" },
        { text: "Categoria", value: "categoria" },
        { text: "Stock", value: "stock", sortable: false },
        { text: "Precio Venta", value: "precioVenta", sortable: false },
        { text: "Descripción", value: "descripcion", sortable: false },
        { text: "Estado", value: "activo" }
      ],
      articulo: {
        id: null,
        nombre: "",
        descripcion: "",
        idCategoria: null,
        precioVenta: null,
        stock: null,
        codigo: "",
        activo: true
      },
      articuloDefault: {
        id: null,
        nombre: "",
        descripcion: "",
        idCategoria: null,
        precioVenta: null,
        stock: null,
        codigo: "",
        activo: true
      },
      search: "",
      mensajeValidacion: [],
      snackbar: {
        visible: false,
        message: null,
        color: "info"
      },
      rowsPerPageItems: [5, 10, 25],
      pagination: {
        rowsPerPage: 5
      }
    };
  },
  methods: {
    reporte() {
      var columns = [
        { title: "Articulo", dataKey: "nombre" },
        { title: "Codigo", dataKey: "codigo" },
        { title: "Categoria", dataKey: "categoria" },
        { title: "Stock", dataKey: "stock" },
        { title: "Precio Venta", dataKey: "precio" }
      ];
      var rows = [];

      this.articulos.forEach(function(x) {
        rows.push({
          nombre: x.nombre,
          codigo: x.codigo,
          categoria: x.nombreCategoria,
          stock: x.stock,
          precio: x.precioVenta
        });
      });

      var doc = new jsPDF("p", "pt");
      doc.autoTable(columns, rows, {
        margin: { top: 50 },
        columnStyles: {
          stock: { halign: "right" },
          precio: { halign: "right" }
        },
        addPageContent: function(data) {
          doc.text("Lista de Articulos", 40, 30);
        }
      });
      doc.save("articulos.pdf");
    },

    listar() {
      this.cargando = true;
      this.getError = false;
      this.$http
        .get(`${process.env.VUE_APP_ROOT_API}articulos?Inactivos=true`)
        .then(response => {
          this.articulos = response.data;
          this.cargando = false;
        })
        .catch(error => {
          console.log(error);
          this.cargando = false;
          this.getError = true;
        });
    },
    getCategorias() {
      this.cargando = true;
      this.getError = false;
      this.$http
        .get(`${process.env.VUE_APP_ROOT_API}categorias`)
        .then(response => {
          this.categorias = response.data;
          this.cargando = false;
        })
        .catch(error => {
          console.log(error);
          this.cargando = false;
          this.getError = true;
        });
    },
    editItem(item) {
      this.articulo = Object.assign({}, item);
      this.dialog = true;
    },
    activarDesactivar(item) {
      this.$http
        .put(
          `${process.env.VUE_APP_ROOT_API}articulos/${
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
      if (this.articulo.id) {
        // Editar
        this.$http
          .put(
            `${process.env.VUE_APP_ROOT_API}articulos/${this.articulo.id}`,
            this.articulo
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
          .post(`${process.env.VUE_APP_ROOT_API}articulos`, this.articulo)
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
      this.articulo = Object.assign({}, this.articuloDefault);
      this.mensajeValidacion = [];
    },
    formTitle() {
      return !this.articulo.id ? "Nueva artículo" : "Actualizar artículo";
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
    this.getCategorias();
  }
};
</script>
<style scoped>
</style>
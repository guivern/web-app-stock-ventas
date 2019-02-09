<template>
  <v-dialog :value="value" @input="$emit('input')" max-width="950px">
    <v-card>
      <v-card-title class="headline">Seleccione un artículo</v-card-title>
      <v-card-text>
        <v-container grid-list-md>
          <v-layout wrap>
            <v-flex xs12 sm12 md12 lg12 xl12>
              <template>
                <v-text-field
                  append-icon="search"
                  class="text-xs-center"
                  v-model="nombre"
                  autofocus
                  label="Buscar"
                  @keyup.enter="buscarArticulos()"
                  @keyup="limpiar()"
                ></v-text-field>
                <v-data-table
                  :headers="header"
                  :items="articulos"
                  hide-actions
                  class="elevation-1"
                  :loading="cargando"
                >
                  <template slot="items" slot-scope="props">
                    <td class="justify-center layout px-0">
                      <v-icon @click="agregar(props.item)">add</v-icon>
                    </td>
                    <td>{{ props.item.nombre }}</td>
                    <td>{{ props.item.nombreCategoria }}</td>
                    <td>{{ props.item.stock }}</td>
                    <td>{{ props.item.precioVenta }}</td>
                  </template>
                  <template slot="no-data">
                    <div class="text-xs-center">{{mensaje}}</div>
                  </template>
                </v-data-table>
              </template>
            </v-flex>
          </v-layout>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="secondary" flat @click.native="cancelar">Cancelar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>
export default {
  name: "BuscadorArticulos",
  props: ["value"],
  data() {
    return {
      header: [
        { text: "Seleccionar", value: "seleccionar", sortable: false },
        { text: "Artículo", value: "nombre" },
        { text: "Categoria", value: "nombreCategoria" },
        { text: "Stock", value: "stock", sortable: false },
        { text: "Precio Venta", value: "precioVenta", sortable: false }
      ],
      articulos: [],
      articuloSeleccionados: [],
      nombre: null,
      cargando: false,
      getOk: false,
      getError: false
    };
  },
  methods: {
    buscarArticulos() {
      this.cargando = true;
      this.getOk = false;
      this.getError = false;
      this.$http
        .get(
          `${process.env.VUE_APP_ROOT_API}articulos/buscar?nombre=` +
            this.nombre
        )
        .then(response => {
          this.cargando = false;
          this.getOk = true;
          this.articulos = response.data;
          console.log(response.data);
        })
        .catch(error => {
          this.cargando = false;
          this.getError = true;
          console.log(response.data);
        });
    },
    agregar(item) {
      this.$emit("input");
      this.$emit("getArticulo", item);
      this.nombre = null;
      this.limpiar();
    },
    cancelar() {
      this.$emit("input");
      this.nombre = null;
      this.limpiar();
    },
    limpiar() {
      this.getOk = false;
      this.getError = false;
      this.articulos = [];
    }
  },
  computed: {
    mensaje() {
      if (this.getOk && this.articulos.length == 0) {
        return "La búsqueda no produjo resultados.";
      } else if (this.getError) {
        return "Ocurrió un error al intentar realizar la búsqueda, revise su conexión e intente nuevamente.";
      } else {
        return "Aquí apareceran los resultados de la búsqueda.";
      }
    }
  }
};
</script>


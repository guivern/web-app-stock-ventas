<template>
  <v-layout align-start justify-center>
    <v-flex xs12 sm8 md6 lg4 x14>
      <v-card>
        <v-toolbar dark color="primary">
          <v-toolbar-title>Login</v-toolbar-title>
        </v-toolbar>
        <v-card-text>
          <v-text-field
            v-model="credenciales.username"
            autofocus
            color="accent"
            label="Username"
            :error-messages="mensajeValidacion['Username']"
          ></v-text-field>
          <v-text-field
            v-model="credenciales.password"
            type="password"
            color="accent"
            label="Password"
            :error-messages="mensajeValidacion['Password']"
          ></v-text-field>
        </v-card-text>
        <v-card-actions class="px-3 pb-3">
          <v-flex text-xs-right>
            <v-btn color="primary" :loading="cargando" @click="ingresar">Ingresar</v-btn>
          </v-flex>
        </v-card-actions>
      </v-card>
    </v-flex>
    <v-snackbar
      :timeout="2000"
      bottom
      v-model="snackbar.visible"
      :color="snackbar.color"
    >
    {{snackbar.message}}
    <v-icon right>error</v-icon></v-snackbar>
  </v-layout>
</template>
<script>
export default {
  data() {
    return {
      credenciales: {
        username: null,
        password: null
      },
      cargando: false,
      mensajeValidacion: [],
      snackbar: {
        visible: false,
        message: null,
        color: "info"
      }
    };
  },
  methods: {
    ingresar() {
      this.cargando = true;
      this.$http
        .post(`${process.env.VUE_APP_ROOT_API}auth`, this.credenciales)
        .then(resp => {
          this.cargando = false;
          this.$store.dispatch("guardarToken", resp.data.token);
          this.$router.push({ name: "home" });
        })
        .catch(err => {
          this.cargando = false;
          if (err.response) {
            if (err.response.status == 400) {
              // errores de validacion
              this.mensajeValidacion = err.response.data.errors;
            } else {
              this.snackbar.color = "error";
              this.snackbar.message = err.response.data.error;
              this.snackbar.visible = true;
            }
          }else {
            this.snackbar.color = "error";
            this.snackbar.message = "Ocurrió un error, revise su conexión.";
            this.snackbar.visible = true;
          }
        });
    }
  }
};
</script>

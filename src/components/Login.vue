<template>
  <v-layout align-start justify-center>
    <v-card @keyup.enter.native="ingresar" width="400px" class="mx-auto">
      <v-toolbar flat dark color="primary">
        <v-toolbar-title class="font-weight-medium">Acceso al sistema</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-icon medium>account_circle</v-icon>
      </v-toolbar>
      <v-container grid-list-md text-xs-center>
        <v-card-text>
          <v-text-field
            v-model="credenciales.username"
            autofocus
            color="accent"
            label="Username"
            :error-messages="mensajeValidacion['Username']"
            append-icon="person"
          ></v-text-field>
          <v-text-field
            v-model="credenciales.password"
            type="password"
            color="accent"
            label="Password"
            :error-messages="mensajeValidacion['Password']"
            append-icon="lock"
            class="mb-3"
          ></v-text-field>

          <v-flex xs12>
            <v-btn dressed block color="primary" :loading="cargando1" @click="ingresar">Ingresar</v-btn>
          </v-flex>
          <v-flex xs12>
            <span>¿No tienes una cuenta?</span>
          </v-flex>
          <v-flex xs12>
            <v-btn block outline color="primary" :loading="cargando2" @click="invitado">Ingresar como Invitado</v-btn>
          </v-flex>
        </v-card-text>
      </v-container>
    </v-card>

    <v-snackbar :timeout="2000" bottom v-model="snackbar.visible" :color="snackbar.color">
      {{snackbar.message}}
      <v-icon right>error</v-icon>
    </v-snackbar>
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
      cargando1: false,
      cargando2: false,
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
      this.cargando1 = true;
      this.$http
        .post(`${process.env.VUE_APP_ROOT_API}auth`, this.credenciales)
        .then(resp => {
          this.cargando1 = false;
          this.$store.dispatch("guardarToken", resp.data.token);
          this.$router.push({ name: "home" });
        })
        .catch(err => {
          this.cargando1 = false;
          if (err.response) {
            if (err.response.status == 400) {
              // errores de validacion
              this.mensajeValidacion = err.response.data.errors;
            } else {
              this.snackbar.color = "error";
              this.snackbar.message = err.response.data.error;
              this.snackbar.visible = true;
            }
          } else {
            this.snackbar.color = "error";
            this.snackbar.message = "Ocurrió un error, revise su conexión.";
            this.snackbar.visible = true;
          }
        });
    },
    invitado() {
      this.cargando2 = true;
      this.$http
        .post(`${process.env.VUE_APP_ROOT_API}auth`, {
          username: "jperez",
          password: "password"
        })
        .then(resp => {
          this.cargando2 = false;
          this.$store.dispatch("guardarToken", resp.data.token);
          this.$router.push({ name: "home" });
        })
        .catch(err => {
          this.cargando2 = false;
          if (err.response) {
            if (err.response.status == 400) {
              // errores de validacion
              this.mensajeValidacion = err.response.data.errors;
            } else {
              this.snackbar.color = "error";
              this.snackbar.message = err.response.data.error;
              this.snackbar.visible = true;
            }
          } else {
            this.snackbar.color = "error";
            this.snackbar.message = "Ocurrió un error, revise su conexión.";
            this.snackbar.visible = true;
          }
        });
    }
  }
};
</script>

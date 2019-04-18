<template>
  <v-container grid-list-m>
    <v-layout wrap>
      <v-flex xs12 sm12 md12>
        <div v-if="cargando" class="text-xs-center" style="padding:50px">
          <v-progress-circular :size="50" color="primary" indeterminate></v-progress-circular>
        </div>
        <div v-if="getError" class="text-xs-center" style="padding:50px">
          <v-alert
            :value="getError"
            transition="scale-transition"
            type="error"
            outline
          >Ocurrió un error al intentar obtener los datos, por favor verifique su conexión e intente nuevamente.</v-alert>
          <v-btn color="info" title="recargar">
            Reintentar
            <v-icon small>refresh</v-icon>
          </v-btn>
        </div>
        <template v-show="!cargando && !getError">
          <div>
            <canvas id="myChart"></canvas>
          </div>
        </template>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import Chart from "chart.js";
import columnasMixin from "../Mixins/columnasMixin.js";
export default {
  mixins: [columnasMixin],
  data() {
    return {
      cargando: false,
      getError: false,
      dashboardValores: null,
      nombreMeses: [],
      totalMeses: [],
      meses: [
        "Enero",
        "Febrero",
        "Marzo",
        "Abril",
        "Mayo",
        "Junio",
        "Julio",
        "Agosto",
        "Septiembre",
        "Octubre",
        "Noviembre",
        "Diciembre"
      ]
    };
  },
  methods: {
    getDatosDashboard() {
      this.cargando = true;
      this.getError = false;
      this.$http
        .get(`${process.env.VUE_APP_ROOT_API}ventas/dashboard`)
        .then(response => {
          this.dashboardValores = response.data;
          this.cargarDashboard();
          this.cargando = false;
        })
        .catch(error => {
          console.log(error);
          this.cargando = false;
          this.getError = true;
        });
    },
    cargarDashboard() {
      this.dashboardValores.map(x => {
        this.nombreMeses.push(this.meses[x.mes - 1]);
        this.totalMeses.push(x.valor);
      });

      var ctx = document.getElementById("myChart");
      var myChart = new Chart(ctx, {
        type: "bar",
        data: {
          labels: this.nombreMeses,
          datasets: [
            {
              label: "Total ventas de los últimos meses",
              data: this.totalMeses,
              borderWidth: 1
            }
          ]
        },
        options: {
          scales: {
            yAxes: [
              {
                ticks: {
                  beginAtZero: true,
                  callback: function(label, index, labels) {
                    return Intl.NumberFormat(["ban", "id"]).format(label);
                  }
                }
              }
            ]
          }
        }
      });
    },
  },
  mounted() {
    this.getDatosDashboard();
  }
};
</script>

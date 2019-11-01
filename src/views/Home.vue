<template>
  <v-container grid-list-m>
    <v-layout wrap>
      <v-flex xs12 sm12 md12>
        <h2 class="text-xs-center">Gráfico de Ventas</h2>
        <div v-if="cargando" class="text-xs-center" style="padding:50px">
          <v-progress-circular :size="50" color="primary" indeterminate></v-progress-circular>
        </div>
        <div v-if="error" class="text-xs-center" style="padding:50px">
          <v-alert
            :value="error"
            transition="scale-transition"
            type="error"
            outline
          >Ocurrió un error.</v-alert>
          <v-btn color="info" title="recargar" @click="recargar">
            Reintentar
            <v-icon small>refresh</v-icon>
          </v-btn>
        </div>
        <template v-show="!cargando && !error">
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
      error: false,
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
      this.error = false;
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
          this.error = true;
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
              borderWidth: 1,
              backgroundColor: [
                "rgba(255, 99, 132, 0.2)",
                "rgba(54, 162, 235, 0.2)",
                "rgba(255, 206, 86, 0.2)",
                "rgba(75, 192, 192, 0.2)",
                "rgba(153, 102, 255, 0.2)",
                "rgba(255, 159, 64, 0.2)",
                "rgba(127, 159, 50, 0.2)",
                "rgba(80, 50, 70, 0.2)",
                "rgba(78, 125, 250, 0.2)"
              ]
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
    recargar() {
      this.getDatosDashboard();
    }
  },
  mounted() {
    this.getDatosDashboard();
  }
};
</script>

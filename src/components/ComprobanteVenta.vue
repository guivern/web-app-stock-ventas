<template>
  <v-dialog :value="value" @input="$emit('input')" max-width="1000px">
    <v-card>
      <v-toolbar color="secondary" flat dark dense extense>
        <v-toolbar-title> Vista previa </v-toolbar-title>
      </v-toolbar>
      <v-card-text>
        <div id="factura">
          <header>
            <div id="logo">
              <img
                src="data:image/png;base64,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
"
                id="imagen"
              >
            </div>
            <div id="datos">
              <p id="encabezado">
                <b>Company Name</b>
                <br>Mcal. Lopez 1368 c/ Sen. Long - Asuncion, Paraguay
                <br>Telefonos: 021-488-899 / (+595) 981-300-250
                <br>Email: company@info.com.py
              </p>
            </div>
            <div id="fact">
              <p>
                <b>Comprobante Nro.:</b>
                {{venta.nroComprobante}}
                <br>
                <b>Fecha:</b>
                {{columnDate(venta.fechaHora)}}
                <br>
                <b>Usuario:</b>
                {{venta.nombreUsuario}}
              </p>
            </div>
          </header>
          <br>
          <section>
            <div>
              <table id="facliente">
                <tbody>
                  <tr>
                    <td id="cliente">
                      <strong>Cliente: </strong>
                      {{venta.nombreCliente}}
                      <br>
                      <strong>Ruc: </strong> {{venta.nroDocumentoCliente}}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
          
          <section>
            <div>
              <table id="facarticulo">
                <thead>
                  <tr id="fa">
                    <th>CANT</th>
                    <th>DESCRIPCION</th>
                    <th>PRECIO UNIT</th>
                    <th>DESC.</th>
                    <th>PRECIO TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="detalle in venta.detalles" :key="detalle.id">
                    <td style="text-align:center;">{{detalle.cantidad}}</td>
                    <td>{{detalle.nombreArticulo}}</td>
                    <td style="text-align:right;">{{columnMoney(detalle.precio)}}</td>
                    <td style="text-align:right;">{{columnMoney(detalle.descuento)}}</td>
                    <td
                      style="text-align:right;"
                    >{{columnMoney(calcularSubtotal(detalle)) }}</td>
                  </tr>
                </tbody>
              </table>
              <div id="totales">
                    <tr>
                      <td width="120px">
                        <b>Total Parcial:</b>
                      </td>
                      <td class="text-xs-right">{{columnMoney(calcularTotal() - calcularImpuesto())}}</td>
                    </tr>
                    <tr>
                      <td>
                        <b>Total Impuesto:</b>
                      </td>
                      <td class="text-xs-right">{{columnMoney(calcularImpuesto())}}</td>
                    </tr>
                    <tr>
                      <td>
                        <b>Total Neto:</b>
                      </td>
                      <td class="text-xs-right">{{columnMoney(calcularTotal())}}</td>
                    </tr>
                  </div>
            </div>
          </section>
          <br><br><br>
          <footer>
            <div id="gracias">
              <p>
                <b>Gracias por su preferencia!</b>
                <br>
                <b>Obs:</b> Este documento virtual es solo un comprobante de su compra, para cuestiones tributarias solicite una factura impresa.
              </p>
            </div>
          </footer>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="secondary" flat @click.native="cerrar">Cancelar</v-btn>
        <v-btn color="primary" flat @click="crearPDF">
          Descargar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>
import columnasMixin from "../Mixins/columnasMixin.js";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
export default {
  mixins: [columnasMixin],
  name: "ComprobanteVenta",
  props: {
    value: {
      type: Boolean
    },
    venta: {
      type: Object
    }
  },
  data() {
    return {};
  },
  methods: {
    crearPDF(){
      var quotes = document.getElementById("factura");
      html2canvas(quotes).then(function(canvas){
        var imgData = canvas.toDataURL('image/png');
        var imgWidth = 210;
        var pageHeight = 295;
        var imgHeight = canvas.height * imgWidth / canvas.width;
        var heightLeft = imgHeight;
        var doc = new jsPDF('p','mm','a4');
        var position = 0

        doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        doc.save('comprobante-venta.pdf');
      });
    },
    calcularSubtotal(detalle) {
      return detalle.cantidad * detalle.precio - detalle.descuento;
    },
    calcularTotal() {
      var sum = 0;
      this.venta.detalles.forEach(
        d => (sum += d.cantidad * d.precio - d.descuento)
      );
      this.venta.total = sum;
      return sum;
    },
    calcularImpuesto() {
      var impuesto = this.venta.impuesto ? parseInt(this.venta.impuesto) : null;
      return (this.venta.total * impuesto) / (100 + impuesto);
    },
    cerrar() {
      this.$emit("input");
      console.log(this.venta);
    }
  },
  computed: {}
};
</script>
<style>
#factura {
  padding: 20px;
  font-family: Arial, sans-serif;
  font-size: 16px;
}

#logo {
  float: left;
  margin-left: 2%;
  margin-right: 2%;
}
#imagen {
  width: 100px;
}

#fact {
  float: right;
}

#datos {
  float: left;
  margin-top: 0%;
  margin-left: 2%;
  margin-right: 2%;
  /*text-align: justify;*/
}

#encabezado {
  text-align: left;
  margin-left: 10px;
  margin-right: 10px;
  font-size: 16px;
}

section {
  clear: left;
}

#cliente {
  text-align: left;
}

#facliente {
  width: 40%;
  border-collapse: collapse;
  border-spacing: 0;
  margin-bottom: 15px;
}

#fa {
  color: #ffffff;
  font-size: 14px;
}

#facarticulo {
  width: 100%;
  border-collapse: collapse;
  border-spacing: 0;
  padding: 20px;
  margin-bottom: 15px;
}

#facarticulo thead {
  padding: 20px;
  background: #2183e3;
  text-align: center;
  border-bottom: 1px solid #ffffff;
}

#gracias {
  text-align: center;
}

#totales{
  float: right;
}

</style>

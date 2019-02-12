export default {
  methods: {
    culumnNullable(val) {
      return val ? val : "-";
    },
    columnDate(val) {
      var date = new Date(val);

      var dd = date.getDate();
      var mm = date.getMonth() + 1; //January is 0!

      var yyyy = date.getFullYear();
      if (dd < 10) {
        dd = "0" + dd;
      }
      if (mm < 10) {
        mm = "0" + mm;
      }
      return dd + "/" + mm + "/" + yyyy + " " + date.toLocaleTimeString();
    },
    columnMoney(val) {
      val = val.toFixed(0);
      return new Intl.NumberFormat(["ban", "id"]).format(val) + ' Gs.';
    },

    columnIva(val){
      return 'IVA ' + val + '%';
    }
  }
};

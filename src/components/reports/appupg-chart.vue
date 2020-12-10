<template>
  <div v-if="flag">
    <template>
      <div class="" @mouseenter="mouseOverChart" @mouseleave="mouseLeaveChart" style="cursor: pointer;">
        <div class="float-right">
          <a @click="downloadCsv()" class="btn btn-outline-secondary download-button bg-transparent border-0" v-b-tooltip.hover v-if="buttonFlag && dataFlag" title="Download chart data">
            <p class="mb-0 text-primary">Download <i class="fal fa-arrow-circle-down text-primary ml-3 align-top"></i></p>
          </a>
        </div>
        <div>
          <appup-chart :config="chartreport.config"></appup-chart>
        </div>
      </div>
    </template>
   </div>
</template>

<script>
import appupChart from '../Appup-components/appup-chart';
export default {
  components: {
    'appup-chart': appupChart
  },
  props: ['chartreport', 'category_x_type'],
  data () {
    return {
      buttonFlag: false,
      dataFlag: false,
      flag: false,
      groupCategories: [],
    };
  },
  methods: {
    // Download the chart data in csv format
    downloadCsv: function () {
      var formedQuery = 'export=true&bucket_name=appup-bucket&file_name=' + this.chartreport.entity + '.csv';
      var obj = {};
      var url = {};
      if (this.chartreport.entity === 'custom') {
        url = this.chartreport.query.includes('?') ? this.chartreport.query + '&' + formedQuery : this.chartreport.query + '?' + formedQuery;
        obj = { method: 'POST', body: JSON.stringify({ data: this.tablereport.query_body }), headers: { Accept: 'application/json', 'Content-Type': 'application/json' } }
      } else {
        url = this.chartreport.query_body.includes('?') ? this.chartreport.query_body + '&' + formedQuery : this.chartreport.query_body + '?' + formedQuery;
      }
      fetch(url, obj)
        .then(res => {
          if (!res.ok) { throw new Error('HTTP status ' + res.status); }
          return res.json()
        })
        .then(response => {
          var link = document.createElement('a');
          link.download = 'default.csv';
          link.href = response.s3_url;
          link.click();
        }).catch((err) => {
          console.log(err);
        });
    },
    // Evnets when mouse over on chart
    mouseOverChart: function () {
      this.buttonFlag = true;
    },
    mouseLeaveChart: function () {
      this.buttonFlag = false;
    },
    // Setting the dynamic data to the chart config
    setInterval: function (odata) {
      const configJson = this.chartreport.config;
      if (this.chartreport.custom_function) {
        // eslint-disable-next-line no-eval
        var customFunction = eval(this.chartreport.custom_function);
        odata = customFunction(odata, configJson);
      }
      if (configJson.chart.type === 'pie') {
        configJson.series[0].data = [];
        configJson.plotOptions.pie.dataLabels = {};
        configJson.plotOptions.pie.dataLabels.enabled = false;
        for (var k = 0; k <= odata.length - 1; k++) {
          configJson.series[0].data[k] = {};
          configJson.series[0].data[k].name = '';
          configJson.series[0].data[k].y = 0;
          configJson.series[0].data[k].name = odata[k].rname;
          configJson.series[0].data[k].y = Number(odata[k].rdata);
        }
      } else if (configJson.chart.type === 'heatmap') {
        this.$set(configJson.series[0], 'data', odata);
      } else if (this.chartreport.report_type === 'groupbar' || this.chartreport.report_type === 'hgroupbar' || this.chartreport.report_type === 'groupline') {
        configJson.series = this.modifyDataForGroupedCharts(odata);
        configJson.xAxis.categories = [];
        configJson.xAxis.categories = this.groupCategories;
        configJson.chart.type = this.chartreport.report_type === 'groupbar' ? 'column' : this.chartreport.report_type === 'hgroupbar' ? 'bar' : 'line';
      } else if (this.chartreport.report_type === 'stackbar') {
        configJson.series = this.modifyDataForGroupedCharts(odata);
        configJson.xAxis.categories = [];
        configJson.xAxis.categories = this.groupCategories;
        configJson.plotOptions.column = {};
        configJson.plotOptions.column.stacking = 'normal';
      } else {
        if (odata.length > 0) {
          if (configJson.xAxis.type && configJson.xAxis.type === 'datetime') {
            var x = this.formatDate(odata[0].rname);
            var y = x.split('-');
            var sday = Number(y[0]);
            var smonth = Number(y[1]) - 1;
            var syear = Number(y[2]);
            configJson.plotOptions.series.pointStart = 0;
            configJson.plotOptions.series.pointInterval = 0;
            configJson.series[0].data = [];
            if (this.category_x_type === 'days' || this.category_x_type === 'weeks') {
              var type = this.category_x_type === 'days' ? 24 * 3600 * 1000 : 7 * 24 * 3600 * 1000;
              configJson.plotOptions.series.pointStart = Date.UTC(syear, smonth, sday);
              configJson.plotOptions.series.pointInterval = type;
              // Var data = this.formDataArray(odata);
              var data = this.daysAndWeeksDifference(odata, type);
              configJson.series[0].data = data;
            }
            if (this.category_x_type === 'months') {
              configJson.plotOptions.series.pointStart = Date.UTC(syear, smonth, 1);
              configJson.plotOptions.series.pointInterval = 31 * 24 * 3600 * 1000;
              // Var data = this.formDataArray(odata);
              // Var data = this.monthDifference(odata, 0);
              configJson.series[0].data = data;
            }
            if (this.category_x_type === 'quarterly') {
              configJson.plotOptions.series.pointStart = Date.UTC(syear, smonth, 1);
              configJson.plotOptions.series.pointInterval = 3 * 31 * 24 * 3600 * 1000;
              // Var data = this.formDataArray(odata);
              var data1 = this.monthDifference(odata, 1);
              configJson.series[0].data = data1;
            }
            if (this.category_x_type === 'years') {
              configJson.plotOptions.series.pointStart = Date.UTC(syear);
              configJson.plotOptions.series.pointInterval = 24 * 3600 * 365000;
              // Var data = this.formDataArray(odata);
              var data2 = this.yearDifference(odata);
              configJson.series[0].data = data2;
            }
          } else {
            configJson.xAxis.categories = [];
            configJson.xAxis.crosshair = true;
            configJson.series[0].data = [];
            configJson.series[0].name = this.chartreport.title;
            for (var k1 = 0; k1 <= odata.length - 1; k1++) {
              configJson.xAxis.categories.push(odata[k1].rname);
              configJson.series[0].data.push(Number(odata[k1].rdata));
            }
          }
        } else {
          configJson.series[0].data = [];
        }
      }
      this.flag = true;
    },
    daysAndWeeksDifference: function (odata, type) {
      // eslint-disable-next-line no-unused-vars
      var mData = [];
      for (var i = 0; i < odata.length - 1; i++) {
        var firstDate = new Date(odata[i].rname.replace(/-/gi, ','));
        var secondDate = new Date(odata[i + 1].rname.replace(/-/gi, ','));
        var diffDays = Math.round(Math.abs((firstDate.getTime() - secondDate.getTime()) / type));
        var b = [];
        b[0] = firstDate.setDate(firstDate.getDate());
        b[1] = odata[i].rdata;
        mData.push(b);
        if (diffDays <= 1) {
        } else {
          var date1 = firstDate;
          for (var j = 0; j < diffDays - 1; j++) {
            var date2 = date1.setDate(date1.getDate() + 1);
            var c = [];
            c[0] = date2;
            c[1] = 0;
            date1 = new Date(date2);
            date1 = date1.setDate(date1.getDate());
            date1 = new Date(date1);
            mData.push(c);
          }
        }
      }
      var lastDate = new Date(odata[odata.length - 1].rname.replace(/-/gi, ','));
      var a = [];
      a[0] = lastDate.setDate(lastDate.getDate());
      a[1] = odata[odata.length - 1].rdata;
      mData.push(a);
      return mData;
    },
    monthDifference: function (odata, quarter = 0) {
      var k = [];
      for (var i = 0; i < odata.length - 1; i++) {
        var firstDate = new Date(odata[i].rname.replace(/-/gi, ','));
        var secondDate = new Date(odata[i + 1].rname.replace(/-/gi, ','));
        var months;
        months = (secondDate.getFullYear() - firstDate.getFullYear()) * 12;
        months -= firstDate.getMonth() + 1;
        months += secondDate.getMonth() + 1;
        var diffMonths = months <= 0 ? 0 : months;
        k.push(diffMonths);
      }
      if (quarter === 1) {
        var quar = [];
        for (var x = 0; x < k.length; x++) {
          quar.push(Math.round(k[x] / 3));
        }
        k = quar;
      }
      var index = 0;
      var mData = [];
      mData.push(odata[index].rdata);
      index++;
      for (var j = 0; j < k.length; j++) {
        if (k[j] <= 1) {
          mData.push(odata[index].rdata);
          index++;
        } else {
          for (var z = 0; z < k[j] - 1; z++) {
            mData.push(0);
          }
          mData.push(odata[index].rdata);
          index++;
        }
      }
      return mData;
    },
    yearDifference: function (odata) {
      var cName = [];
      var cData = [];
      var dataa = [];
      for (var i = 0; i <= odata.length - 1; i++) {
        cName[i] = Number(odata[i].rname.split('-')[0]);
        cData[i] = odata[i].rdata;
      }
      for (var j = 0; j < cName.length; j++) {
        if (j < cName.length - 1) {
          if (cName[j] === cName[j + 1]) {
            cData[j] += cData[j + 1];
            cName.splice(j + 1, 1);
            cData.splice(j + 1, 1);
            j--;
          }
        }
      }
      var index = 1;
      dataa[0] = cData[0];
      if (cName.length > 1) {
        for (var l = 0; l < cName.length - 1; l++) {
          var diff = cName[l + 1] - cName[l];
          if (diff > 1) {
            for (var n = 0; n < diff - 1; n++) {
              dataa[index] = 0;
              index++;
            }
          } else {
            dataa[index] = cData[l + 1];
            index++;
          }
        }
      }
      return dataa;
    },
    formatDate: function (date) {
      var d = new Date(date);
      var month = '' + (d.getMonth() + 1);
      var day = '' + d.getDate();
      var year = d.getFullYear();

      if (month.length < 2) month = '0' + month;
      if (day.length < 2) day = '0' + day;

      return [day, month, year].join('-');
    },
    formDataArray: function (odata) {
      // Forming the data array for chart
      var dArray = [];
      for (var i = 0; i < odata.length; i++) {
        var k = [];
        var firstDate = new Date(odata[i].rname);
        var milliseconds = firstDate.getTime();
        k[0] = milliseconds;
        k[1] = odata[i].rdata ? odata[i].rdata : 0;
        dArray.push(k);
      }
      return dArray;
    },
    modifyDataForGroupedCharts: function (data) {
      var preObj = {};
      var newArr = [];
      data.forEach(function (objItem) {
        // eslint-disable-next-line no-prototype-builtins
        if (preObj.hasOwnProperty(objItem.rname)) {
          preObj[objItem.rname] = preObj[objItem.rname].flat();
          objItem.rdata = objItem.rdata.flat();
          preObj[objItem.rname].forEach(a => {
            objItem.rdata.forEach(b => {
              if (Object.keys(a)[0] === Object.keys(b)[0]) {
                a[Object.keys(a)[0]] = Object.values(a)[0] + Object.values(b)[0];
              }
            })
          })
        } else {
          preObj[objItem.rname] = objItem.rdata;
        }
      });
      for (var prop in preObj) {
        this.groupCategories.push(prop);
        preObj[prop] = preObj[prop].flat();
        preObj[prop].forEach(item => {
          var flag = false;
          newArr.forEach(a => {
            if (a.name === Object.keys(item)[0]) {
              flag = true;
              a.data.push(Object.values(item)[0]);
            }
          })
          if (!flag) {
            newArr.push({ name: Object.keys(item)[0], data: [Object.values(item)[0]] });
          }
        })
      }
      return newArr;
    }
  },
  mounted: function () {
    var scope = this;
    // Get the chart data (get/post)
    if (this.chartreport.custom_check === 1) {
      fetch(this.chartreport.formed_query, {
        method: 'post',
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: this.chartreport.query_body,
        }),
      })
        .then(function (response) {
          return response.json();
        })
        .then(function (data) {
          scope.dataFlag = data.length > 0;
          scope.setInterval(data);
        });
    } else if (this.chartreport.custom_check === 0) {
      fetch(this.chartreport.formed_query).then(response => {
        console.log('res', response);
        if (response.status === 200) {
          response.json().then(data => {
            scope.dataFlag = data.length > 0;
            scope.setInterval(data);
          });
        }
      });
    }
  },
};
</script>

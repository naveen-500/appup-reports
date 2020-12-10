<template>
  <highcharts :options="chartOptions" :highcharts="hcInstance" />
</template>
<script>
/**
 * @author Dharma
 * Chart components is using Highcharts api and vue components
 * Following charts are supported
 * 1)Line
 * 2)Bar
 * 3)Bubble
 * 4)Pie
 * 5)Funnel
 * ref: https://github.com/highcharts/highcharts-vue
 */
import { Chart } from 'highcharts-vue';
import Highcharts from 'highcharts';
// Load bubble chart module
import highchartsMore from 'highcharts/highcharts-more';
// Load funnel chart module
import highchartsFunnel from 'highcharts/modules/funnel';
// Load exporting options module
import exportingInit from 'highcharts/modules/exporting';
// Load heatmap chart module
import heatmap from 'highcharts/modules/heatmap';
// Load no data display module
import noData from 'highcharts/modules/no-data-to-display';
import MapModule from 'highcharts/modules/map';
import NetworkModule from 'highcharts/modules/networkgraph';
import ExportDataModule from 'highcharts/modules/export-data.js';
import DataModule from 'highcharts/modules/data';
highchartsMore(Highcharts);
highchartsFunnel(Highcharts);
exportingInit(Highcharts);
heatmap(Highcharts);
noData(Highcharts);
MapModule(Highcharts);
NetworkModule(Highcharts);
ExportDataModule(Highcharts);
DataModule(Highcharts);
const _merge = require('lodash.merge');

export default {
  name: 'appup-chart',
  props: {
    /**
     * Fetch json data form url
     * excepting json data as following
     * [{"name": "Year 1800","data": [107, 31, 635, 203, 2]},{"name": "Year 1900","data": [133, 156, 947, 408, 6]}]
     */
    url: {
      type: String
    },
    title: {
      type: String,
      required: true
    },

    /**
     * Type of chart to display
     * accepts
     * line,bar,bubble,pie,funnel
     */
    type: {
      type: String,
      required: true
    },
    /**
     * If in case url is not available
     * then data will be considered
     * sample data:
     * [{"name": "Year 1800","data": [107, 31, 635, 203, 2]},{"name": "Year 1900","data": [133, 156, 947, 408, 6]}]
     */
    data: {
      type: String
    },
    /**
     * Fetch extra addons for highcharts by using config
     * extra addons like legend,tootltip,xaxis,yaxis
     * x-axis and y-axis categories,
     */
    config: {
      type: Object,
      default () {
        return {};
      }
    }
  },

  components: {
    highcharts: Chart
  },

  data () {
    return {
      // Chart options
      hcInstance: Highcharts,
      chartOptions: {
        series: [
          {
            data: []
          }
        ],
        chart: {
          type: this.type
        },
        colorAxis: this.config.colorAxis,
        colorByPoint: true,
        title: {
          text: this.title
        },
        tooltip: {
          enabled: this.config.tooltip
        },
        subtitle: {
          text: this.config.subtitle
        },
        xAxis: {
          title: {
            text: this.config.xtitle
          },
          categories: this.config.xcategory
        },
        yAxis: {
          title: {
            text: this.config.ytitle
          }
        },
        legend: {
          enabled: this.config.legend
        },
        plotOptions: {
          series: {
            dataLabels: {
              enabled: true
            }
          }
        },
        credits: {
          enabled: false
        }
      }
    };
  },
  watch: {
    url: function (newval, oldval) {
      // Change url we will call method
      this.getDataFromUrl(newval);
    },
    config: {
      handler: function (newval, oldval) {
        this.chartOptions = newval;
      },
      deep: true
    }
  },
  created: function () {
    this.chartOptions = JSON.parse(
      JSON.stringify(_merge(this.chartOptions, this.config))
    );
    var regexp = /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/;
    // Var that = this;
    // Check url is exist or not, if exist check url is valid or not
    if (regexp.test(this.url) && this.url != null) {
      this.getDataFromUrl(this.url);
    } else {
      // Append JSON data from data to method
      if (this.data) {
        this.getHighCartData(JSON.parse(this.data), this.type);
      }
    }
  },
  methods: {
    callReflow: function () {
      for (var key in this.hcInstance.charts) {
        if (this.hcInstance.charts[key]) {
          this.hcInstance.charts[key].reflow();
        }
      }
      return true;
      // This.$parent.$children[0].$children[0].chart.reflow();
      // This.$parent.$children[0].$children[0].$children[0].$children[0].highcharts.charts[0].reflow();
    },
    getDataFromUrl: function (url) {
      // Axios
      // .get(url,{ withCredentials: true, credentials: 'include' })
      // .then(response => {
      // This.$appupajax
      //   .get2(url, {}, { withCredentials: true, credentials: "include" })
      this.$appupajax
        .get2(url, {}, {}, { withCredentials: true, credentials: 'include' })
        .then(this.$appupajax.handleResponse)
        .then(response => {
          // Append JSON data from url to method
          this.getHighCartData(response.data, this.type);
        })
        .catch(error => {
          console.log.json(error);
        });
    },
    getHighCartData: function (data, type) {
      var that = this;
      var newData = [];
      /**
       * Here data is coming from either JSON data from url or data field
       * for example data will be [{"name": "Year 1800","data": [107, 31, 635, 203, 2]},{"name": "Year 1900","data": [133, 156, 947, 408, 6]}]
       * By using this data, iterate one and modified data to highcharts data
       * for example funnel data [['Website visits', 15654],['Downloads', 4064]]
       * TODO: optimise loop and conditions
       */
      for (var i = 0; i < data.length; i++) {
        switch (type) {
          case 'funnel':
            newData.push([data[i].name, data[i].values[0]]);
            break;
          case 'bubble':
            newData.push({
              x: data[i].values[0],
              y: data[i].values[1],
              z: data[i].values[2],
              name: data[i].name
            });
            break;
          case 'pie':
            newData.push({
              y: data[i].values[0],
              name: data[i].name
            });
            break;
          case 'heatmap':
            newData.push([data[i][0], data[i][1], data[i][2]]);
            break;
          case 'networkgraph':
            newData.push({
              from: data[i].from,
              to: data[i].to
            });
            break;
          case 'line':
          case 'bar':
          case 'area':
            newData.push({
              name: data[i].name,
              data: JSON.parse(data[i].values)
            });
            break;
          case 'areaspline':
            newData.push({
              name: data[i].name,
              data: JSON.parse(data[i].values)
            });
            break;

          case 'column':
            newData.push({ name: data[i].name, data: data[i].values });
            break;

          default:
            console.log('please check your chart type');
        }
        if (
          type === 'line' ||
          type === 'bar' ||
          type === 'column' ||
          type === 'area' ||
          type === 'areaspline'
        ) {
          that.chartOptions.series = newData;
        } else {
          that.chartOptions.series[0].data = newData;
        }
      }
    }
  }
};
</script>
<style>
</style>

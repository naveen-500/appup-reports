<!--setting the config for every chart type and forming the query for each dashlet to get data-->
<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mydate">
      <r-header :item="item" ref="r-header-ref" :appName="appName" v-if="flag" @filterObj="filterData"></r-header>
    </div>
    <div class="row dashboard">
      <div class="col-md-12 px-0">
        <template v-if="gridFlag">
          <c-gridster :item="item" ref="gridster-ref" :appName="appName" :categoryType="categoryType" :blockParam="blockParam" :key="tabIndex"></c-gridster>
        </template>
      </div>
    </div>
    <div><pre id="csv" style="display: none"></pre></div>
  </div>
</template>
<script>
import gridster from '../reports/c-gridster';
import rheader from '../reports/r-header';
import Config from '../js/chartConfig';
import { getUrl } from '../js/preload';
export default {
  components: {
    'r-header': rheader,
    'c-gridster': gridster
  },
  // Camelcase props
  props: ['item', 'blockParam', 'appName'],
  data () {
    return {
      tabIndex: 0,
      flag: false,
      gridFlag: false,
      categoryType: '',
      url: getUrl()
    };
  },
  mounted: function () {
    this.configSetting();
  },
  methods: {
    // Event fire after forming where from r-header block
    filterData: function (data) {
      this.item = data;
      this.categoryType = data.categoryType;
      this.gridFlag = true;
      this.tabIndex++;
    },
    // Config setting for chart and table and card
    configSetting: function () {
      // Forming  the header dynmaic url
      this.item.filters.forEach(filter => {
        filter.url = filter.url.includes('https://') ? filter.url : `${this.url}${filter.url}`;
        filter.option = filter.option ? filter.option : '';
      });
      this.item.reports.forEach(report => {
        // For dynamic url custom/entity
        if (report.entity === 'custom') {
          const entityField = report.report_type === 'table' || report.report_type === 'card' ? 's/joins' : 'r/' + report.report_type;
          report.query = `${this.url}/v2/${entityField}`;
          report.query_body = JSON.parse(report.join_json).data;
        } else {
          const entityField =
            report.report_type === 'table' || report.report_type === 'card'
              ? report.entity
              : (report.report_type === 'groupbar' || report.report_type === 'hgroupbar' || report.report_type === 'groupline' || report.report_type === 'stackbar')
                ? 'r/gbar/' + report.entity
                : 'r/' + report.report_type + '/' + report.entity;
          const field = report.report_type === 'pie' || report.report_type === 'card' || report.report_type === 'table' ? 'fields' : 'field';
          report.query = report.field
            ? `${this.url}/v2/${entityField}?${field}=${report.field}`
            : `${this.url}/v2/${entityField}`;
          report.query_body = '';
        }
        // Setting config values to the charts and table and card
        if (report.report_type === 'pie') {
          report.config = Config.pie;
          report.config.chart.width = report.width;
          report.config.chart.height = report.height;
          report.config.title.text = report.title;
          report.config.series[0].name = report.series_name;
        } else if (report.report_type === 'bar' || report.report_type === 'stackbar') {
          report.config = Config.bar;
          report.config.title.text = report.title;
          report.config.chart.width = report.width;
          report.config.chart.height = report.height;
          report.xAxis.type = report.xaxis_type;
          report.xAxis.title.text = report.x_axis;
          report.xyxis.title.text = report.y_axis;
          report.config.series[0].name = report.series_name;
        } else if (report.report_type === 'line' || report.report_type === 'groupline') {
          report.config = Config.line;
          report.config.title.text = report.title;
          report.config.chart.width = report.width;
          report.config.chart.height = report.height;
          report.xAxis.type = report.xaxis_type;
          report.xAxis.title.text = report.x_axis;
          report.xyxis.title.text = report.y_axis;
        } else if (report.report_type === 'table') {
          report.config = Config.table;
          report.config.table_name = report.entity;
          report.config.collection.url = report.query;
          report.config.table_data = JSON.parse(report.table_json).table_data;
        } else if (report.report_type === 'card') {
          report.config = Config.card;
          report.config.collection.url = report.query;
          report.config.title = report.title;
        } else if (report.report_type === 'groupbar' || report.report_type === 'hgroupbar') {
          report.config = Config.groupbar;
          report.config.title.text = report.title;
          report.config.chart.width = report.width;
          report.config.chart.height = report.height;
          report.xAxis.title.text = report.x_axis;
          report.xyxis.title.text = report.y_axis;
        }
        this.flag = true;
      });
    },
  },
};
</script>

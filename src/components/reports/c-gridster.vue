<!--Rendering all the components in the grid ster component -->
<template>
  <div v-if="flag">
    <template>
      <grid-layout ref="gridlayout-ref" :layout.sync="item.reports" :col-num="12" :row-height="10" :is-draggable="true" :is-resizable="false" :vertical-compact="true" :margin="[10, 10]" :use-css-transforms="true">
        <grid-item ref="griditem-ref" v-for="(report, index) in item.reports" :x="report.x" :y="report.y" :w="report.w" :h="report.h" :i="report.i" :key="report.i" @moved="movedEvent">
          <div class="border-charts">
            <template v-if="report.report_type == 'table'">
              <component :is="table" ref="table_ref" :tablereport="item.reports[index]"></component>
            </template>
            <template v-if="report.report_type == 'pie' || report.report_type == 'line' || report.report_type == 'bar' || report.report_type == 'groupline' || report.report_type == 'groupbar' || report.report_type == 'hgroupbar' || report.report_type == 'stackbar'">
              <component :is="chart" :categoryType="categoryType" :chartreport="item.reports[index]"></component>
            </template>
            <template v-if="report.report_type == 'card' && report.custom_html == 0">
              <component :is='card' :cardreport="item.reports[index]"></component>
            </template>
            <template v-if="report.report_type == 'card' && report.custom_html == 1">
              <component :is="customCard" :cardreport="item.reports[index]"></component>
            </template>
          </div>
        </grid-item>
      </grid-layout>
    </template>
  </div>
</template>
<script>
import VueGridLayout from 'vue-grid-layout';
import cardComp from './appup-card';
import tableComp from './appup-table';
import chartComp from './appupg-chart';
export default {
  components: {
    'appup-card': cardComp,
    'appupg-chart': chartComp,
    'appup-table': tableComp,
    'grid-layout': VueGridLayout.GridLayout,
    'grid-item': VueGridLayout.GridItem,
  },
  props: ['item', 'categoryType', 'blockParam', 'appName'],
  data () {
    return {
      card: 'appup-card',
      chart: 'appupg-chart',
      table: 'appup-table',
      flag: false,
      customCard: '',
    };
  },
  mounted: function () {
    this.customCard = this.blockParam ? this.blockParam.ch : '';
    this.flag = true;
  },
  methods: {
    movedEvent: function () {
      this.updateGridster();
    },
    updateGridster: function () {
      // Setting the grid ster co-ordinates json
      const gridSterArray = [];
      this.item.reports.forEach(reportItem => {
        const coOrdinatesObj = {};
        coOrdinatesObj.x = reportItem.x;
        coOrdinatesObj.y = reportItem.y;
        coOrdinatesObj.w = reportItem.w;
        coOrdinatesObj.h = reportItem.h;
        coOrdinatesObj.i = reportItem.i;
        gridSterArray.push(coOrdinatesObj);
      });

      var obj = '';
      if (this.item.reports.grid_update === 0) {
        obj = {
          data: [
            {
              app: this.appName,
              category_id: this.item.reports[0].category_id,
              page_type: this.item.reports[0].page_type,
              gridster_json: JSON.stringify(gridSterArray),
            },
          ],
        };
        window._gd[this.appName].push(obj.data[0]);
      } else {
        obj = {
          gridster_json: JSON.stringify(gridSterArray),
        };
        window._gd[this.appName][window._gd[this.appName].findIndex(x => x.category_id === this.item.reports[0].category_id)].gridster_json = JSON.stringify(gridSterArray);
      }
      // For insert/update the grid json in portal gridster table.
      if (this.item.reports.grid_update === 0) {
        fetch(window.gridsterUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(obj),
        })
          .then(response => {
            if (response.status === 200) {
              this.item.reports.grid_update = 1;
            }
          })
          .catch(error => {
            console.error('Error:', error);
          });
      } else {
        const formData = new FormData();
        formData.append('gridster_json', JSON.stringify(gridSterArray));
        formData.append('id', window._gd[this.appName][0].id);
        fetch(window.gridsterUrl, {
          headers: { text: 'plain' },
          method: 'PUT',
          body: formData
        })
          .then(response => {
            console.log('response:', response);
          })
          .catch(error => {
            console.error('Error:', error);
          });
      }
    },
  },
};
</script>

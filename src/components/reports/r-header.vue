<!--Forming the query for each dashlet with filter condition -->
<template>
  <div class="d-flex myactfilter" v-if="filtersDisplay">
    <div v-for="(filter, filterIndex) in item.filters" v-bind:key="filterIndex">
      <appup-select
        v-if="filter.type == 'dropdown'"
        id="id"
        name="name"
        :options="filter.option ? filter.option : option"
        v-model="prefillValue[filterIndex]"
        @input="fromDropdown($event, filterIndex)"
        :url="filter.url"
        key_value="id"
        key_label="name"
        style="width:200px;margin: 0px 0px 0px 15px;"
      />
      <ac-date-range-picker
        :opens="opens"
        :show_ranges="showRanges"
        v-if="filter.type == 'calendar'"
        :epoch_format="epochFormat"
        date_format="YYYY-MM-DD"
        :date-range="filter.filter_config.dateRange"
        v-model="filter.filter_config.dateRange"
        @input="fromCalendar($event)"
      >
      </ac-date-range-picker>
    </div>
  </div>
</template>

<script>
import datePicker from '../Appup-components/ac-date-range-picker';
import dropdown from '../Appup-components/appup-select';
export default {
  components: {
    'appup-select': dropdown,
    'ac-date-range-picker': datePicker
  },
  props: ['item', 'appName'],
  data () {
    return {
      opens: 'left',
      showRanges: false,
      epochFormat: false,
      filtersDisplay: false,
      categoryType: 'days',
      dropdownData: [],
      dateArray: {
        dateRange: {
          startDate: '',
          endDate: '',
        },
      },
      finalEndDate: new Date(),
      userId: 5832,
      option: [
        {
          value: 'all',
          label: 'All',
          checked: 'true'
        },
      ],
      prefillValue: ['all', 'all', 'all'],
    };
  },
  methods: {
    configSetting: function () {
      var gridData = window._gd[this.appName].filter((i) => { return i.page_type === this.item.reports[0].page_type && i.category_id === this.item.reports[0].category_id });
      this.item.reports.forEach(reportItem => {
        // Setting the co-ordinates for grid
        if (Array.isArray(gridData) && gridData.length > 0) {
          const portalGridJson = JSON.parse(gridData[0].gridster_json);
          portalGridJson.forEach(item => {
            if (reportItem.i === item.i) {
              reportItem.x = item.x;
              reportItem.y = item.y;
              reportItem.h = item.h;
              reportItem.w = item.w;
              reportItem.i = item.i;
            }
          });
          this.item.reports.grid_update = 1;
        } else {
          this.item.reports.grid_update = 0;
        }
      });
    },
    // Convert the date format onload
    getDateTime: function (date) {
      var x = new Date(date);
      var month = x.getMonth() + 1;
      month = month < 10 ? '0' + month : month;
      var date1 = x.getDate() < 10 ? '0' + x.getDate() : x.getDate();
      return x.getFullYear() + '-' + month + '-' + date1;
    },
    // Onclicking the calender
    fromCalendar: function (e) {
      const daysDiff = (e.endDate - e.startDate) / (1000 * 3600 * 24);
      if (daysDiff <= 14) {
        this.categoryType = 'days';
      } else if (daysDiff > 14 && daysDiff <= 90) {
        this.categoryType = 'weeks';
      } else if (daysDiff > 90 && daysDiff <= 366) {
        this.categoryType = 'months';
      } else if (daysDiff > 366 && daysDiff <= 732) {
        this.categoryType = 'quarterly';
      } else {
        this.categoryType = 'years';
      }
      this.item.category_x_type = this.categoryType;
      this.item.reports.forEach((reportItem, index) => {
        this.set(index);
      });
      this.$emit('filterObj', this.item);
    },
    // On selecting the dropdown values
    fromDropdown: function (e, filterIndex) {
      this.prefillValue[filterIndex] = e;
      this.dropdownData[filterIndex] = e === 'all' ? '' : e;
      this.item.filters[filterIndex].filter_config[filterIndex] = e === 'all' ? '' : e;
      this.item.reports.forEach((reportItem, index) => {
        this.set(index);
      });
      this.$emit('filterObj', this.item);
    },
    // Function to form where condition for each reports based on category
    set: function (reportIndex) {
      var query = this.item.reports[reportIndex].query;
      let condition = '';
      this.item.reports[reportIndex].custom_check = 0;
      if (this.item.reports[reportIndex].entity === 'custom') this.item.reports[reportIndex].query_body = JSON.parse(this.item.reports[reportIndex].join_json).data;
      this.item.filters.forEach((filter, index) => {
        var c = filter.column;
        if (this.item.reports[reportIndex].entity === 'custom') {
          // Taking where fron join_json and replacing where with dynamic values.
          var whereArray = this.item.reports[reportIndex].query_body.where.split('and');
          for (var j = 0; j < whereArray.length; j++) {
            var alias = whereArray[j].split('.')[0];
            alias = alias.includes('date') ? alias.split('(')[1] : alias;
            if (filter.type === 'calendar') {
              if (whereArray[j].includes(c)) {
                condition = condition + 'date(' + alias + '.' + c + ') between ' + "'" + filter.filter_config.dateRange.startDate + "'" + ' and ' + "'" + filter.filter_config.dateRange.endDate + "'" + ' and ';
                j++;
              } else if (whereArray[j].includes('user_id')) {
                condition = condition + whereArray[j].split('=')[0] + '=' + this.userId + ' and ';
              } else if (whereArray[j].includes('member_id')) {
                condition = condition + whereArray[j].split('=')[0] + '=' + this.userId + ' and ';
              }
            } else if (filter.type === 'dropdown') {
              if (whereArray[j].includes(c) && filter.filter_config[index] !== '') {
                condition = condition + alias + '.' + c + '=' + "'" + filter.filter_config[index] + "'" + ' and ';
              } else if (whereArray[j].includes('user_id') && filter.filter_config[index] !== '') {
                condition = condition + whereArray[j].split('=')[0] + '=' + this.userId + ' and ';
              }
            }
          }
        } else {
          const column = c.includes('.') ? c.split('.')[1] : c;
          if (filter.type === 'calendar') {
            condition = condition + 'date(' + column + ') between ' + "'" + filter.filter_config.dateRange.startDate + "'" + ' and ' + "'" + filter.filter_config.dateRange.endDate + "'" + ' and ';
          } else if (filter.type === 'dropdown') {
            if (filter.filter_config[index] !== '') {
              condition = condition + column + '=' + "'" + filter.filter_config[index] + "'" + ' and ';
            }
          }

          if (this.item.reports[reportIndex].join_json && JSON.parse(this.item.reports[reportIndex].join_json).where) {
            var entityWhereArray = JSON.parse(this.item.reports[reportIndex].join_json).where.split('and');
            entityWhereArray.forEach((item, index) => {
              if (item.includes('user_id')) {
                condition = condition + item.split('=')[0] + '=' + this.userId + ' and ';
              } else if (item.includes('member_id')) {
                condition = condition + item.split('=')[0] + '=' + this.userId + ' and ';
              } else {
                condition = condition + item + ' and ';
              }
            });
          }
        }
      });
      if (this.item.reports[reportIndex].static_filter && JSON.parse(this.item.reports[reportIndex].static_filter).where) {
        condition = condition + JSON.parse(this.item.reports[reportIndex].static_filter).where + ' and ';
      }
      condition = condition.substring(0, condition.length - 4);
      if (this.item.reports[reportIndex].entity === 'custom') {
        this.item.reports[reportIndex].custom_check = 1;
        if (condition) this.item.reports[reportIndex].query_body.where = condition;
      } else {
        if (condition) {
          query = query.includes('?where=') ? query + ' and ' + condition : query.includes('&where=') ? query + ' and ' + condition : query.includes('?') ? query + '&w=' + condition : query + '?w=' + condition;
          this.item.reports[reportIndex].query_body = query;
        }
      }
      this.item.reports[reportIndex].formed_query = query;
    },

    filterConfig: function () {
      // Sort the Filters
      this.item.filters.forEach((filterItem, index) => {
        this.dropdownData[index] = '';
        if (filterItem.type === 'calendar') {
          filterItem.filter_config = JSON.parse(JSON.stringify(this.dateArray));
        }
        if (filterItem.type === 'dropdown') {
          filterItem.filter_config = JSON.parse(JSON.stringify(this.dropdownData));
        }
      });

      // Making rest call and arranging data for reports
      this.item.reports.forEach((reportItem, index) => {
        this.set(index);
      });
      this.filtersDisplay = true;
      this.item.categoryType = this.categoryType;
      this.$emit('filterObj', this.item);
    },
  },
  mounted: function () {
    this.configSetting();
    var ts = this.finalEndDate.getTime();
    var sevenDays = ts - 7 * 24 * 60 * 60 * 1000;
    this.dateArray.dateRange.startDate = this.getDateTime(new Date(sevenDays));
    this.dateArray.dateRange.endDate = this.getDateTime(this.finalEndDate);
    this.filterConfig();
  },
};
</script>

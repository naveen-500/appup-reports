<!-- mapping the dashlets data and filters data based on sort key -->
<template>
 <b-tabs v-if="flag" class="myheader mt-3" pills card v-model="tabIndex" v-bind="{
          vertical: type === 'vertical'
        }" :lazy="lazyLoad">
     <b-tab  v-for="(cat,catIndex) in data" v-bind:key="catIndex" v-bind:title="cat.name">
          <component :is="block" :blockParam="blockParam" ref="charts-ref" :appName="appName" v-bind:item="cat" v-bind:tabIndex="catIndex"></component>
     </b-tab>
</b-tabs>
</template>
<script>
import chartsPage from './r-charts-page';
export default {
  components: {
    'r-charts-page': chartsPage
  },
  props: ['filters', 'data', 'block', 'type', 'lazyLoad', 'css', 'appName', 'sortKey', 'blockParam'],
  data () {
    return {
      flag: false,
      tabIndex: 0
    };
  },
  mounted: function () {
    this.sortArray();
  },
  methods: {
    // Sorting the dashlet data based on sortKey
    sortArray: function () {
      var categories = this.data.map(responsObj => {
        return responsObj[this.sortKey];
      });
      var uniqueCategories = new Set(categories);
      var tabCategories = [...uniqueCategories];
      var categoriesArray = [];
      tabCategories.forEach((tab, i) => {
        var obj1 = {};
        obj1.name = tab;
        if (!this.filters) {
          obj1.data = this.data.filter(item => item[this.sortKey] === tab);
        } else {
          obj1.reports = this.data.filter(item => item[this.sortKey] === tab);
          obj1.filters = this.filters.filter(item => item[this.sortKey] === tab);
        }

        categoriesArray.push(obj1);
      });
      this.data = categoriesArray;
      try {
      // To get active tab index
        var tabActive = localStorage.getItem('_dti');
        if (tabActive) {
          tabActive = JSON.parse(tabActive);
          this.tabIndex = this.data[tabActive.index].name === tabActive.name && window._isRouteBack ? tabActive.index : this.tabIndex;
        }
      } catch (e) {
        // Error
      }
      localStorage.removeItem('_dti');
      window._isRouteBack = false;
      this.flag = true;
    }
  }
}
</script>

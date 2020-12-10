<!--Filter the dashlet data based on user role-->
<template>
  <div>
      <h3 class="mb-0 text-nowrap">Reports</h3>
       <c-tabs-dynamic :data="meta" :filters="filters" block="r-charts-page" type="horizantal" lazyLoad="true" css="reports-tab" sortKey="category_name" :appName="appname" v-if="flag"></c-tabs-dynamic>
  </div>
</template>
<script>
import cTabDynamic from '../reports/c-tabs-dynamic';
export default {
  components: {
    'c-tabs-dynamic': cTabDynamic
  },
  props: ['meta', 'filters', 'appname', 'customblock'],
  data () {
    return {
      userRole: 'admin',
      flag: false
    };
  },
  mounted: function () {
    debugger;
    // If user logged in we need to hide some reports to user.
    if (this.userRole === 'user') {
      var resObj = this.meta.filter(item => item.category_name.includes('My'));
      this.meta = resObj && resObj.length > 0 ? resObj : this.meta;
    }
    // Getting the gridster co-ordinates data
    if (!window._gd[this.appname]) {
      var triggerUrl = window.gridsterUrl + encodeURIComponent(`?where=app=%27${this.appname}%27`);
      fetch(triggerUrl).then(response => {
        response.json().then(data => {
          window._gd[this.appname] = data;
          this.flag = true;
        });
      });
    } else {
      this.flag = true;
    }
  }
};
</script>

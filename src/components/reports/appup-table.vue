<template>
  <div v-if="flag">
    <div class="" @mouseenter="mouseOverTable" @mouseleave="mouseLeaveTable">
      <div v-if="indexKey && tableFlag" class="float-right my-2 mr-2">
        <a @click="downloadCsv()" v-b-tooltip.hover title="Download table data" class="btn btn-outline-secondary download-button bg-transparent border-0">
          <p class="mb-0 text-primary">Download <i class="fal fa-arrow-circle-down text-primary ml-3 align-top"></i></p>
        </a>
      </div>
     <div>
      <h5 class="p-3 mb-0">{{ tablereport.title }}</h5>
      <ac-collection-table ref="term" class="recent-acitivity" :static_data="tableData" :columns="tablereport.config.table_data.columns" :show_pagination="tablereport.config.show_pagination" max_height="75%" style="height: 285px;">
         <template #empty_state>
          <div class="col-sm-8 mx-auto my-3">
            <section class="text-center border-0">
                <div class="w-100 no-records-found text-center">
                  <img class="mb-3 w-50 h-50 d-inline-block" src="https://500apps.com/images/no-data-found.svg" />
                  <h4 class="text-center text-muted d-block">No Data Found</h4>
                </div>
              </section>
          </div>
        </template>
        <template :slot='block.key' slot-scope="data" v-for="block in tablereport.config.table_data.columns">
          <component :is='block.slot'  :item="data.item" :key_value="block.key" v-if='block.slot && block.slot!="0"' :key='block'></component>
          <template v-else>{{data.item[block.key]}}</template>
        </template>
      </ac-collection-table>
       </div>
    </div>
  </div>
</template>
<script>
import acCollectionTable from '../Appup-components/ac-collection-table';
export default {
  components: {
    'ac-collection-table': acCollectionTable
  },
  props: ['tablereport'],
  data () {
    return {
      flag: false,
      indexKey: false,
      tableFlag: false,
      tableData: '',
      genericBlock: {
        search_date: 'utc-to-localdate',
        created_date: 'utc-to-localdate',
        user_id: 'v-table-userloop',
        project_name: 'v-table-apptype',
        name: 'v-table-apptype'
      }
    };
  },
  mounted: function () {
    // Get the table data (post/get)
    var scope = this;
    this.tablereport.config.table_data.columns = this.getTableSlots(this.tablereport.config.table_data.columns);
    if (this.tablereport.custom_check === 1) {
      fetch(this.tablereport.formed_query, {
        method: 'post',
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: this.tablereport.query_body,
        }),
      })
        .then(function (response) {
          return response.json();
        })
        .then(function (data) {
          scope.indexKey = data.length > 0;
          scope.tableData = data;
          scope.flag = true;
        });
    } else if (this.tablereport.custom_check === 0) {
      fetch(this.tablereport.formed_query).then(response => {
        response.json().then(data => {
          scope.indexKey = data.length > 0;
          scope.tableData = data;
          scope.flag = true;
        });
      });
    }
  },
  methods: {
    // To download the table data in csv format
    downloadCsv: function () {
      const formedQuery = 'export=true&bucket_name=appup-bucket&file_name=' + this.tablereport.config.table_name + '.csv';
      let obj = {};
      let url = {};
      if (this.tablereport.entity === 'custom') {
        url = this.tablereport.query.includes('?') ? this.tablereport.query + '&' + formedQuery : this.tablereport.query + '?' + formedQuery;
        obj = { method: 'POST', body: JSON.stringify({ data: this.tablereport.query_body }), headers: { Accept: 'application/json', 'Content-Type': 'application/json' } }
      } else {
        url = this.tablereport.query_body.includes('?') ? this.tablereport.query_body + '&' + formedQuery : this.tablereport.query_body + '?' + formedQuery;
      }
      fetch(url, obj)
        .then(res => {
          if (!res.ok) { throw new Error('HTTP status ' + res.status); }
          return res.json()
        })
        .then(response => {
          const link = document.createElement('a');
          link.download = 'default.csv';
          link.href = response.s3_url;
          link.click();
        }).catch((err) => {
          console.log(err);
        });
    },
    // Events when mouse over on table
    mouseOverTable: function () {
      this.tableFlag = true;
    },
    mouseLeaveTable: function () {
      this.tableFlag = false;
    },
    getTableSlots: function (columns) {
      const arr = Object.keys(this.genericBlock);
      columns.forEach((item, index) => {
        // eslint-disable-next-line no-unused-expressions
        if (!item.slot) { arr.includes(item.key) ? columns[index].slot = this.genericBlock[item.key] : null }
      });
      return columns;
    }

  }
};
</script>

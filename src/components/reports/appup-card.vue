<template>
<div>
    <template v-if="flag">
      <b-container>
        <div v-if="cardData && cardData.length>0" class="card border p-0 min-height-160" :class="`${titleClass}`">
           <b-card>
                <div class="d-flex align-items-center justify-content-between">
                    <template v-if="cardData[0].engagement">
                        <h2 class="mb-1">{{cardData[0].engagement}}</h2>
                    </template>
                    <template v-if="cardData[0].count">
                        <h2 class="mb-1">{{cardData[0].count}}</h2>
                    </template>
                    <template v-else>
                        <h2 class="mb-1">0</h2>
                    </template>
                </div>
                <h6 class="card-title mb-1 mt-0">{{cardreport.title}}</h6>
            </b-card>
        </div>
        <div class="col-sm-10 mx-auto my-3" v-else>
            <div class="col-sm-12">
                <section class="text-center border-0">
                    <div class="py-5">
                        <div class="w-100 text-center">
                            <img class="d-inline-block h-50 img-fluid mb-3 w-30" src="https://500apps.com/images/no-data-found.svg" />
                        </div>
                    </div>
                </section>
            </div>
        </div>
        </b-container>
        </template>
   </div>
</template>
<script>
export default {
  props: ['cardreport'],
  data () {
    return {
      cardData: '',
      flag: false,
      titleClass: ''
    };
  },
  methods: {
    getData: function () {
      var scope = this;
      // Get the card data (post/get)
      if (this.cardreport.custom_check === 1) {
        fetch(this.cardreport.formed_query, {
          method: 'post',
          headers: {
            Accept: 'application/json, text/plain, */*',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            data: this.cardreport.query_body,
          }),
        })
          .then(function (response) {
            return response.json();
          })
          .then(function (data) {
            scope.cardData = data;
            scope.flag = true;
          });
      } else if (this.cardreport.custom_check === 0) {
        fetch(this.cardreport.formed_query).then(response => {
          response.json().then(data => {
            scope.cardData = data;
            scope.flag = true;
          });
        });
      }
    },
  },
  mounted: function () {
    this.getData();
    this.titleClass = this.cardreport.title.toLowerCase();
    this.titleClass = this.titleClass.split(' ').join('_');
  },
};
</script>

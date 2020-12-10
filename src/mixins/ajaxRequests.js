const _forOwn = require('lodash.forown');

/**
 * @mixin
 */
export const AjaxRequests = {
  methods: {

    /**
         *
         * @param {url} url
         * @param {config object} config
         * @param {Call back function} callback
         */
    getData (url, config, callback, error) {
      console.log('===> Datatable :: getData ' + url + ' ' + JSON.stringify(config));

      const data = new FormData();

      // Loop through config object and set them to formdata
      if (config) {
        _forOwn(config, function (value, key) {
          data.append(key, value);
        });
      }

      this.$http.get(url, {
        params: config
      })
        .then(response => {
          if (callback) {
            callback(response.data);
          }
        }, response => {
          if (error) {
            error(response);
          }
        });
    },
    postData (url, data, callback, error) {
      console.log('===> Datatable :: POST ' + url + ' ' + JSON.stringify(data));

      this.$http.post(url, data)
        .then(response => {
          if (callback) {
            callback(response.data);
          }
        }, response => {
          if (error) {
            error(response);
          }
        });
    },

    /**
         *
         * @param {url} url
         * @param {config object} config
         * @param {Call back function} callback
         */
    getDropdownData (url, config, callback) {
      console.log('===> Dropdown :: getData');

      const data = new FormData();

      // Loop through config object and set them to formdata
      _forOwn(config, function (value, key) {
        data.append(key, value);
      });

      // Data.append('pageSize', config.pageSize);
      // Data.append('pageNo', config.pageNo)a;

      this.$http.get(url, {
        params: config
      })
        .then(response => {
          if (callback) {
            callback(response);
          }
        });
    },
  }
};

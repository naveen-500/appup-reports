/**
 * @mixin
 *
 * Conversions specific to data that should be send to components or receive from components
 */
export const Conversions = {
  methods: {
    /**
         * @param {options} options
         *
         * Appup Options will be array of objects with Label & Value
         *
         * These should be converted to Text & Value when feeding to bootstrap-vue components
         * such as dropdown, radio group & checkbox group components
         */
    convert_Options_To_BootstrapVue_Options: function (options) {
      var bootstrapOptions = [];
      if (options && options.length > 0) {
        options.forEach(function (value, key) {
          bootstrapOptions.push({
            text: value.label,
            value: value.value,
            disabled: value.disabled ? value.disabled === 'false' ? false : value.disabled : value.disabled,
            checked: value.checked ? JSON.parse(value.checked) : false
          });
        });
      }

      return bootstrapOptions;
    },

    /**
         * @param {Array} data
         * @param {String} keyValue
         * @param {String} keyLabel
         *
         * data will be array of objects which is received from database
         * It takes keyValue as options value and keyLabel as options text
         *
         * These should be converted to Text & Value when feeding to bootstrap-vue components
         * such as dropdown, multiselect components
         */

    convert_Dynamic_Options_To_BootstrapVue_Options: function (data, keyValue, keyLabel) {
      var bootstrapOptions = [];
      if (data && data.length > 0) {
        data.forEach(function (val, key) {
          bootstrapOptions.push({
            text: val[keyLabel],
            value: val[keyValue],
            checked: val.checked ? JSON.parse(val.checked) : false,
            disabled: val.disabled ? val.disabled : null
          });
        });
      }
      return bootstrapOptions;
    },
    /**
         * Extracts selected/checked values from options of
         * checkboxes or radios or select field
         * Works with Appup form json schema
         * Set type=multiple to return Array
         * @param {Array} options
         * @param {String} type
         */
    setDefaultValues: function (options, type = 'single') {
      if (options) {
        const selectedOptions = [];
        for (var i = 0, len = options.length; i < len; i++) {
          if (options[i].checked || options[i].selected) {
            selectedOptions.push(options[i].value);
          }
        }
        if (type === 'multiple') {
          return selectedOptions;
        } else {
          return (selectedOptions[0]) ? selectedOptions[0] : '';
        }
      }
    },
    /**
         * Extracts selected/checked values from options for multiselect and tags
         * @param {Array} options
         * @return {Array} selectedObjects -Array of selected items
         */
    set_default_values_multiselect: async function (options) {
      const selectedObjects = [];
      for (var i = 0, len = options.length; i < len; i++) {
        if (options[i].checked || options[i].selected) {
          selectedObjects.push(options[i]);
        }
      }
      return selectedObjects;
    },
    convert_Options_To_Multiselect_Options: function (options) {
      var bootstrapOptions = [];
      if (options && options.length > 0) {
        options.forEach(function (value, key) {
          bootstrapOptions.push({
            text: value.label,
            value: value.value,
            checked: value.checked ? JSON.parse(value.checked) : false,
            $isDisabled: value.disabled
          });
        });
      }

      return bootstrapOptions;
    }

  }
};

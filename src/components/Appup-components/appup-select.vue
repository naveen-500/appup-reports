<template>
  <div :id="id" class="d-flex new-custom-dd">
    <b-dropdown
      variant="outline-transparent"
      :disabled="disabled"
      class="border-0 rounded my-class"
    >
      <!--display button content i.e selected value's label -->
      <template v-slot:button-content>
        <span class="form-control custom-select">{{selectedLabel}}</span>
      </template>
      <div class="scrollbar">
        <!--Input field for searching values -->
        <b-form-input
          v-if="dropdownItems.length > 25"
          v-model="search"
          placeholder="Search here..."
        ></b-form-input>
        <img
          v-if="loader && url"
          src="https://cmswebsites.s3.us-west-1.amazonaws.com/Dual%20Ring-0.9s-200px.gif"
        />
        <b-dropdown-item
          v-for="(item,index) in Modified_JSON_data"
          :key="index"
          :value="item.value"
          :disabled="item.disabled"
          :active="selected == item.value ? true : false"
          @click="onSelect(item)"
        >
         <div>
            <div class="blank-img">
              <img v-if="item.logo" :src="item.logo" :height="logo_height" :width="logo_width" />
            </div>
            <div>{{item.text  | capitalize}}
            </div>
         </div>
        </b-dropdown-item>
        <!--If we dnt have items on search key -->
        <p
          v-if="Modified_JSON_data.length == 0 && !loader"
          class="m-0 text-center text-muted"
        >No Search Results Found</p>
      </div>
    </b-dropdown>
    <i class="fal fa-redo-alt m-2" v-if="refresh_icon && url" @click="fetch_url_data"></i>
  </div>
</template>
<script>
import { AjaxRequests } from '../../mixins/ajaxRequests';
import { Conversions } from '../../mixins/conversions';
// eslint-disable-next-line no-unused-vars
import axios from 'axios';
// Handlebars
import Handlebars from 'handlebars/dist/handlebars.js';
/**
 * Appup Dropdown to load static options or dynamic options from API call
 *
 * TODOs:
 *
 * Dynamic Options from API call
 */
export default {
  name: 'appup-select',
  Mixins: [AjaxRequests, Conversions],
  components: {},
  props: {
    /**
     * Id of input elements.
     */
    id: {
      type: String,
      required: false
    },
    name: {
      type: String,
      required: false
    },
    /**
     * Options that should be displayed in the dropdown
     *
     * Array should include objects with label & value properties
     */
    options: {
      type: Array,
      required: false
    },
    /**
     * Option to disable the dropdown
     */
    disabled: {
      type: Boolean,
      required: false
    },
    /**
     * Validation state of the component
     */
    state: {
      type: Boolean,
      required: false,
      default: null
    },
    /**
     * Value for v-model binding. Not to be binded directly
     */
    value: {
      required: false
    },
    /**
     * Url from which data should be populated in dropdown
     */
    url: {
      type: String,
      required: false
    },
    key_value: {
      type: String,
      required: false
    },
    key_label: {
      type: String,
      required: false
    },
    /**
     * Flag to check type of add element or valid the value.
     *
     * `true, false`
     */
    addElement: {
      type: Boolean,
      required: false,
      default: false
    },
    placeholder: {
      type: String,
      required: false,
      default: 'Please select an option',
    },
    // Use to re render the component
    re_render_key: {
      type: Number,
      default: 0
    },
    // When clicked it will fetch data from api again
    refresh_icon: {
      type: Boolean,
      required: false,
      default: false
    },
    // Height of logo
    logo_height: {
      type: String,
      required: false,
      default: '25px',
    },
    // Width of logo
    logo_width: {
      type: String,
      required: false,
      default: '25px',
    },
  },
  computed: {
    Modified_JSON_data: function () {
      var searchedData = [];
      // If search length - filters the items and returns to dropdown
      if (this.search.length > 0) {
        searchedData = this.dropdownItems.filter(
          (opt) =>
            opt.text.toLowerCase().indexOf(this.search.trim().toLowerCase()) >
            -1
        );
      } else { // Else returns the dropdown items to dropdown
        searchedData = this.dropdownItems;
      }
      return searchedData;
    },
  },
  filters: {
    capitalize: function (label) {
      return label.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
    }
  },
  watch: {
    options (val) {
      this.getData();
    },
    value (newVal, oldVal) {
      this.selected = newVal;
      this.get_selected_label();
    },
    url (val) {
      console.log('in url watcher');
      if (val) {
        var template = Handlebars.compile(this.url);
        // Compile and assign to this.compileUrl
        let compileData = {};
        compileData = {
          ...window.UIJSON,
          ...this.$route.params,
          ...window.APPUP
        };
        this.compileUrl = template(compileData);
      }
      this.getData();
    }
  },
  data: function () {
    return {
      dropdownItems: [],
      loader: true,
      selected: this.value,
      compileUrl: null,
      search: '',
      selectedLabel: this.placeholder
    };
  },
  created: function () {
    // Compile based on router context
    if (this.url) {
      this.compile_data();
    }
    // Convert options to b-form-select specific
    this.getData();
    if (this.value) {
      this.selected = this.value;
    } else {
      // Set default values
      this.selected = this.setDefaultValues(this.options);
    }
  },
  methods: {
    onSelect (selected) {
      this.search = '';
      this.$emit('change', { value: selected.value, item: selected });
      this.$emit('input', selected.value);
      this.selectedLabel = selected.text;
      if (this.addElement) {
        this.dropdownItems.forEach(element => {
          if (element.value === selected.value) {
            this.$emit('dropdownChange', element, selected.value, 'dropdown');
          }
        });
      }
    },
    compile_data () {
      var template = Handlebars.compile(this.url);
      // Compile and assign back to this.url
      let compileData = {};
      compileData = {
        ...window.UIJSON,
        ...this.$route.params,
        ...window.APPUP
      };
      this.compileUrl = template(compileData);
    },
    // To show the selected label in button content slot
    get_selected_label: function () {
      for (var key in this.dropdownItems) {
        if (
          // eslint-disable-next-line eqeqeq
          (this.selected && this.selected == this.dropdownItems[key].value) ||
          (!this.selected && this.dropdownItems[key].value == null)
        ) {
          this.selectedLabel = this.dropdownItems[key].text;
          break;
        } else {
          this.selectedLabel = '';
        }
      }
    },
    fetch_url_data: function () {
      this.compile_data();
      this.getData();
    },
    // Convert given data to bootstrap vue options format
    convert_BootstrapVue_Options: function (data, keyValue, keyLabel) {
      var bootstrapOptions = [];
      if (data && data.length > 0) {
        data.forEach(function (val, key) {
          bootstrapOptions.push({
            text: val[keyLabel],
            value: val[keyValue],
            logo: val.logo,
            disabled: val.disabled ? val.disabled : null,
          });
        });
      }
      return bootstrapOptions;
    },
    getData () {
      if (this.compileUrl) {
        var that = this;
        this.$appupajax
          .get2(
            this.compileUrl,
            {},
            {},
            { withCredentials: true, credentials: 'include' }
          )
          .then(that.$appupajax.handleResponse)
          .then(response => {
            that.dropdownItems = that.convert_BootstrapVue_Options(
              response.data,
              that.key_value,
              that.key_label
            );
            that.loader = false;
            if (that.options && that.options.length > 0) {
              that.dropdownItems = that.dropdownItems = that
                .convert_BootstrapVue_Options(that.options, 'value', 'label')
                .concat(that.dropdownItems);
              that.selected = that.setDefaultValues(that.options);
            }
            // Set value after dropdown loaded
            if (that.value) {
              that.selected = that.value;
              that.get_selected_label();
            }
          });
      } else {
        if (this.options && this.options.length > 0) {
          this.dropdownItems = this.convert_BootstrapVue_Options(
            this.options,
            'value',
            'label'
          );
        }
        // Set value after dropdown loaded
        if (this.value) {
          this.selected = this.value;
          this.get_selected_label();
        }
      }
    }
  }
};
</script>
<style scoped>
.appup-dropdown {
  cursor: pointer !important;
}
.scrollbar {
  overflow-y: scroll;
  max-height: 400px;
}
.blank-img {
  float: left;
  width: 25px;
  min-height: 25px;
  margin-right: 8px;
}
</style>

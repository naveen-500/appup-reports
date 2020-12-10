<template>
  <div>
    <b-dropdown
      class="ac-material-dropdown"
      :variant="button_options.variant"
      v-bind="button_options"
      :right="right"
      :no-caret="noCaret"
    >
      <!-- Toggle button content -->
      <template slot="button-content">
        <!-- use this slot for button content -->
        <slot name="button-content" :data="button_options">
          <i v-if="options_Json" :class="options_Json.icon"></i>
          <i v-if="button_options.icon" :class="button_options.icon"></i>
          <span v-if="button_options.label">{{ showlabel }}</span>
        </slot>
      </template>
      <!--
      List of dropdown options.
      On options click calls handler from option
      -->
      <b-dropdown-item v-for="item in options_Json" :key="item.key" @click="on_item_click(item)">
        <b-dropdown-divider v-if="item.divider"></b-dropdown-divider>
        <template v-else>
          <i :class="item.icon" class="mr-3" v-if="show_icon" />
          <span v-if="item.key">
            <slot :name="item.key" :data="from_data"></slot>
          </span>
          <span v-else>{{ item.label }}</span>
        </template>
      </b-dropdown-item>
    </b-dropdown>
  </div>
</template>
<script>
// Import axios from "axios";
/**
 * Ac Material Dropdown component
 * @requires VueBootstrap
 */
export default {
  name: 'ac-material-dropdown',
  props: {
    /**
     * List options for dropdown
     * @param {object} options - Options for dropdown menu for each row
     * @properties {"label": {"type": "String"}, "type": {"type": "String"}, "icon": {"type": "String"},"key":{"type": "String"}, "__slot__": {"type": "String"},
       "inside_grid": {
           "name":"handler_options",
           "handler_name":{"type": "String"},
           "handler_params":{"type": "String"}
           }}
     * @label Options
     * @category_name 2_Data
     */
    options: {
      type: Array,
      required: false
    },
    /**
     * Url to fetch options
     * @param { String } -url
     * @category_name 1_General
     */
    url: {
      type: String,
      required: false
    },
    /**
     * Base_url
     * @param {string} base_url
     * @label Base URL
     * @category_name 1_General
     */
    base_url: {
      type: String,
      required: false
    },
    /**
     * Button content
     * @param {object} button_options
     * @category_name 2_Data
     * @properties
        {
          "icon": {"type": "String", "default": "fas fa-ellipsis-v"},
          "label": {"type": "String"},
          "variant": {"type": "String", "default": "outline-secondary", "values": ["primary", "secondary", "success", "danger", "warning", "info", "light", "dark", "outline-primary", "outline-secondary", "outline-success", "outline-danger", "outline-warning", "outline-info", "outline-light", "outline-dark"]},
          "size": {"type": "String", "default": "sm", "values": ["sm", "md", "lg"]}
        }
     * @label Button Options
     */
    button_options: {
      type: Object,
      required: true
    },
    /**
     * Alignment of dropdown menu.
     * @param {boolean} right
     * If false - left, if true - right
     * @category_name 3_Advanced
     */
    right: {
      type: Boolean,
      default: false
    },
    /**
     * Enable or disable icon
     * @param {Boolean} -show_icon
     * @category_name 2_Data
     */
    show_icon: {
      type: Boolean,
      default: false
    },
    /**
     * Preload handler
     * @param {string} -preload
     * @category_name 2_Data
     */
    preload: {
      type: String,
      required: false
    },
    /**
     * Handler params for preload
     * @param {String} -handler_params
     * @category_name 2_Data
     */
    handler_params: {
      type: String,
      required: false
    },
    /**
     * It Enable itemclick event will be fire
     * @param {Boolean} -showCustom
     */
    showItemclick: {
      type: Boolean,
      required: false,
      default: true
    },
    /**
     *Gets the data from collection-table
     * @private
     */
    from_data: {
      type: Object,
      required: false
    }
  },
  data: function () {
    return {
      options_Json: [],
      noCaret: true,
      params: {}
    };
  },
  computed: {
    showlabel () {
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      this.noCaret = false;
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      this.variant = 'bg-transparent';
      return this.button_options.label;
    }
  },
  watch: {
    options (newVal) {
      this.set_data();
    },
    url (newval) {
      this.set_data();
    }
  },
  created () {
    this.set_data();
  },
  mounted () {
    /**
     * Triggers preload handler
     */
    if (this.$vnode.data.props) {
      this.params = this.$vnode.data.props.params;
    }
    if (this.preload) {
      this.start(this.preload, {
        helper: {
          component: this,
          custom: this.handler_params ? this.handler_params : {},
          helperParams: this.params ? this.params : {}
        }
      });
    }
  },
  methods: {
    /**
     * Triggers on dropdown option click
     * @param {Object} item - Data of clicked dropdown item
     */
    on_item_click (item) {
      // Executes multi handlers functionality
      // If (item.handler_name) {
      if (item.handler_options && item.handler_options.length) {
        var handlersArray = [];
        item.handler_options.forEach(element => {
          const handlerObject = {};
          handlerObject.name = element.handler_name;
          if (element.handler_params) {
            let custom = {};
            try {
              if (typeof element.handler_params === 'object') {
                custom = element.handler_params;
              } else {
                custom = JSON.parse(element.handler_params);
              }
            } catch (error) {
              custom = {};
            }
            handlerObject.params = {
              helper: {
                component: this,
                custom: custom || {},
                item: item,
                helperParams: this.params ? this.params : {}
              }
            };
          }
          // Forming array of objects
          handlersArray.push(handlerObject);
        });
        this.start(handlersArray);
      } else if (item.handler_name) {
        this.start(item.handler_name, {
          helper: {
            component: this,
            item: item,
            helperParams: this.params ? this.params : {}
          }
        });
        console.log('we call handler here ', { component: this, item: item });
      } else {
        this.item_clicked(item);
      }
    },
    /**
     * Emits event
     */
    item_clicked: function (data) {
      this.$emit('item_click', data);
    },
    /**
     * Fetch data from the url if exists and sets to component
     */
    set_data: function () {
      if (this.url) {
        // Axios
        //   .get(this.url, { withCredentials: true, credentials: "include" })
        //   .then(response => {
        //     This.options_Json = response.data;
        //   })
        //   .catch(error => {
        //     Console.log(error);
        //   });
        this.$appupajax
          .get2(
            this.url,
            {},
            {},
            { withCredentials: true, credentials: 'include' }
          )
          // This.$appupajax.get2(this.url, {}, { withCredentials: true, credentials: "include" }).
          .then(this.$appupajax.handleResponse)
          .then(response => {
            this.options_Json = response.data;
          })
          .catch(error => {
            console.log(error);
          });
      } else {
        this.options_Json = this.options;
      }
    }
  }
};
</script>

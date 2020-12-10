<template>
  <div class="ac-collection-table">
    <template v-if="is_custom_header">
      <ac-collection-table-custom-headers :right="align_custom_header_right"></ac-collection-table-custom-headers>
    </template>
    <header class="ac-collection-table-header">
      <!-- Use this slot for table header -->
      <slot name="header"></slot>
    </header>

    <!-- Show searchbar -->
    <template v-if="show_searchbar">
      <b-input-group class="w-25 float-right mb-3">
        <b-input v-model="search_value" :placeholder="searchbar_placeholder" @keyup.enter="search_results()" @keyup.delete="search_results()" />
        <b-input-group-append is-text class="search-symbol cursor-pointer" v-b-tooltip.hover title="Search">
          <i class="fal fa-search" @click="on_input"></i>
        </b-input-group-append>
      </b-input-group>
    </template>
    <div v-if="actual_data && actual_data.length">
      <!-- ref: https://bootstrap-vue.js.org/docs/components/table/ -->

      <!-- use this slot to display data on top of table, like table caption-->
      <div v-if="pagination_type !== 'deselect'">
        <slot name="caption" :loaded_data_count="loaded_data_count" :total_count="total_count"></slot>
      </div>
      <b-table
        outlined
        responsive
        :sticky-header="sticky_header == 'true' ? true : false"
        :no-local-sorting="server_sort_type"
        :items="actual_data"
        :fields="table_columns"
        @sort-changed="server_sort_type ? sortingChanged($event) : ''"
        @row-clicked="row_clicked"
        @row-dblclicked="$emit('row-dblclicked', $event)"
        :class="height"
        @scroll.native="infiniteScroll"
        :style="scroll_style"
        v-sortable="sortableOptions"
      >
        <!-- Checkbox template. Only shown when bulk property is true -->

        <template v-if="bulk" slot="HEAD_#">
          <b-form-checkbox class="cursor-pointer" v-model="select_all" @change="bulk_actions($event)" />
        </template>

        <template slot="HEAD_options">
          <!-- Use this slot for options head -->
          <slot name="actions_slot"></slot>
        </template>

        <template slot="#" slot-scope="actual_data">
          <div>
            <b-form-checkbox class="cursor-pointer" v-model="selected" :value="actual_data.item" @change.native="checkbox_click(actual_data.item)" />
          </div>
        </template>

        <!-- ref: https://stackoverflow.com/questions/51418781/pass-row-templates-to-vue-boostrap-table-from-parent-component-using-slots -->
        <template :slot="slot.key" slot-scope="row" v-for="slot in table_columns">
          <slot :name="slot.key" :item="row.item">{{ row.item[slot.key] }}</slot>
        </template>

        <!--
        Dropdown template. Only shown when dropdown property is true
        and prop dropdown_options.options is present
        -->

        <template slot="options" slot-scope="actual_data">
          <!-- Use this slot for Options-->
          <slot name="option" :data="actual_data">
            <div>
              <ac-material-dropdown
                :options="dropdown_options_handler"
                :button_options="dropdown_button_options"
                :right="dropdown_button_options.right"
                @item_click="on_dropdown_item_click($event, actual_data.item, actual_data.index)"
                :show_icon="show_dropdown_icons"
                :from_data="actual_data.item"
              >
                <!-- renders slot for material dropdown -->
                <template :slot="dropdown.key" slot-scope="data" v-for="dropdown in dropdown_options_handler">
                  <slot :name="dropdown.key" :item="data.data"></slot>
                </template>
              </ac-material-dropdown>
            </div>
          </slot>
        </template>
        <!-- Optional one to show when action object is present -->
        <template slot="actions" slot-scope="actual_data">
          <div>
            <ac-material-dropdown
              :options="dropdown_options_handler"
              :button_options="dropdown_button_options"
              :right="dropdown_button_options.right"
              @item_click="on_dropdown_item_click($event, actual_data.item, actual_data.index)"
              :show_icon="show_dropdown_icons"
              :from_data="actual_data.item"
            >
              <!-- renders slot for material dropdown -->
              <template :slot="dropdown.key" slot-scope="data" v-for="dropdown in dropdown_options_handler">
                <slot :name="dropdown.key" :item="data.data"></slot>
              </template>
            </ac-material-dropdown>
          </div>
        </template>
      </b-table>
      <div v-if="loadmore_icon" class="text-center">
        <img src="https://cdn.500apps.io/images/icons/loadmore.gif" class="loader__image m-auto" alt="loading" />
      </div>
      <!-- pagination option -->
      <template v-if="pagination_type === 'pagination'">
        <div class="overflow-auto my-3">
          <!-- Use text in props -->
          <b-pagination
            v-model="page_number"
            align="right"
            :total-rows="total_count"
            :per-page="limit"
            first-text="First"
            prev-text="Prev"
            next-text="Next"
            last-text="Last"
            @input="pageclick_event == true ? $emit('pageclick-event', page_number) : pagenumber_click(page_number)"
          ></b-pagination>
        </div>
      </template>
    </div>

    <div v-if="actual_data && !actual_data.length && data_loaded == true && is_loading == false">
      <!-- Use this slot for Empty State -->
      <slot name="empty_state"></slot>
    </div>
    <!-- loader image -->
    <div v-show="is_loading == true && loading_icon == true" class="loader row">
      <!--onError is to handle the broken image of loader -->
      <img :src="loading_image" class="loader__image m-auto" alt="loader" />
    </div>

    <div v-show="load_more_type === 'loadMoreButton'" v-if="pagination_type === 'loadMore' && actual_data && actual_data.length" ref="loader_div" class="load-more text-center">
      <!--
          Use this slot for load more button, shown only if load_more_type is 'loadMoreButton'
          and there is more data to fetch
      -->
      <slot name="load_more_button">
        <button type="button" class="btn btn-link" :class="page_number >= load_option ? 'd-none' : ''" @click="loadmore_click_fun()">Load More...</button>
      </slot>
    </div>

    <footer class="ac__footer">
      <!-- Use this slot for footer -->
      <slot name="footer"></slot>
    </footer>
  </div>
</template>

<script>
// Import acCollection from "./ac-collection.vue";
import AppData from '../../mixins/ac-data';
import AppPreload from '../../mixins/ac-preload';
import Sortable from 'sortablejs';
import MaterialDropdown from './ac-material-dropdown'

/**
 * Ac Table component which can be used to display data from API in table view
 * @requires VueBootstrap
 * @requires ac-data.js,ac-preload.js
 * @requires ac-material-dropdown.vue
 *
 * Fires event on row click and row double click
 * @event row_clicked
 * @event row_dblclicked
 * @type {object} row data
 *
 * @type {object} row data
 *
 * @inherits ac-data,ac-preload
 *
 */

export default {
  name: 'ac-collection-table',
  components: {
    'ac-material-dropdown': MaterialDropdown
  },
  mixins: [AppData, AppPreload],
  props: {
    /**
     * Will statis data instead from url
     * @label Data
     * @category_name 1_General
     */
    static_data: {
      type: Array,
      required: false,
      default: () => [],
    },
    /**
     * List of table columns.
     * @param {array} columns
     * @properties {"label": {"type": "String","description":"Give label name of table header"}, "key": {"type": "String","description":"Give key name from the data"}, "sortable": {"type": "Boolean","description":"Give true or false for sort option"}, "__slot__": {"type": "String","description":"write HTML code and data-scope:item"}}
     * @label Columns
     * @category_name 1_General
     */
    columns: {
      type: Array,
      required: true,
    },

    /**
     * Whenever true show checkbox in the first column
     * @param {boolean} bulk
     * @label Bulk
     * @category_name 1_General
     */
    bulk: {
      type: Boolean,
      default: false,
    },

    /**
     * Whenever true show dropdown in the last column
     * @param {boolean} dropdown
     * @label Dropdown
     * @category_name 1_General
     */
    dropdown: {
      type: Boolean,
      default: false,
    },
    /**
     * Default is client, select based on your sorting requirement
     * @param {string} sorting
     * @properties {"label":"Sort", "type": "List", "default": "client", "values": [client", "server"]}
     * @default "client"
     * 'client, server'
     * @label Sort
     * @category_name 3_Advanced
     */
    sorting: {
      type: String,
      default: 'client',
      validator: value => ['client', 'server'].indexOf(value) !== -1,
    },

    /**
     * Provide the server sort key e.g order_by
     * @param {string} searchbar server_sort_key
     * @label Server Sort Key
     * @category_name 3_Advanced
     */
    server_sort_key: {
      type: String,
    },
    /**
     * Provide the sort type key e.g order_by_type
     * @param {string} searchbar server_sort_key_type
     * @label Server Sort key Type
     * @category_name 3_Advanced
     */
    server_sort_key_type: {
      type: String,
    },

    /**
     * If true - display dropdown options icon
     * @param {boolean} show_dropdown_icons
     * @label Show Dropdown Icons
     * @category_name 1_General
     */
    show_dropdown_icons: {
      type: Boolean,
      default: false,
    },

    /**
     * Options for dropdown menu for each row
     * @param {Array} dropdown_options
     * @properties {"label": {"type": "String","description":"Give label name of option"}, "type": {"type": "String","description":"Type of the option Eg:edit,submit..etc"}, "icon": {"type": "String","description":"Give icon class for option"},"key":{"type": "String"}, "__slot__": {"type": "String"},
       "inside_grid": {
           "name":"options",
           "handler_name":{"type": "String"},
           "handler_params":{"type": "String"}
           }}
     * @label Dropdown Options
     * @category_name 1_General
     */
    dropdown_options: {
      type: Array,
      required: false,
    },

    /**
     * Dropdown Button Options is a object with keys icon, variant, size, right. It shows three dots based upon icon in each row
     * @param {object} dropdown_button_options
     * @properties
        {
          "icon": {"type": "String", "default": "fas fa-ellipsis-v","description":"Give button icon class"},
          "variant": {"type": "String", "default": "outline-secondary", "description":"Give variant class for button", "values": ["primary", "secondary", "success", "danger", "warning", "info", "light", "dark", "outline-primary", "outline-secondary", "outline-success", "outline-danger", "outline-warning", "outline-info", "outline-light", "outline-dark"]},
          "size": {"type": "String", "default": "sm", "description":"Give size of the button Eg:sm,lg,md", "values": ["sm", "md", "lg"]},
          "right": {"type": "Boolean", "default": "true", "description":"To display dropdown options right or left"}
        }
      * @label Dropdown Button Options
      * @category_name 1_General
     */
    dropdown_button_options: {
      type: Object,
      required: false,
    },

    /**
     * Whenever true show searchbar above the collection table
     * @param {boolean} search bar
     * @label Show Searchbar
     * @category_name 3_Advanced
     */
    show_searchbar: {
      type: Boolean,
      default: false,
    },

    /**
     * To change default place holder
     * @param {string} searchbar placeholder
     * @label Searchbar Placeholder
     * @category_name 3_Advanced
     */
    searchbar_placeholder: {
      type: String,
      default: 'Search',
    },

    /**
     * Indicates based on what key search should be performed
     * @param {String} search key
     * @label Search Key
     * @category_name 3_Advanced
     */
    search_key: {
      type: String,
      required: false,
    },
    /**
     * Type of pagination
     * @param {string} pagination_type
     * @properties {"label":"Pagination Type", "type": "List", "default": "deselect", "values": ["deselect","pagination", "loadMore","scroll"]}
     * @default "deselect"
     * 'deselect, pagination, loadMore'
     * @label Pagination Type
     * @category_name 3_Advanced
     */
    pagination_type: {
      type: String,
      default: 'deselect',
      validator: value => ['deselect', 'pagination', 'loadMore', 'scroll'].indexOf(value) !== -1,
    },

    /**
     * Type of loading more information
     * @param {string} load_more_type
     * @properties {"label":"Load More Type", "type": "List", "default": "deselect", "values": ["deselect","loadMoreButton", "infiniScroll"]}
     * @default loadMoreButton
     * 'loadMoreButton, infiniScroll'
     * @label Load More Type
     * @category_name 3_Advanced
     */
    load_more_type: {
      type: String,
      default: 'loadMoreButton',
      validator: value => ['deselect', 'loadMoreButton', 'infiniScroll'].indexOf(value) !== -1,
    },
    /**
     * Fetch data count with given url
     * @param {string} data_count_url
     * @label Data Count Url
     * @category_name 3_Advanced
     */
    data_count_url: {
      type: String,
      required: false,
    },

    /**
     * This key will be used to get count from data_count_url
     * @param {string} count_key
     * @label Count Key
     * @category_name 3_Advanced
     */
    count_key: {
      type: String,
      required: false,
    },
    /**
     * Whenever true page click event will be executed
     * @param {boolean} pageclick_event
     * @label Page Click Event
     * @category_name 3_Advanced
     */
    pageclick_event: {
      type: Boolean,
      default: false,
    },

    /**
     * Whenever true show pagination buttons below the collection table
     * @param {boolean} pagination buttons
     * @label Show Pagination
     * @category_name 3_Advanced
     * @private
     */
    show_pagination: {
      type: Boolean,
      default: false,
    },

    /**
     * When pagination is true displays the rows based on limit
     * @param {Number} limit
     * @label Limit
     * @category_name 3_Advanced
     * @private
     */
    limit: {
      type: Number,
      required: false,
    },

    /**
     * When Pagination Type is true give total count of data for loading with limit
     * @param {Number} total_count
     * @label Total Count
     * @category_name 3_Advanced
     */
    total_count: {
      type: Number,
      required: false,
      default: 0,
    },

    /**
     * When pagination is true limit should apply for which key in ac_cursor
     * @param {Number} limit_key
     * @label Limit Key
     * @category_name 3_Advanced
     * @private
     */
    limit_key: {
      type: String,
      required: false,
    },

    /**
     * When pagination is true offset should apply for which key in ac_cursor
     * @param {Number} offset_key
     * @label Offset Key
     * @category_name 3_Advanced
     * @private
     */
    offset_key: {
      type: String,
      required: false,
    },
    /**
     * Only show when dropdown is true - default is options
     * @param {String} option_label key
     * @label Option Label
     * @category_name 1_General
     */
    option_label: {
      type: String,
      required: false,
      default: 'options',
    },
    /**
     * Only show when custom header is needed - default is false
     * @param {String} is_custom_header key
     * @label Custom Header
     * @category_name 1_General
     */
    is_custom_header: {
      type: Boolean,
      default: false,
    },
    /**
     * If true displays dropdown to right side
     * @param {String} align_custom_header_right key
     * @label Custom Header Align Right
     * @category_name 1_General
     */
    align_custom_header_right: {
      type: Boolean,
      default: false,
    },
    /**
     * If true displays loader image
     * @param {string} is_loading
     * @label Display Loader
     * @category_name 4_Style
     */
    is_loading: {
      type: Boolean,
      required: false,
      default: false,
    },
    /**
     * Image to show while loading data
     * @param {string} loading_image
     * @label Loading Image
     * @category_name 4_Style
     */
    loading_image: {
      type: String,
      default: 'https://cdn.500apps.io/images/icons/infinity-loading.png',
    },
    /**
     * Height class for scrolling
     * @param {String} height_class
     * @label Height Class
     * @category_name 4_Style
     */
    height_class: {
      type: String,
      required: false,
    },
    /**
     * Append this class to row on click of checkbox
     * @param {String} checkbox_click_class
     * @label Checkbox Click Class
     * @category_name 4_Style
     */
    checkbox_click_class: {
      type: String,
      required: false,
    },
    /**
     * Style for sroll bar eg:{"over-flow" : "auto","max-height" : "350px"}
     * @param {Object} scroll_style
     * @label Scroll Style
     * @category_name 4_Style
     */
    scroll_style: {
      type: Object,
      required: false,
    },
    /**
     * Max height of component
     * @param {string} max_height
     * @label Maximum Height
     * @category_name 4_Style
     */
    max_height: {
      type: String,
      required: false,
      default: '100%',
    },
    /**
     * Freeze the header
     * @param {string} sticky_header
     * @label Sticky Header
     * @category_name 4_Style
     */
    sticky_header: {
      type: Boolean,
      required: false,
      default: false,
    },
  },

  data () {
    return {
      selected: [],
      actual_data: [],
      select_all: false,
      current_item: null,
      search_value: '',
      stored_data: [],
      offset: 0,
      page_number: 0,
      custom_header: [],
      bulk_selected: false,
      server_sort_type: '',
      pages: [],
      restrict_call: 0,
      from_load_more: false,
      data_loaded: false,
      loadmore_icon: false,
      loading_icon: true,
      sortableOptions: {
        chosenClass: 'is-selected',
      },
      sortKey: '',
      sortKeyType: '',
    };
  },

  computed: {
    /**
     * Adds column depending on bulk and dropdown props
     * @private
     */
    table_columns () {
      const cols = [...this.columns];

      // Add all the columns
      if (!this.is_custom_header) {
        var jsonKeys = Object.keys(this.data[0]);
        for (var i = 0; i < jsonKeys.length; i++) {
          for (var j = 0; j < cols.length; j++) {
            if (cols[j].key === jsonKeys[i]) {
              cols[j].class = cols[j].class === 'hidden_header' ? 'hidden_header' : '';
              delete jsonKeys[i];
            }
          }
          if (jsonKeys[i]) {
            var label = jsonKeys[i];
            if (jsonKeys[i].includes('_')) {
              // Label = jsonKeys[i].replace('_',' ');
              label = jsonKeys[i]
                .replace(/_/gi, ' ')
                .toLowerCase()
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
            } else {
              label = jsonKeys[i]
                .toLowerCase()
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
            }
            var object = {
              label: label,
              sortable: true,
              key: jsonKeys[i],
              class: 'hidden_header',
            };
            cols.splice(i, 0, object);
          }
        }
      }

      // Add columns from localstorage
      if (JSON.parse(localStorage.getItem(this.$vnode.data.ref)) && JSON.parse(localStorage.getItem(this.$vnode.data.ref)).length) {
        var storedCols = JSON.parse(localStorage.getItem(this.$vnode.data.ref));
        storedCols.forEach(obj => {
          if (Object.keys(this.data[0]).indexOf(obj.key) !== -1) {
            const index = cols.findIndex(p => p.key === obj.key);
            if (index !== -1) {
              obj.class = '';
            }
            cols[index] = obj;
          }
        });

        // Cols = [...stored_custom];
      }

      if (this.bulk) {
        cols.unshift('#');
      }

      if (this.dropdown) {
        cols.push(this.option_label);
        // For(var i=0; i<cols.length; i++){
        //   If(cols[i].label === "options"){
        //     Cols.splice(i,1);
        //     Cols.push('options')
        //   }else if(cols[i].label === "actions"){
        //     Cols.push('actions')
        //     Cols.splice(i,1);
        //   }else{
        // Console.log("Nothing");
        //   }
        // }
      }

      return cols;
    },

    /**
     * Depends on dropdown_options prop
     * If dropdown prop is true - checks for dropdown_options presense
     * @private
     */
    dropdown_options_handler () {
      if (!this.dropdown) return [];

      if (this.dropdown && !this.dropdown_options) {
        console.error('dropdown_options is required when dropdown prop is true');
        return [];
      }

      return [...this.dropdown_options];
    },
    /**
     * Getting count of loaded data
     */
    loaded_data_count () {
      // Return this.actual_data.length;
      return parseInt(this.limit) + parseInt(this.offset);
    },
    /**
     * Custom height class for the table
     * @return {String} - Custom class
     */
    height () {
      if (this.height_class) {
        return 'table mb-0 custom-padding ' + this.height_class;
      } else {
        return 'table mb-0 custom-padding';
      }
    },
    /**
     * To handle the broken image of loader
     * @return {String} - Loading Image
     */
    onerror_handle_loader () {
      if (this.loading_image) {
        return "this.onerror=null;this.src='" + this.loading_image + "';";
      } else {
        return "this.onerror=null;this.src='https://cdn.500apps.io/images/icons/infinity-loading.png';";
      }
    },
    /**
     * Disable load more option by comparing dara length
     * @return Integer - Page Number
     */
    load_option () {
      const l = parseInt(this.total_count);
      const s = parseInt(this.limit);
      if (l % s !== 0) return Math.floor(l / s);
      else return Math.floor(l / s) - 1;
    },
  },

  watch: {
    body_data (newval, oldval) {
      this.body_data = newval;
    },
    static_data: {
      handler (val) {
        this.data = val;
        this.stored_data = this.pagination_type !== 'loadMore' ? this.static_data : this.stored_data.concat(this.static_data);
      },
      deep: true,
    },
    ac_cursor (newval, oldval) {
      this.handler_data();
    },
    pagination_type (newval, oldval) {
      this.pagination_type = newval;
      this.handler_data();
    },
    show_searchbar (newval, oldval) {
      this.show_searchbar = newval;
      this.handler_data();
    },
    selected (newval, oldval) {
      if (newval.length < oldval.length || newval.length > 0 || this.select_all === false) {
        this.select_checkbox(newval);
      }
    },
    scroll_height (newval, oldval) {
      this.scroll_height = newval;
    },
    // To get data when count_url is changed
    data_count_url (newval, oldval) {
      this.data_count_url = newval;
      this.get_total_data_count();
    },
    // To keep track with data on change
    data: {
      handler (val) {
        this.data_loaded = true;
        this.is_loading = false;
        this.loading_icon = false;
        if ((this.pagination_type === 'loadMore' || this.pagination_type === 'scroll') && this.page_number) {
          // Check for data
          if (this.data && this.data.length) {
            this.actual_data = this.actual_data.concat(this.data);
          } else {
            // eslint-disable-next-line no-self-assign
            this.actual_data = this.actual_data;
          }
        } else this.actual_data = this.data;
      },
      deep: true,
    },
    actual_data (newval, oldval) {
      if (this.bulk_selected === true) {
        this.selected = [...this.selected];
      } else if (this.select_all === true) {
        this.selected = this.actual_data;
      } else if (this.selected && this.selected.length) {
        this.selected = [...this.selected];
      }
    },
    total_count (newval, oldval) {
      this.total_count = newval;
      if (this.pagination_type === 'pagination') this.set_pages();
    },
  },

  created () {
    this.sorting = this.sorting.toLowerCase();
    if (this.sorting === 'client') {
      this.server_sort_type = false;
    } else {
      this.server_sort_type = true;
    }
    // Check for static data and url evaluate functionality accordingly
    if (this.static_data && this.static_data.length) {
      this.data = this.static_data;
      this.stored_data = this.pagination_type !== 'loadMore' ? this.static_data : this.stored_data.concat(this.static_data);
    } else if (this.url) {
      this.handler_data();
    } else {
      this.data = [];
    }
    this.get_total_data_count();
    if (this.pagination_type === 'deselect') {
      this.server_sort_type = false;
    }

    if (this.pagination_type === 'scroll' && this.load_more_type === 'infiniScroll') {
      this.scroll_style = typeof this.scroll_style === 'string' ? JSON.parse(this.scroll_style) : this.scroll_style;
    }
  },
  directives: {
    sortable: {
      bind: function (el, binding, vnode) {
        const table = el;
        table._sortable = vnode.context.createSortable(table.querySelector('tbody'), binding.value, vnode);
      },
    },
  },
  methods: {
    createSortable (el, options, vnode) {
      var _this = vnode.context;
      return Sortable.create(el, {
        ...options,
        onEnd: function (evt) {
          _this.$emit('darg_drop', evt);
        },
        onAdd: function (evt) {
          _this.$emit('darg_drop', evt);
        },
      });
    },
    /**
     * If server_sort_type is true
     * Executes on clicking on header and fetched data from server by sorting data
     */
    async sortingChanged (sortKey) {
      let params;
      const sortby = sortKey.sortDesc ? 'desc' : 'asc';
      this.sortKey = sortKey.sortBy;
      this.sortKeyType = sortby;
      const limit = this.offset === 0 ? this.limit : parseInt(this.offset) + this.limit;
      // eslint-disable-next-line prefer-const
      params = `?${this.limit_key}=${limit}&${this.server_sort_key}=${sortKey.sortBy}&${this.server_sort_key_type}=${sortby}`;
      this.actual_data = await this.fetch_data(`${this.url}${params}`, this.method, {});
    },
    /**
     * Executes on selecting checkbox from table header
     * @public
     */
    bulk_actions (event) {
      this.selected = event ? this.selected : [];
      // Append dynamic class for all rows on bulk checked
      /* If (this.checkbox_click_class) {
        this.actual_data.forEach(item => {
          item._rowVariant = event.target.checked
            ? this.checkbox_click_class
            : "";
        });
        this.$forceUpdate();
      } */
      // Push the selected data to selected array
      if (this.bulk_selected === true && !this.select_all) this.get_bulk_selected();
      else if (!this.select_all) {
        const temp = [];
        this.actual_data.forEach(object => {
          temp.push(object);
        });
        this.selected = temp;
      }
      // It fires when click on header checkbox
      this.$emit('bulk_action', { item: this.selected, event: event });
    },
    /**
     * Append checkbox selected data to an array
     * @public
     * @returns {array} id's array of checked rows
     */
    get_selected () {
      var selected = [];
      if (this.selected && this.selected.length) {
        this.selected.forEach(object => {
          selected.push(object.id);
        });
      }
      return selected;
      // Return [...this.selected];
    },
    /**
     * @function @async get_total_data_count - local function to get count of data from API
     * @public
     */
    async get_total_data_count () {
      if (this.data_count_url && this.data_count_url !== '') {
        const bodyData = this.body_data && typeof this.body_data === 'object' ? this.body_data : JSON.parse(this.body_data);
        const dataCount = await this.fetch_data(this.data_count_url, this.method, bodyData);
        if (dataCount && Array.isArray(dataCount)) {
          this.total_count = this.count_key ? dataCount[0][this.count_key] : dataCount;
        } else if (dataCount && typeof dataCount === 'object') {
          this.total_count = this.count_key ? dataCount[this.count_key] : dataCount;
        }
      } else {
        console.log('Provide data_count_url to get length of data');
      }
    },
    loadmore_click_fun: function () {
      this.loadmore_icon = true;
      this.page_number++;
      this.from_load_more = true;
      try {
        this.offset += parseInt(this.limit);
      } catch (error) {
        console.log(error);
      }
      this.handler_data();
    },
    /**
     * It fires when click on each row checkbox
     * @param  {number} id - id of selected row's data
     */
    checkbox_click (item) {
      // Append dynamic class for row on checked
      /*  If (this.checkbox_click_class) {
        item._rowVariant = event.target.checked
          ? this.checkbox_click_class
          : "";
        this.$forceUpdate();
      } */

      if (this.bulk_selected === true && this.selected.length < this.total_count) {
        this.select_all = false;
      } else if (this.bulk_selected === true && this.selected.length === this.total_count) {
        this.select_all = true;
      } else if (this.selected.length >= this.actual_data.length) {
        this.select_all = true;
      } else this.select_all = false;
      // It fires when click on row checkbox
      this.$emit('checkbox_clicked', {
        item: item,
        checked: event.target.checked,
      });
    },
    /**
     * Sets checked rows
     * @public
     * @param {array} data - array of row ids
     */
    set_selected (actualData) {
      this.selected = [...actualData];
    },

    /**
     * Executes on click of dropdown option
     * @public
     * @param {object} option - selected option events
     * @param {object} item - row info related to clicked dropdown
     */
    on_dropdown_item_click (option, item, index) {
      // Execute appup handler workflow
      // Executes multi handlers functionality
      if (option.options && option.options.length) {
        var handlersArray = [];
        option.options.forEach(element => {
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
                index: index,
              },
            };
          }
          // Forming array of objects
          handlersArray.push(handlerObject);
        });
        this.start(handlersArray);
      } else if (option.handler && this.start) { // Executes functionality without multihandlers
        let custom = {};
        if (option.handler_params) {
          try {
            custom = JSON.parse(option.handler_params);
          } catch {
            if (typeof option.handler_params === 'object') {
              custom = option.handler_params;
            }
          }
        }
        this.start(option.handler, {
          helper: {
            component: this,
            item: item,
            index: index,
            custom: custom,
          },
        });
      }

      // It fires when Dropdown Click
      this.$emit('dropdown_click', {
        type: option.type,
        option,
        item,
        index,
      });
    },
    /**
     * Execute when clicked on row
     */
    row_clicked (event, index) {
      // Event["index"] = index;
      this.current_item = JSON.parse(JSON.stringify(event));
      this.current_item.index = index;
      // It fires when Row Click
      this.$emit('row_clicked', this.current_item);
    },
    /**
     * Search based on the search_value entered from searchbar
     * @return {Array} - Filtered data based on search value
     */
    search_results () {
      this.actual_data = this.stored_data.filter(item => {
        if (this.search_value) {
          return item[this.search_key].toLowerCase().includes(this.search_value.toLowerCase());
        } else return this.stored_data;
      });
    },

    /**
     * Get data when scroll reaches end
     */
    async infiniteScroll (event) {
      if (this.load_more_type === 'infiniScroll') {
        if (Math.ceil(event.target.scrollTop) >= event.target.scrollHeight - event.target.clientHeight) {
          if (this.loaded_data_count < this.total_count) {
            this.page_number++;
            this.offset = parseInt(this.limit) * this.page_number;
            this.handler_data();
            // Const result = await this.loadmore_click_fun();
            // This.stored_data = this.actual_data.concat(this.data);
          }
        }
      }
    },
    /**
     * Get data from url
     */
    async handler_data () {
      if (this.pagination_type === 'pagination' || this.pagination_type === 'scroll') {
        this.append_to_ac_cursor();
      }
      // If show loadmore true appends limit and offset key to url
      if (this.pagination_type === 'loadMore') {
        if (!this.from_load_more) {
          this.page_number = 0;
          this.offset = 0;
        }
        // Forming params with limit and offset
        this.append_to_ac_cursor();
        this.from_load_more = false;
      }
      // eslint-disable-next-line no-unused-vars
      const msg = await this.set_ajax();
      this.loadmore_icon = false;
      this.is_loading = false;
      this.stored_data = this.pagination_type !== 'loadMore' ? this.data : this.stored_data.concat(this.data);
      // This.actual_data = this.data;
    },
    /**
     * Get total page numbers to be displayed in UI
     */
    set_pages () {
      const numOfPages = Math.ceil(this.total_count / this.limit);
      for (var i = 1; i <= numOfPages; i++) {
        this.pages.push(i);
      }
    },
    /**
     * Invoke onclick of page number
     * Set offset according to the page number to fetch data
     */
    pagenumber_click (page) {
      this.restrict_call += 1;
      if (page && page != null && this.restrict_call !== 2) {
        /* If (this.bulk_selected == true && this.selected.length < this.total_count )
        this.select_all = false;  */
        this.offset = parseInt(this.limit) * (page - 1);
        this.append_to_ac_cursor();
        this.handler_data();
      }
    },
    /**
     * Appending limit and offset values when pagination is true
     */
    append_to_ac_cursor () {
      if (typeof this.ac_cursor === 'string') {
        this.ac_cursor = {};
      }
      this.ac_cursor[this.limit_key] = parseInt(this.limit, 10);
      this.ac_cursor[this.offset_key] = parseInt(this.offset, 10);
      if (this.sorting === 'server' && this.sortKey.length > 0 && this.sortKeyType.length > 0) {
        this.ac_cursor[this.server_sort_key] = this.sortKey;
        this.ac_cursor[this.server_sort_key_type] = this.sortKeyType;
      }
    },
    /**
     * Get custom headers
     * @public
     */
    get_headers (staticData) {
      if (staticData && staticData.length) {
        var jsonKeys = staticData.map(a => a.key);
      } else {
        // eslint-disable-next-line no-redeclare
        var jsonKeys = Object.keys(this.data[0]);
      }

      var columns = JSON.parse(JSON.stringify(this.columns));
      // Makes rows checked from localstorage
      if (JSON.parse(localStorage.getItem(this.$vnode.data.ref)) && JSON.parse(localStorage.getItem(this.$vnode.data.ref)).length) {
        JSON.parse(localStorage.getItem(this.$vnode.data.ref)).forEach(obj => {
          columns.push(obj);
        });
      }
      this.tableJsondata = [];
      // Modified JSON for checkboxes
      for (var i = 0; i < jsonKeys.length; i++) {
        for (var j = 0; j < columns.length; j++) {
          if (columns[j].key === jsonKeys[i]) {
            columns[j].checked = true;
            this.tableJsondata.push(columns[j]);
            columns.splice(j, 1);
            delete jsonKeys[i];
          }
        }
        if (jsonKeys[i]) {
          var label = jsonKeys[i];
          if (jsonKeys[i].includes('_')) {
            // Label = jsonKeys[i].replace('_',' ');
            label = jsonKeys[i]
              .replace(/_/gi, ' ')
              .toLowerCase()
              .split(' ')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ');
          } else {
            label = jsonKeys[i]
              .toLowerCase()
              .split(' ')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ');
          }
          var object = {
            label: staticData && staticData[i] ? staticData[i].label : label,
            sortable: true,
            key: jsonKeys[i],
          };
          object.checked = false;
          this.tableJsondata.push(object);
        }
      }
      // This.showCustomheader = true;
      return this.tableJsondata;
    },
    /**
     * Show custom headers
     */
    add_headers (newLabel, newKey) {
      this.columns.push({
        label: newLabel,
        key: newKey,
        checked: false,
      });
      this.tableJsondata.push({
        label: newLabel,
        key: newKey,
        checked: false,
      });
      this.custom_header.push({
        label: newLabel,
        key: newKey,
        checked: false,
      });
      this.data[0][newKey] = '';
    },
    /**
     * Set custom headers
     */
    set_headers (clickedData) {
      var columnsdata = JSON.parse(JSON.stringify(this.columns));

      // Findout index of selected data
      /*  Var index = columnsdata.findIndex(p => p.key == clickedData.key);
      if (index != -1) {
        columnsdata.splice(index, 1);
        this.columns = columnsdata;
      } else {
        columnsdata.push(clickedData);
        this.columns = columnsdata;
      } */
      var index = columnsdata.findIndex(p => p.key === clickedData.key);
      if (index !== -1) {
        columnsdata[index].class = clickedData.checked === true ? 'hidden_header' : '';
      } else {
        // Columnsdata.push(clickedData);
        columnsdata.splice(clickedData.index, 0, clickedData);
      }
      this.columns = columnsdata;
    },
    /**
     * Set custom headers from local storage
     */
    set_headers_local (clickedData) {
      //  This.columns = [...this.columns];
      var columnsdata = JSON.parse(JSON.stringify(this.columns));

      /* If (
        JSON.parse(localStorage.getItem(this.$vnode.data.ref)) &&
        JSON.parse(localStorage.getItem(this.$vnode.data.ref)).length
      ) {
        JSON.parse(localStorage.getItem(this.$vnode.data.ref)).forEach(obj => {
          columnsdata.push(obj);
        });
      } */
      // Findout index of selected data
      var index = columnsdata.findIndex(p => p.key === clickedData.key);
      if (index !== -1) {
        // Columnsdata.splice(index, 1);
        columnsdata[index].class = clickedData.checked === true ? 'hidden_header' : '';
      }
      this.columns = columnsdata;
    },
    /**
     * Execute selected checkbox
     */
    select_checkbox (newval) {
      // It fires when Row Click
      this.$emit('selected_checkbox', newval);
    },
    /**
     * Executes on click of searchbar icon and emits event
     */
    on_input () {
      this.$emit('search_button_click', this.search_value);
    },
    /**
     * To get all the bulk ids from data
     */
    get_bulk_selected () {
      this.bulk_selected = false;
      // To get all the data selected
      if (this.url) {
        const urlHasParams = this.url.split('?').length > 1;
        if (this.total_count) {
          let urlParams = this.limit_key + '=' + this.total_count;
          urlParams = this.ac_cursor && this.ac_cursor.where ? urlParams + '&where=' + this.ac_cursor.where : urlParams;
          urlParams = this.ac_cursor && this.ac_cursor.order_by ? urlParams + '&order_by=' + this.ac_cursor.order_by : urlParams;
          var url = urlHasParams ? this.url + '&' + urlParams : this.url + '?' + urlParams;
        }
        // Fetch the data
        fetch(url, {})
          .then(res => res.json())
          .then(res => {
            if (res.length) {
              /* Res.forEach(object => {
                this.bulk_selected.push(object);
              }); */
              this.select_all = true;
              this.bulk_selected = true;
              this.selected = res;
            }
          })
          // eslint-disable-next-line handle-callback-err
          .catch(err => {});
        // To check all the checkboxes
        this.$emit('bulk_select', this.bulk_selected);
      }
    },
  },
};
</script>

<style>
/* .loader {
  position: fixed;
  display: flex;
  align-items: center;
  justify-content: center;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
  background-color: rgba(255, 255, 255, .65);
} */
.table-thead-border th {
  border-bottom-width: 0 !important;
  white-space: nowrap !important;
}
.table-thead-border td {
  vertical-align: middle !important;
}
.table thead th {
  border-bottom: 0px !important;
}
table {
  margin-bottom: 0px !important;
}
.ac-collection-table th,
.ac-collection-table td {
  white-space: nowrap !important;
}
.cursor-pointer .custom-control-label {
  cursor: pointer;
}
.hidden_header {
  display: none;
}
</style>

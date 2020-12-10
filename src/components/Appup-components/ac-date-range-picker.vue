<template>
  <div>
    <b-tooltip target="ac-date-range-picker-tooltip">
      <!-- Show prop if exists -->
      <template v-if="data_tooltip_text">{{data_tooltip_text}}</template>

      <!-- Show slot if exists -->
      <template v-if="$slots.tooltip_text">
        <slot name="tooltip_text"></slot>
      </template>

      <!-- Show year if tooltip year is enabled is true -->
      {{tooltip_year.startYear }} - {{tooltip_year.endYear }}
    </b-tooltip>

    <date-range-picker
      :opens="opens"
      @update="update_value"
      @toggle="toggle"
      :date-range="value"
      :min-date="min_date"
      :max-date="max_date"
      :single-date-picker="data_single_date_picker"
      :time-picker="data_time_picker"
      :time-picker-increment="time_picker_increment"
      :time-picker24-hour="data_time_picker_24_hour"
      :time-picker-seconds="data_time_picker_seconds"
      :show-week-numbers="data_show_week_numbers"
      :show-dropdowns="data_show_dropdowns"
      :auto-apply="data_auto_apply"
      :ranges="show_ranges ? (ranges ? ranges:undefined) : show_ranges"
    >
      <!-- Use this slot for input field format-->
      <div
        id="ac-date-range-picker-tooltip"
        slot="input"
        slot-scope="picker"
        style="min-width: 100px;"
        @click.prevent="conver_epoch_to_UTC"
      >
        <!-- Add condition for showing ranges i.e Today, yesterday ? -->
        <template class="d-flex align-items-center" v-if="(picker.startDate.toString() === picker.endDate.toString())">
          <template>{{ new Date(dataValue.startDate) | singledate }}</template>
        </template>
        <template
          v-else
        >{{ new Date(dataValue.startDate) | date }} - {{ new Date(dataValue.endDate) | date }}</template>
      </div>
      <template #ranges="ranges">
        <div class="ranges">
          <ul>
            <li
              v-for="(range, name) in ranges.ranges"
              :key="name"
              @click="ranges.clickRange(range)"
            >
              <b>{{name}}</b>
              <small
                class="text-muted"
              >{{typeof range[0] === 'object' ? range[0].toDateString() : new Date(range[0]).toDateString()}} - {{typeof range[1] === 'object' ? range[1].toDateString() : new Date(range[1]).toDateString()}}</small>
              <!-- {{typeof range[0] === 'object' ? range[0].toDateString() : new Date(range[0]).toDateString()}} - {{typeof range[1] === 'object' ? range[1].toDateString() : new Date(range[1]).toDateString()}} -->
            </li>
          </ul>
        </div>
      </template>
      <div slot="footer" slot-scope="data" class="slot">
        <div class="d-flex float-right">
          <a
            class="btn btn-secondary m-1"
            @click="data.clickCancel"
            v-if="!data.in_selection"
          >Cancel</a>
          <a
            class="btn btn-primary text-white m-1"
            @click="saveApply"
            v-if="!data.in_selection && show_ranges"
          >Save & Apply</a>
          <b-button ref="apply" variant="primary" class="m-1" @click="data.clickApply" v-if="!data.in_selection">Apply</b-button>
        </div>
      </div>
    </date-range-picker>
  </div>
</template>

<script>
/**
 * Ac date range picker component
 * @requires vue2-daterange-picker - Forked from https://github.com/Innologica/vue2-daterange-picker
 */
import dateRangePicker from 'vue2-daterange-picker';
import 'vue2-daterange-picker/dist/vue2-daterange-picker.css';

// Import moment for date conversion
import moment from 'moment';
export default {
  name: 'ac-date-range-picker',

  components: {
    dateRangePicker
  },

  data () {
    return {
      save_date_range: false,
      customkey: 0,
      tooltip_year: { startYear: '', endYear: '' },
      dataValue: this.value,
      data_auto_apply: this.auto_apply,
      data_show_dropdowns: this.data_show_dropdowns,
      data_time_picker: this.data_time_picker,
      data_time_picker_seconds: this.time_picker_seconds,
      data_time_picker_24_hour: this.data_time_picker_24_hour,
      data_single_date_picker: this.single_date_picker,
      data_show_week_numbers: this.data_show_week_numbers,
      data_tooltip_text: this.tooltip_text
    };
  },

  filters: {
    // As need to show only day and month in slots create a date object with options as config
    date (value) {
      const options = { month: 'short', day: 'numeric' };
      return Intl.DateTimeFormat('en-US', options).format(value);
    },
    singledate (value) {
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return Intl.DateTimeFormat('en-US', options).format(value);
    }
  },

  // As it is a wrapper keeping the props same as the wrapper
  props: {
    /**
     * Tooltip text for component
     * @param {String} tooltip_text
     * @label tooltip_text
     * @category_name 3_Advanced
     */
    tooltip_text: {
      type: String,
      default: null
    },

    /**
     * Which way the picker opens - center, left or right default center
     * @param {String} opens
     * @label opens
     * @category_name 3_Advanced
     */
    opens: {
      type: String,
      default: 'center'
    },
    /**
     * To emit date in epoch format
     * @param {String} epoch_format
     * @label epoch_format
     * @category_name 1_General
     */
    epoch_format: {
      type: Boolean,
      default: true
    },
    /**
     * Minimum date allowed to be selected
     * @param {String} min_date
     * @label min_date
     * @category_name 1_General
     */
    min_date: {
      type: String
    },

    /**
     * Maximum date allowed to be selected
     * @param {String} max_date
     * @label max_date
     * @category_name 1_General
     */
    max_date: {
      type: String
    },

    /**
     * V-model prop
     * @param {Object} value
     * @label value
     * @category_name 1_General
     */
    value: {
      type: Object,
      required: true
    },

    /**
     * Allows you to select only one date (instead of range). This will hide the ranges with different start/end
     * @param {Boolean} single_date_picker
     * @label single_date_picker
     * @category_name 3_Advanced
     */
    single_date_picker: {
      type: [Boolean, String]
    },

    /**
     * Show the dropdowns for time (hour/minute) selection below the calendars
     * @param {Boolean} time_picker
     * @label time_picker
     * @category_name 3_Advanced
     */
    time_picker: {
      type: [Boolean, String],
      default: false
    },

    /**
     * Use 24h format for the time
     * @param {Boolean} time_picker_24_hour
     * @category_name 3_Advanced
     */
    time_picker_24_hour: {
      type: [Boolean, String],
      default: true
    },

    /**
     * Determines the increment of minutes in the minute dropdown. Default 5
     * @param {Number} time_picker_increment
     * @label time_picker_increment
     * @category_name 3_Advanced
     */
    time_picker_increment: {
      type: Number,
      default: 5
    },

    /**
     * Allows you to select seconds except hour/minute. Default false
     * @param {Boolean} time_picker_seconds
     * @label time_picker_seconds
     * @category_name 3_Advanced
     */
    time_picker_seconds: {
      type: [Boolean, String],
      default: false
    },

    /**
     * Show the ranges on the left side of the calendar
     * @param {Boolean} show_ranges
     * @label show_ranges
     * @category_name 1_General
     */
    show_ranges: {
      type: [Boolean, String],
      default: false
    },
    /**
     * Show the week numbers on the left side of the calendar
     * @param {Boolean} show_week_numbers
     * @label show_week_numbers
     * @category_name 3_Advanced
     */
    show_week_numbers: {
      type: [Boolean, String]
    },
    /**
     * Show the dropdowns for month and year selection above the calendars.
     * @param {Boolean} show_dropdowns
     * @label show_dropdowns
     * @category_name 3_Advanced
     */
    show_dropdowns: {
      type: [Boolean, String]
    },
    /**
     * Auto apply selected range. If false you need to click an apply button
     * @param {Boolean} auto_apply
     * @label auto_apply
     * @category_name 3_Advanced
     */
    auto_apply: {
      type: [Boolean, String]
    },
    /**
     * You can set this to false in order to hide the ranges selection. Otherwise it is an object with key/value.
     * @param {Boolean} ranges
     * @label ranges
     * @category_name 3_Advanced
     */
    ranges: {
      type: [Boolean, Object],
      default () {
        if (this.show_ranges) return {};
        else return false;
      }
    },
    /**
     * You can fetch ranges from url
     * @param {Boolean} ranges_url
     * @label ranges URL
     * @category_name 3_Advanced
     */
    ranges_url: {
      type: String
    },
    /**
     * Format of date
     * @param {String} date_format
     * @label date_format
     * @category_name 3_Advanced
     */
    date_format: {
      type: String
    }
  },
  watch: {
    dataValue: {
      handler (newVal, oldVal) {
        this.dataValue = newVal;
        this.$set(this.value, 'startDate', newVal.startDate);
        this.$set(this.value, 'endDate', newVal.endDate);
      },
      deep: true
    },
    value: {
      handler (newVal, oldVal) {
        this.value = newVal;
      },
      deep: true
    }
  },
  created () {
    this.conver_epoch_to_UTC();
  },
  beforeMount () {
    // In case of form prop is of string type, as it is causing component to not render. Parsing props
    this.convert_string_props_into_boolean();

    // To get year for tooltip from date input, as v-model(this.value)
    this.format_tooltip_date(this.value);
  },
  mounted () {
    if (this.show_ranges) {
      this.default_ranges();
      this.get_ranges();
    }
  },
  methods: {
    conver_epoch_to_UTC: function () {
      if (this.epoch_format && !new Date(this.dataValue.startDate).getDate()) {
        var start = new Date(this.dataValue.startDate * 1000);
        var end = new Date(this.dataValue.endDate * 1000);
        this.dataValue.startDate =
          start.getFullYear() + '-' + start.getMonth() + '-' + start.getDate();
        this.dataValue.endDate =
          end.getFullYear() + '-' + end.getMonth() + '-' + end.getDate();
      }
    },
    default_ranges: function () {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const thisMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      this.ranges.Today = [today, today];
      this.ranges.Yesterday = [yesterday, yesterday];
      this.ranges['This month'] = [thisMonthStart, thisMonthEnd];
      this.ranges['This year'] = [
        new Date(today.getFullYear(), 0, 1),
        new Date(today.getFullYear(), 11, 31)
      ];
      (this.ranges['Last month'] = [
        new Date(today.getFullYear(), today.getMonth() - 1, 1),
        new Date(today.getFullYear(), today.getMonth(), 0)
      ]);
    },
    get_ranges: function () {
      if (this.ranges_url) {
        this.$appupajax
          .get2(
            this.ranges_url,
            {},
            {},
            { withCredentials: true, credentials: 'include' }
          )
          .then(this.$appupajax.handleResponse)
          .then(response => {
            this.ranges = Object.assign(response.data, this.ranges);
          })
          .catch(error => {
            // Handle error
            console.log(error);
          })
          .finally(function () {
            // Always executed
          });
      }
    },
    saveApply: function (data) {
      this.save_date_range = true;
      this.$refs.apply.click();
    },
    /**
     * Update year for tooltip
     * @function format_tooltip_date - retrieves the date for tooltip from dateRangeObject
     * @param dateRangeObject
     */
    format_tooltip_date (dateRangeObject) {
      // This.tooltip_year.startYear = moment(dateRangeObject.startDate).format(
      //   "YYYY"
      // );
      // This.tooltip_year.endYear = moment(dateRangeObject.endDate).format(
      //   "YYYY"
      // );
      if (dateRangeObject.startDate) {
        this.tooltip_year.startYear = new Date(
          dateRangeObject.startDate
        ).toDateString();
      }
      if (dateRangeObject.endDate) {
        this.tooltip_year.endYear = new Date(
          dateRangeObject.endDate
        ).toDateString();
      }
    },

    /**
     * Provides the updated date range value.
     * @function update_value - emits the updated values
     * @param values
     */
    update_value (values) {
      // Update tooltip year for new date
      this.format_tooltip_date(values);
      if (this.save_date_range) {
        this.ranges['range' + this.customkey] = [];
        this.ranges['range' + this.customkey][0] = values.startDate;
        this.ranges['range' + this.customkey][1] = values.endDate;
        this.$emit('add_custom_range', {
          range_name: 'range' + this.customkey,
          date_range: this.ranges['range' + this.customkey]
        });
        this.customkey += 1;
      }
      this.save_date_range = false;
      // Check for date_format prop, if exists do date transformation using moment
      if (this.date_format) {
        this.dataValue = Object.assign({
          startDate: moment(values.startDate).format(this.date_format),
          endDate: moment(values.endDate).format(this.date_format)
        });
      } else {
        this.dataValue = Object.assign({
          startDate: values.startDate,
          endDate: values.endDate
        });
      }
      if (this.epoch_format) {
        var dataValue = JSON.parse(JSON.stringify(this.dataValue));
        for (var key in dataValue) {
          dataValue[key] = new Date(dataValue[key]).getTime() / 1000;
        }
        this.$emit('input', dataValue);
      } else {
        // Update v-model by emiting
        this.$emit('input', this.dataValue);
      }
    },

    /**
     * Fires when date range is opened or close.
     * @function toggle
     * @public
     */
    toggle () {
      // In case of form prop is of string type, as it is causing component to not render. Parsing props
      this.convert_string_props_into_boolean();
    },

    /**
     * Handles the props conversion from string to boolean
     * @function convert_string_props_into_boolean
     * @public
     */
    convert_string_props_into_boolean () {
      // Generate array for all props name to be converted
      const props = [
        'auto_apply',
        'show_dropdowns',
        'time_picker',
        'time_picker_seconds',
        'time_picker_24_hour',
        'single_date_picker',
        'show_week_numbers'
      ];

      // Loop through all props and call conversion method
      for (let i = 0; i < props.length; i++) {
        this[`data_${props[i]}`] = this.convert_string_to_boolean(
          this[props[i]]
        );
      }
    },

    /**
     * Converts given string param into boolean
     * @function convert_string_to_boolean
     * @param stringProp
     */
    convert_string_to_boolean (stringProp) {
      // If string is true return boolean true and boolean false for fail condition
      if (stringProp === 'true') {
        return true;
      }
      return false;
    }
  }
};
</script>
<style>
.daterangepicker.opensleft {
  left: 0 !important;
  right: inherit !important;
}
.daterangepicker.opensright {
  left: inherit !important;
  right: 0 !important;
}
.daterangepicker.openscenter {
  left: inherit !important;
  right: inherit !important;
}
.daterangepicker.opensleft:before {
  right: inherit !important;
  left: 16px !important;
}
.daterangepicker.opensleft:after {
  right: inherit !important;
  left: 17px !important;
}
.daterangepicker.opensright:before {
  right: 16px !important;
  left: inherit !important;
}
.daterangepicker.opensright:after {
  left: inherit !important;
  right: 17px !important;
}
.daterangepicker.openscenter:before {
  left: 40%;
  transform: translateX(-40%);
}
.daterangepicker.openscenter:after {
  left: 40%;
  transform: translateX(-44%);
}
</style>


/**
 * @mixin
 */
export default {
  name: 'ac-preload',

  props: {
    /**
     * Call handler when preload page
     * @param {string} preload
     * @label Preload
     */
    preload: {
      type: String,
      required: false
    }

  },

  data () {
    return {
      custom: ''
    };
  },
  mounted () {
    // Calls preload handler
    if (this.preload) {
      if (this.handler_params) {
        try {
          this.custom = JSON.parse(this.handler_params);
        } catch (e) {
          this.custom = this.handler_params;
        }
      } else {
        this.custom = {};
      }

      setTimeout(() => {
        this.start(this.preload, {
          helper: {
            component: this,
            custom: this.custom
          }
        });
      }, 300);
    }
  },
  methods: {},
  watch: {}
}

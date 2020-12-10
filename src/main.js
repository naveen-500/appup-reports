import Vue from 'vue'
import VueRouter from 'vue-router';
import App from './App.vue';
import BootstrapVue from 'bootstrap-vue';
import './components/js/preload';
import rJson from './components/js/report'
import page from './components/main/Appup-report'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
import AppupHttp from './components/js/appup-http';
Vue.use(AppupHttp)
Vue.use(VueRouter);
Vue.use(BootstrapVue)
const routes = [
  { path: '/reports', component: page, props: rJson }
]
const router = new VueRouter({
  routes
});
Vue.config.productionTip = false
// eslint-disable-next-line no-unused-vars
new Vue({
  router,
  render: h => h(App),
}).$mount('#app')

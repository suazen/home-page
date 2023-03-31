import Vue from 'vue'
import App from './App.vue'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css'
import VueResource from 'vue-resource'
import Contextmenu from 'vue-contextmenujs'

Vue.config.productionTip = false
Vue.use(ElementUI);
Vue.use(VueResource);
Vue.use(Contextmenu);

new Vue({
  render: h => h(App),
}).$mount('#app')

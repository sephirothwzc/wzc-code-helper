import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'main-layout',
      component: require('@/views/MainLayout').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})

import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../components/Home.vue'),
    meta: { login: false }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../components/Login.vue'),
    meta: { login: false }
  },
  {
    path: '/me',
    name: 'Me',
    component: () => import('../components/Me.vue'),
    meta: { login: true }
  },
  {
    path: '/app',
    name: 'Appointment',
    component: () => import('../components/Appointment.vue'),
    meta: { login: true }
  },
  {
    path: '/chat',
    name: 'Chat',
    component: () => import('../components/Chat.vue'),
    meta: { login: true }
  },
  {
    path: '/live/:room',
    name: 'Live',
    props: true,
    component: () => import('../components/Live.vue'),
    meta: { login: true }
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

router.beforeEach((to, from, next) => {
  if (to.meta.login && !localStorage.getItem("me")){
    next({ path: "/login" })
  }
  next();
});

export default router

import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';
import CompleteProfile from '../views/CompleteProfile.vue';
import Profile from '../views/Profile.vue';
import Services from '../views/Services.vue';
import ErrorPage from "../views/Error.vue"; 

const routes = [
  { path: '/', component: Home },
  { path: '/login', name: 'Login', component: Login },
  { path: '/register', name: 'Register', component: Register },
  { path: '/complete-profile', name: 'CompleteProfile', component: CompleteProfile, meta: { requiresAuth: true } },
  { path: '/profile', name: 'Profile', component: Profile, meta: { requiresAuth: true } },
  { path: '/services', name: 'Services', component: Services, meta: { requiresAuth: true } },
  {
    path: '/service/:id',
    name: 'ServiceDetails',
    component: () => import('../views/ServiceDetails.vue'),
    props: true
  },

  // catch-all 
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: ErrorPage
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  if (to.meta.requiresAuth && !token) next({ name: 'Login' });
  else next();
});

export default router;

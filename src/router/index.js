import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';
import CompleteProfile from '../views/CompleteProfile.vue';
import Profile from '../views/Profile.vue';
import Services from '../views/Services.vue';
import ErrorPage from "../views/Error.vue"; 
import MessagerPage from '../views/MessagerPage.vue';

const routes = [
  { path: '/', component: Home },
  { path: '/login', name: 'Login', component: Login },
  { path: '/register', name: 'Register', component: Register },
  { path: '/complete-profile', name: 'CompleteProfile', component: CompleteProfile, meta: { requiresAuth: true } },
  
  // Own profile (logged-in user)
  { path: '/profile', name: 'Profile', component: Profile, meta: { requiresAuth: true } },

  // Public or other user's profile (accessible via ID)
  {
    path: '/profile/:id',
    name: 'UserProfile',
    component: Profile,
    props: true,
  },

  { path: '/services', name: 'Services', component: Services, meta: { requiresAuth: true } },
  
  {
    path: '/service/:id',
    name: 'ServiceDetails',
    component: () => import('../views/ServiceDetails.vue'),
    props: true
  },

  // 🛠️ FIX: Single, unified route for Messenger.
  // The optional parameter ':userId?' covers both the conversation list and a specific chat.
{
    path: '/messages', // Standardna putanja
    name: 'Messenger', // KLJUČNO: Ime rute mora biti 'Messenger'
    component: MessagerPage, // Koristimo direktan import koji si imao
    meta: { requiresAuth: true }, 
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
});

// Auth guard
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  if (to.meta.requiresAuth && !token) next({ name: 'Login' });
  else next();
});

export default router;
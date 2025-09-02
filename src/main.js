import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import axios from 'axios';
import './style.css'

axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const app = createApp(App);
app.use(router);
app.mount('#app');

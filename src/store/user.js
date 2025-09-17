// src/store/user.js
import { defineStore } from 'pinia';
import api from '../services/api';

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
  }),

  actions: {
    async fetchUser() {
      try {
        const res = await api.get('/auth/me');
        this.user = res.data.user;
      } catch (err) {
        console.error('Greška kod dohvaćanja usera:', err);
        this.user = null;
      }
    },

    logout() {
      localStorage.removeItem('token');
      this.user = null;
    },
  },
});

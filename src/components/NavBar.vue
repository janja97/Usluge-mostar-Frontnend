<template>
  <nav class="custom-navbar">
    <div class="container">
      <!-- Logo -->
      <router-link class="logo" to="/">MyLogo</router-link>

      <!-- Desktop links -->
      <ul class="nav-links">
        <li v-for="route in leftRoutes" :key="route.name">
          <router-link :to="route.path" class="nav-link">
            {{ route.name }}
          </router-link>
        </li>
      </ul>

      <!-- Auth buttons -->
      <div class="auth-buttons">
        <template v-if="user">
          <span class="user-name">{{ user.fullName }}</span>
          <button class="btn logout-btn" @click="logout">Logout</button>
        </template>
        <template v-else>
          <router-link class="btn login-btn" to="/login">Login</router-link>
          <router-link class="btn register-btn" to="/register">Register</router-link>
        </template>
      </div>

      <!-- Mobile menu button -->
      <button class="mobile-toggle" @click="menuOpen = !menuOpen">
        ☰
      </button>
    </div>

    <!-- Mobile menu -->
    <div v-if="menuOpen" class="mobile-menu">
      <ul>
        <li v-for="route in leftRoutes" :key="route.name">
          <router-link :to="route.path" class="nav-link">
            {{ route.name }}
          </router-link>
        </li>
      </ul>
      <div class="mobile-auth">
        <template v-if="user">
          <span class="user-name">{{ user.fullName }}</span>
          <button class="btn logout-btn" @click="logout">Logout</button>
        </template>
        <template v-else>
          <router-link class="btn login-btn" to="/login">Login</router-link>
          <router-link class="btn register-btn" to="/register">Register</router-link>
        </template>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref } from 'vue'
import { defineProps, defineEmits } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps({
  user: Object
});

const emit = defineEmits(['logout']);
const router = useRouter();
const menuOpen = ref(false);

const leftRoutes = [
  { path: '/', name: 'Home' },
  { path: '/profile', name: 'Profile' },
  { path: '/services', name: 'Services' }
];

function logout() {
  localStorage.removeItem('token');
  emit('logout');
  router.push('/login');
}
</script>

<style scoped>
/* Glavni container */
.custom-navbar {
  background: #fff;
  border-bottom: 1px solid #eee;
  position: sticky;
  top: 0;
  z-index: 1000;
}

.custom-navbar .container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* Logo */
.logo {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111;
  text-decoration: none;
}

/* Desktop links */
.nav-links {
  display: flex;
  gap: 2rem;
  list-style: none;
}

.nav-link {
  text-decoration: none;
  color: #444;
  font-weight: 500;
  transition: color 0.3s;
}
.nav-link:hover {
  color: #007bff;
}

/* Auth buttons */
.auth-buttons {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-name {
  font-weight: 500;
  color: #333;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
}

.login-btn {
  background: transparent;
  border: 1px solid #007bff;
  color: #007bff;
}
.login-btn:hover {
  background: #007bff;
  color: #fff;
}

.register-btn {
  background: #007bff;
  color: #fff;
}
.register-btn:hover {
  background: #0056b3;
}

.logout-btn {
  background: #dc3545;
  color: #fff;
}
.logout-btn:hover {
  background: #b52a37;
}

/* Mobile toggle */
.mobile-toggle {
  display: none;
  font-size: 1.5rem;
  background: none;
  border: none;
  cursor: pointer;
}

/* Mobile menu */
.mobile-menu {
  display: none;
  flex-direction: column;
  padding: 1rem;
  border-top: 1px solid #eee;
}

.mobile-menu ul {
  list-style: none;
  padding: 0;
  margin: 0 0 1rem 0;
}

.mobile-menu .nav-link {
  display: block;
  padding: 0.5rem 0;
  color: #444;
}

.mobile-auth {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

@media (max-width: 992px) {
  .nav-links,
  .auth-buttons {
    display: none;
  }
  .mobile-toggle {
    display: block;
  }
  .mobile-menu {
    display: flex;
  }
}
</style>

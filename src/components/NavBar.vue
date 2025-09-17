<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-light">
    <div class="container-fluid">
      <router-link class="navbar-brand" to="/">MyLogo</router-link>

      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item" v-for="route in leftRoutes" :key="route.name">
            <router-link class="nav-link" :to="route.path">{{ route.name }}</router-link>
          </li>
        </ul>

        <div class="d-flex">
          <template v-if="user">
            <span class="navbar-text me-2">{{ user.fullName }}</span>
            <button class="btn btn-danger btn-sm" @click="logout">Logout</button>
          </template>
          <template v-else>
            <router-link class="btn btn-primary btn-sm me-2" to="/login">Login</router-link>
            <router-link class="btn btn-success btn-sm" to="/register">Register</router-link>
          </template>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps({
  user: Object
});

const emit = defineEmits(['logout']);
const router = useRouter();

const leftRoutes = [
  { path: '/', name: 'Home' },
  { path: '/profile', name: 'Profile' }
];

function logout() {
  localStorage.removeItem('token');
  emit('logout');
  router.push('/login');
}
</script>

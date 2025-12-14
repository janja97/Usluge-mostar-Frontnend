<template>
  <nav class="custom-navbar">
    <div class="container">
      <router-link class="logo" to="/">
        <img src="../../public/img/logo/logo4.png" alt="logo" />
      </router-link>

      <ul class="nav-links">
        <li v-for="route in leftRoutes" :key="route.name">
          <router-link :to="route.path" class="nav-link">
            {{ route.name }}
          </router-link>
        </li>

        <!-- Profil link ako je user prijavljen -->
        <li v-if="user">
          <router-link to="/profile" class="nav-link">Profil</router-link>
        </li>
        <li v-if="user">
          <router-link to="/messages" class="nav-link">Poruke</router-link>
        </li>
      </ul>

      <!-- AUTH sekcija (desktop) -->
      <div class="auth-buttons">
        <template v-if="user">
          <img :src="avatarUrl" class="nav-avatar" />
          <span class="user-name">{{ user.fullName }}</span>
          <button class="btn logout-btn" @click="logout">Logout</button>
        </template>

        <template v-else>
          <router-link class="btn login-btn" to="/login">Login</router-link>
          <router-link class="btn register-btn" to="/register">Register</router-link>
        </template>
      </div>

      <button class="mobile-toggle" @click="menuOpen = !menuOpen">☰</button>
    </div>

    <!-- MOBILE MENU -->
    <div v-if="menuOpen" class="mobile-menu">
      <ul class="text-center">
        <li v-for="route in leftRoutes" :key="route.name" >
          <router-link :to="route.path" class="nav-link">
            {{ route.name }}
          </router-link>
        </li>
        <li v-if="user">
          <router-link to="/profile" class="nav-link">Profil</router-link>
        </li>
        <li v-if="user">
          <router-link to="/messages" class="nav-link">Poruke</router-link>
        </li>
      </ul>

      <div class="mobile-auth">
        <template v-if="user" >
          <div class="d-flex align-items-center gap-3">
            <img :src="avatarUrl" class="nav-avatar" />
            <span class="user-name">{{ user.fullName }}</span>
          </div>
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
import { ref, computed, onBeforeUnmount } from 'vue';
import { defineProps, defineEmits } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps({
  user: Object
});
const emit = defineEmits(['logout']);

const router = useRouter();
const menuOpen = ref(false);

// Rute bez profila
const leftRoutes = [
  { path: '/', name: 'Početna' },
  { path: '/services', name: 'Usluge' },
];

// Avatar prikaz (Base64)
const avatarUrl = computed(() => {
  if (props.user?.avatar?.data) {
    const base64 = btoa(
      new Uint8Array(props.user.avatar.data.data)
        .reduce((data, byte) => data + String.fromCharCode(byte), "")
    );
    return `data:image/jpeg;base64,${base64}`;
  }
  return "/img/default-avatar.png"; // default slika
});

// Logout
function logout() {
  localStorage.removeItem('token');
  emit('logout');
  router.push('/login');
}

let intervalId = null;
onBeforeUnmount(() => clearInterval(intervalId));
</script>


<style scoped>
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

.logo img {
  width: 150px;
}

.nav-links {
  display: flex;
  gap: 2rem;
  list-style: none;
}

.nav-link {
  text-decoration: none;
  color: var(--color-blue-dark);
  font-weight: 500;
  transition: color 0.3s;
  font-size: 18px;
}
.nav-link:hover {
  color: var(--color-blue);
}

.auth-buttons {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-name {
  font-weight: 500;
  color: #333;
}

.nav-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
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
  border: 1px solid var(--color-blue);
  color: var(--color-blue);
  font-size: 18px;
}
.login-btn:hover {
  background: var(--color-blue);
  color: #fff;
}

.register-btn {
  background: var(--color-orange);
  color: #fff;
  font-size: 18px;
}
.register-btn:hover {
  border: 1px solid var(--color-orange-hover);
  background: #fff;
  color: var(--color-orange-hover);
}

.logout-btn {
  background: #dc3545;
  color: #fff;
}
.logout-btn:hover {
  background: #b52a37;
}

.mobile-toggle {
  display: none;
  font-size: 1.5rem;
  background: none;
  border: none;
  cursor: pointer;
}

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

/* Responsive */
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

<template>
  <div>
    <Navbar :user="user" @logout="handleLogout" />
    <router-view :user="user" @update-user="updateUser" />
    <!-- <p>app stranica: {{ user ? user.fullName : 'Nema usera' }}</p> -->
    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import Navbar from './components/Navbar.vue';
import Footer from './components/Footer.vue';
import { useUserStore } from './store/user'


const user = ref(null);


const userStore = useUserStore();

const loadUser = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return;

    const res = await axios.get('/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    user.value = res.data.user;
    userStore.user = res.data.user;

    console.log('User loaded:', {
      fullName: user.value.fullName,
      email: user.value.email,
      phone: user.value.phone,
      city: user.value.city
    });
  } catch (err) {
    console.error('Error loading user:', err);
    user.value = null;
    userStore.user = null;
  }
};


onMounted(loadUser);

function handleLogout() {
  localStorage.removeItem('token');
  user.value = null;
}

function updateUser(newUser) {
  user.value = newUser;
}
</script>

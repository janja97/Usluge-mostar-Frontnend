<template>
  <div>
    <Navbar :user="user" @logout="handleLogout" />
    <router-view :user="user" @update-user="updateUser" />
    <p>app stranica: {{ user ? user.fullName : 'Nema usera' }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import Navbar from './components/Navbar.vue';

const user = ref(null);

// dohvat usera prilikom mountanja aplikacije
const loadUser = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return; // ako nema tokena, nema prijavljenog usera

    const res = await axios.get('/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    user.value = res.data.user;

    // ispis osnovnih podataka u konzolu
    console.log('User loaded:', {
      fullName: user.value.fullName,
      email: user.value.email,
      phone: user.value.phone,
      city: user.value.city
    });
  } catch (err) {
    console.error('Error loading user:', err);
    user.value = null;
  }
};

onMounted(loadUser);

// kada user logouta
function handleLogout() {
  localStorage.removeItem('token');
  user.value = null;
}

// kada child komponenta (Profile) dohvaća usera
function updateUser(newUser) {
  user.value = newUser;
}
</script>

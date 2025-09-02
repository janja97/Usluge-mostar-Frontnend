<template>
  <div>
    <h2>Profile</h2>
    <div v-if="user">
      <p><strong>{{ user.fullName }}</strong></p>
      <p>{{ user.email }}</p>
      <p>{{ user.phone }}</p>
      <p>{{ user.city }}</p>
      <button @click="logout">Logout</button>
    </div>
    <p v-else>Loading...</p>
  </div>
</template>

<script>
import axios from 'axios';
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

export default {
  setup(){
    const user = ref(null);
    const router = useRouter();

    const loadMe = async () => {
      try {
        const res = await axios.get('/auth/me');
        user.value = res.data.user;
      } catch (e) {
        console.error(e);
      }
    };

    const logout = () => {
      localStorage.removeItem('token');
      router.push('/login');
    };

    onMounted(loadMe);
    return { user, logout };
  }
}
</script>

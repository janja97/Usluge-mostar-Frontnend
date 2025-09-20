<template>
  <div class="login-page d-flex justify-content-center align-items-center">
    <div class="login-form p-4 rounded shadow">
      <h2 class="text-center mb-4">Prijava</h2>

      <form @submit.prevent="login">
        <!-- Email input -->
        <input
          v-model="email"
          type="email"
          placeholder="Email"
          required
          class="form-control mb-3"
        />

        <!-- Password input -->
        <input
          v-model="password"
          type="password"
          placeholder="Lozinka"
          required
          class="form-control mb-3"
        />

        <!-- Submit button -->
        <button type="submit" class="btn btn-primary w-100 mb-3">Prijavi se</button>

        <!-- Error message -->
        <p v-if="error" class="text-danger text-center">{{ error }}</p>
      </form>

      <p class="text-center mt-2">
        Nemate račun? 
        <router-link to="/register">Registrirajte se</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const emit = defineEmits(['update-user'])

const email = ref('')
const password = ref('')
const error = ref('')

const router = useRouter()

const login = async () => {
  error.value = ''
  try {
    // Login request
    const res = await axios.post('http://localhost:5000/api/auth/login', {
      email: email.value,
      password: password.value
    })

    localStorage.setItem('token', res.data.token)

    const userRes = await axios.get('http://localhost:5000/api/auth/me', {
      headers: { Authorization: `Bearer ${res.data.token}` }
    })

    emit('update-user', userRes.data.user)

    router.push('/')
  } catch (e) {
    error.value = e.response?.data?.message || 'Prijava nije uspjela'
  }
}
</script>

<style scoped>
.login-page {
  min-height: calc(100vh - 80px); 
  background: var(--bg-dark-blue);
}

.login-form {
  width: 100%;
  max-width: 400px;
  background: #fff;
}

.form-control {
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: 1px solid #ccc;
}

.btn-primary {
  background: var(--color-orange);
  border: none;
}

.btn-primary:hover {
  background: var(--color-orange-hover);
}
</style>

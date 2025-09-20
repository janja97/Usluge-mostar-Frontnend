<template>
  <div class="register-page d-flex justify-content-center align-items-center">
    <div class="register-form p-4 rounded shadow">
      <h2 class="text-center mb-4">Registracija</h2>

      <form @submit.prevent="register">
        <!-- Name input -->
        <input
          v-model="name"
          type="text"
          placeholder="Ime i prezime"
          required
          class="form-control mb-3"
        />

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

        <!-- Confirm password input -->
        <input
          v-model="confirmPassword"
          type="password"
          placeholder="Potvrdi lozinku"
          required
          class="form-control mb-3"
        />

        <!-- Submit button -->
        <button type="submit" class="btn btn-primary w-100 mb-3">Registriraj se</button>

        <!-- Error message -->
        <p v-if="error" class="text-danger text-center">{{ error }}</p>
      </form>

      <p class="text-center mt-2">
        Već imate račun? 
        <router-link to="/login">Prijavite se</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const emit = defineEmits(['update-user'])

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')

const router = useRouter()

const register = async () => {
  error.value = ''

  if (password.value !== confirmPassword.value) {
    error.value = 'Lozinke se ne podudaraju'
    return
  }

  try {
    const res = await axios.post('http://localhost:5000/api/auth/register', {
      fullName: name.value,
      email: email.value,
      password: password.value
    })

    localStorage.setItem('token', res.data.token)

    const userRes = await axios.get('http://localhost:5000/api/auth/me', {
      headers: { Authorization: `Bearer ${res.data.token}` }
    })

    emit('update-user', userRes.data.user)

    router.push('/complete-profile')
  } catch (e) {
    error.value = e.response?.data?.message || 'Registracija nije uspjela'
  }
}
</script>

<style scoped>
.register-page {
  min-height: calc(100vh - 80px);
  background: var(--bg-dark-blue);
}

.register-form {
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

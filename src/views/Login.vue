<template>
  <div>
    <h2>Login</h2>
    <form @submit.prevent="login">
      <!-- Email input -->
      <input 
        v-model="email" 
        placeholder="Email" 
        type="email" 
        required 
      />

      <!-- Password input -->
      <input 
        v-model="password" 
        placeholder="Password" 
        type="password" 
        required 
      />

      <!-- Submit button -->
      <button type="submit">Login</button>
    </form>

    <!-- Error message -->
    <p v-if="error" style="color:red">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

// Reactive state variables
const email = ref('')
const password = ref('')
const error = ref('')

// Vue Router instance
const router = useRouter()

// Login function
const login = async () => {
  error.value = '' // reset error before new attempt
  try {
    // Send POST request to backend API
    const res = await axios.post('http://localhost:5000/api/auth/login', { 
      email: email.value, 
      password: password.value 
    })

    // Save JWT token in localStorage
    localStorage.setItem('token', res.data.token)

    // Redirect to profile page after successful login
    router.push('/profile')
  } catch (e) {
    // Catch error and show message from backend or fallback
    error.value = e.response?.data?.message || 'Login failed'
  }
}
</script>

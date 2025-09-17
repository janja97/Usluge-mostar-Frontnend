<template>
  <div>
    <h2>Register</h2>
    <form @submit.prevent="register">
      <!-- Name input -->
      <input 
        v-model="name" 
        placeholder="Name" 
        type="text" 
        required 
      />

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

      <!-- Confirm password input -->
      <input 
        v-model="confirmPassword" 
        placeholder="Confirm Password" 
        type="password" 
        required 
      />

      <!-- Submit button -->
      <button type="submit">Register</button>
    </form>

    <!-- Error message -->
    <p v-if="error" style="color:red">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

// Reactive state
const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')

// Vue Router instance
const router = useRouter()

// Register function
const register = async () => {
  error.value = ''

  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match'
    return
  }

  try {
    console.log('Pripremam podatke za slanje:', { fullName: name.value, email: email.value, password: password.value });

    // Send POST request to backend API
    const res = await axios.post('http://localhost:5000/api/auth/register', {
      fullName: name.value,
      email: email.value,
      password: password.value
    });

    console.log('Odgovor backend-a:', res.data);

    // Save JWT token in localStorage
    localStorage.setItem('token', res.data.token)

    // Redirect to profile page after successful register
    router.push('/complete-profile')
  } catch (e) {
    console.error('Greška prilikom registracije:', e.response?.data || e)
    error.value = e.response?.data?.message || 'Registration failed'
  }
}
</script>

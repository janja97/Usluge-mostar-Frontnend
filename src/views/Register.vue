<template>
  <form @submit.prevent="registerUser">
    <input v-model="fullName" placeholder="Full Name" />
    <input v-model="email" placeholder="Email" />
    <input v-model="password" type="password" placeholder="Password" />
    <button type="submit">Register</button>
  </form>
</template>

<script>
import axios from 'axios'

export default {
  data() {
    return {
      fullName: '',
      email: '',
      password: ''
    }
  },
  methods: {
    async registerUser() {
      try {
        const res = await axios.post('http://localhost:5000/api/auth/register', {
          fullName: this.fullName,
          email: this.email,
          password: this.password
        })
        console.log(res.data)
      } catch (err) {
        console.error(err)
      }
    }
  }
}
</script>

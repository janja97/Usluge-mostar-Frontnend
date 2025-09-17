<template>
  <div class="container mt-5">
    <h2>Complete Your Profile</h2>
    <form @submit.prevent="submitProfile" class="row g-3">
      <!-- Osnovni podaci -->
      <div class="col-md-6"><label class="form-label">Ime</label><input v-model="form.firstName" type="text" class="form-control" /></div>
      <div class="col-md-6"><label class="form-label">Prezime</label><input v-model="form.lastName" type="text" class="form-control" /></div>
      <div class="col-md-4"><label class="form-label">Godište</label><input v-model="form.birthYear" type="number" class="form-control" /></div>
      <div class="col-md-8"><label class="form-label">Struka</label><input v-model="form.profession" type="text" class="form-control" /></div>
      <div class="col-md-6"><label class="form-label">Grad</label><input v-model="form.city" type="text" class="form-control" /></div>
      <div class="col-md-6"><label class="form-label">Telefon</label><input v-model="form.phone" type="text" class="form-control" /></div>
      <div class="col-12"><label class="form-label">Email</label><input v-model="form.email" type="email" class="form-control" readonly /></div>

      <!-- Više usluga koristeći komponentu -->
      <div class="col-12">
        <h4>Usluge</h4>
        <ServiceItem
          v-for="(s, index) in services"
          :key="index"
          :initialData="s"
          @update="updateService($event, index)"
          @remove="removeService(index)"
        />
        <button type="button" class="btn btn-outline-primary mt-2" @click="addService">Dodaj novu uslugu</button>
      </div>

      <div class="col-12">
        <button type="submit" class="btn btn-primary">Spremi</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { reactive, onMounted } from 'vue'
import api from '../services/api'
import { useRouter } from 'vue-router'
import ServiceItem from '../components/ServiceItem.vue'


const router = useRouter()

const form = reactive({
  firstName: '',
  lastName: '',
  birthYear: '',
  profession: '',
  city: '',
  phone: '',
  email: ''
})

const services = reactive([])

// Popuni email iz backend-a
onMounted(async () => {
  try {
    const res = await api.get('/auth/me')
    if (res.data?.user?.email) form.email = res.data.user.email
  } catch (err) {
    console.error('Greška kod učitavanja korisnika:', err.response?.data || err)
  }
})

// Dodaj novu praznu uslugu
const addService = () => services.push({ service: '', customService: '', priceType: '', priceAmount: '' })
const removeService = (index) => services.splice(index, 1)
const updateService = (data, index) => services[index] = { ...data }

// Submit forme
const submitProfile = async () => {
  try {
    // Spremi osnovne podatke
    const userPayload = { ...form }
    await api.put('/users/profile', userPayload)

    // Spremi usluge
    if (services.length > 0) {
      await api.post('/services', { services: services })
    }

    router.push('/profile')
  } catch (err) {
    console.error('Greška kod spremanja profila:', err.response?.data || err)
  }
}
</script>

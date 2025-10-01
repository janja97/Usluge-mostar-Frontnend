<template>
  <div class="container py-5 bg-light-gray rounded-3">
    <h2 class="page-title">Complete Your Profile</h2>

    <!-- Profile form -->
    <form @submit.prevent="submitProfile" class="row g-3">
      <!-- Basic info fields -->
      <div class="col-md-6">
        <label class="form-label">Ime</label>
        <input v-model="form.firstName" type="text" class="form-control" maxlength="50" />
      </div>
      <div class="col-md-6">
        <label class="form-label">Prezime</label>
        <input v-model="form.lastName" type="text" class="form-control" maxlength="50" />
      </div>
      <div class="col-md-4">
        <label class="form-label">Godište</label>
        <select v-model="form.birthYear" class="form-control">
          <option disabled value="">Odaberite godinu</option>
          <!-- Generate list of years dynamically -->
          <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
        </select>
      </div>
      <div class="col-md-8">
        <label class="form-label">Struka</label>
        <input v-model="form.profession" type="text" class="form-control" maxlength="100" />
      </div>
      <div class="col-md-6">
        <label class="form-label">Grad</label>
        <input v-model="form.city" type="text" class="form-control" maxlength="100" />
      </div>
      <div class="col-md-6">
        <label class="form-label">Telefon</label>
        <input 
          v-model="form.phone" 
          type="tel" 
          class="form-control" 
          maxlength="20"
          pattern="[0-9+\-\s]*" <!-- Allow numbers, +, -, and spaces -->
          placeholder="+387 63 123 456"
        />
      </div>
      <div class="col-12">
        <label class="form-label">Email</label>
        <!-- Email is read-only, fetched from backend -->
        <input v-model="form.email" type="email" class="form-control" readonly />
      </div>

      <!-- About me section -->
      <div class="col-12">
        <label class="form-label">O meni</label>
        <textarea 
          v-model="form.about" 
          class="form-control" 
          rows="4" 
          maxlength="500"
          placeholder="Napišite nešto o sebi..."
        ></textarea>
      </div>

      <!-- Services section (currently commented out) -->
      <!-- 
      <div class="col-12">
        <h4 class="section-title">Usluge</h4>
        <ServiceItem
          v-for="(s, index) in services"
          :key="index"
          :initialData="s"
          @update="updateService($event, index)"
          @remove="removeService(index)"
        />
        <button 
          type="button" 
          class="btn btn-outline-blue mt-3" 
          @click="addService"
        >
          + Dodaj novu uslugu
        </button>
      </div> 
      -->

      <!-- Submit button -->
      <div class="col-12 text-center mt-4">
        <button type="submit" class="btn btn-orange px-5">💾 Spremi</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { reactive, onMounted, ref } from 'vue'
import api from '../services/api'
import { useRouter } from 'vue-router'
import ServiceItem from '../components/ServiceItem.vue'

const router = useRouter()

// Generate a list of years (last 100 years starting from current year)
const currentYear = new Date().getFullYear()
const years = ref([])
for (let i = 0; i < 100; i++) {
  years.value.push(currentYear - i)
}

// Reactive object for form fields
const form = reactive({
  firstName: '',
  lastName: '',
  birthYear: '',
  profession: '',
  city: '',
  phone: '',
  email: '',
  about: ''
})

// Reactive array for services (if user adds multiple services)
const services = reactive([])

// Fetch current logged-in user when component is mounted
onMounted(async () => {
  try {
    const res = await api.get('/auth/me')
    if (res.data?.user?.email) form.email = res.data.user.email
  } catch (err) {
    console.error('Error loading user:', err.response?.data || err)
  }
})

// Add new service to the list
const addService = () => services.push({ service: '', customService: '', priceType: '', priceAmount: '' })

// Remove service by index
const removeService = (index) => services.splice(index, 1)

// Update specific service at given index
const updateService = (data, index) => services[index] = { ...data }

// Submit profile data to backend
const submitProfile = async () => {
  try {
    // Send user profile data
    const userPayload = { ...form }
    await api.put('/users/profile', userPayload)

    // If services exist, send them separately
    if (services.length > 0) {
      await api.post('/services', { services: services })
    }

    // Redirect user to profile page after successful save
    router.push('/profile')
  } catch (err) {
    console.error('Error saving profile:', err.response?.data || err)
  }
}
</script>

<style scoped>
.page-title {
  text-align: center;
  font-size: 2rem;
  font-weight: bold;
  color: var(--color-dark-blue);
  margin-bottom: 2rem;
}

.section-title {
  color: var(--color-gray);
  margin-top: 1rem;
}

/* Gray background wrapper */
.bg-light-gray {
  background-color: var(--color-light-gray);
  padding: 2rem;
}

/* Primary orange button */
.btn-orange {
  background-color: var(--color-orange);
  color: var(--color-text-light);
  border: none;
}
.btn-orange:hover {
  background-color: var(--color-orange-hover);
}

/* Secondary outlined blue button */
.btn-outline-blue {
  border: 2px solid var(--color-blue);
  color: var(--color-blue);
  background: transparent;
}
.btn-outline-blue:hover {
  background-color: var(--color-light-blue);
  color: var(--color-text-light);
}
</style>

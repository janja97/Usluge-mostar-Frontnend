<template>
  <div class="container py-5 bg-light-gray rounded-3">
    <h2 class="page-title">Complete Your Profile</h2>

    <!-- Profile form -->
    <form @submit.prevent="submitProfile" class="row g-3" enctype="multipart/form-data">
      <!-- Profile image upload -->
      <div class="col-12 text-center">
        <div class="avatar-upload">
          <label for="avatarInput" class="form-label fw-bold">Profilna slika</label>
          <div class="avatar-preview" v-if="previewUrl">
            <img :src="previewUrl" alt="Preview" class="rounded-circle shadow" />
          </div>
          <input 
            type="file" 
            id="avatarInput"
            accept="image/*"
            class="form-control mt-2"
            @change="handleImageUpload"
          />
        </div>
      </div>

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
          pattern="[0-9+\-\s]*"
          placeholder="+387 63 123 456"
        />
      </div>
      <div class="col-12">
        <label class="form-label">Email</label>
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

const router = useRouter()

// Lista godina
const currentYear = new Date().getFullYear()
const years = ref(Array.from({ length: 100 }, (_, i) => currentYear - i))

// Reactive objekt za formu
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

// Slika (upload)
const avatarFile = ref(null)
const previewUrl = ref(null)

// Kada korisnik odabere sliku
const handleImageUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    avatarFile.value = file
    previewUrl.value = URL.createObjectURL(file)
  }
}

// Dohvati user email prilikom mountanja
onMounted(async () => {
  try {
    const res = await api.get('/auth/me')
    if (res.data?.user?.email) form.email = res.data.user.email
  } catch (err) {
    console.error('Error loading user:', err.response?.data || err)
  }
})

// Submit profila
const submitProfile = async () => {
  try {
    const formData = new FormData()
    formData.append('fullName', `${form.firstName} ${form.lastName}`)
    formData.append('birthYear', form.birthYear)
    formData.append('profession', form.profession)
    formData.append('city', form.city)
    formData.append('phone', form.phone)
    formData.append('about', form.about)

    if (avatarFile.value) {
      formData.append('avatar', avatarFile.value)
    }

    await api.put('/users/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

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

.bg-light-gray {
  background-color: var(--color-light-gray);
  padding: 2rem;
}

.avatar-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1.5rem;
}

.avatar-preview img {
  width: 130px;
  height: 130px;
  object-fit: cover;
  border-radius: 50%;
  border: 3px solid var(--color-orange);
  margin-bottom: 10px;
}

.btn-orange {
  background-color: var(--color-orange);
  color: var(--color-text-light);
  border: none;
}
.btn-orange:hover {
  background-color: var(--color-orange-hover);
}
</style>

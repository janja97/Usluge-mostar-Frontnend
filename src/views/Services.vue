<template>
  <div v-if="pageReady" class="services-page container py-5">
    <ServiceFilters 
      :initial-search="searchQuery"
      :initial-category="selectedCategory"
      :initial-min-price="minPrice"
      :initial-max-price="maxPrice"
      :initial-price-sort="priceSort"
      @update:filter="updateFilter"
    />

    <ServicesList 
      :services="filteredServices"
      :favorites="favorites"
      @toggle-favorite="toggleFavorite"
    />
  </div>

  <div v-else class="text-center py-5">
    <div class="spinner-border text-primary" role="status"></div>
    <p class="mt-3">Učitavanje podataka...</p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import api from '../services/api'
import { useUserStore } from '../store/user'
import ServiceFilters from '../components/Services/ServiceFilters.vue'
import ServicesList from '../components/Services/ServicesList.vue'

const userStore = useUserStore()
const user = computed(() => userStore.user)

const services = ref([])
const favorites = ref([]) 
const pageReady = ref(false)

const searchQuery = ref('')
const selectedCategory = ref(null)
const minPrice = ref(null)
const maxPrice = ref(null)
const priceSort = ref('')

// ------------------- Load all services -------------------
const loadServices = async () => {
  try {
    const res = await api.get('/services')
    services.value = Array.isArray(res.data) ? res.data : []
  } catch (err) {
    console.error('❌ Error loading services:', err)
    services.value = []
  }
}

// ------------------- Load favorites for logged-in user -------------------
const loadFavorites = async () => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      favorites.value = []
      return
    }

    const res = await api.get('/favorites', {
      headers: { Authorization: `Bearer ${token}` },
    })
    favorites.value = Array.isArray(res.data) ? res.data : []
  } catch (err) {
    console.error('❌ Error loading favorites:', err)
    favorites.value = []
  }
}

// ------------------- Filter + sort (unchanged) -------------------
const filteredServices = computed(() => {
  let filtered = services.value

  if (searchQuery.value)
    filtered = filtered.filter(s =>
      (s.customService || s.subcategory || '').toLowerCase().includes(searchQuery.value.toLowerCase())
    )

  if (selectedCategory.value)
    filtered = filtered.filter(s => s.category === selectedCategory.value)

  if (minPrice.value !== null) filtered = filtered.filter(s => s.price >= minPrice.value)
  if (maxPrice.value !== null) filtered = filtered.filter(s => s.price <= maxPrice.value)

  if (priceSort.value === 'asc') filtered = filtered.slice().sort((a, b) => a.price - b.price)
  else if (priceSort.value === 'desc') filtered = filtered.slice().sort((a, b) => b.price - a.price)

  return filtered
})

// ------------------- Update filters -------------------
const updateFilter = ({ search, category, minPrice: min, maxPrice: max, priceSort: sort }) => {
  searchQuery.value = search
  selectedCategory.value = category
  minPrice.value = min
  maxPrice.value = max
  priceSort.value = sort
}

/*
  toggleFavorite:
  - optimistic local update so UI reacts immediately
  - emit API call to update backend
  - once API responds, reconcile favorites *in-place* (mutating same array object)
*/
const toggleFavorite = async (serviceId) => {
  if (!user.value) {
    alert('Morate biti prijavljeni da biste dodali favorite.')
    return
  }

  // ------------------- Optimistic local change -------------------
  const index = favorites.value.findIndex(fav => fav._id === serviceId)
  if (index !== -1) {
    // remove favorite locally
    favorites.value.splice(index, 1)
  } else {
    // add service object locally (find in services list)
    const service = services.value.find(s => s._id === serviceId)
    if (service) {
      favorites.value.push(service)
    }
  }

  // ------------------- API call -------------------
  try {
    const res = await api.post(`/favorites/${serviceId}`)
    const updatedFavorites = Array.isArray(res.data.favorites) ? res.data.favorites : []

    // ------------------- Reconcile favorites IN-PLACE to avoid reference replacement -------------------
    favorites.value.splice(0, favorites.value.length, ...updatedFavorites)
  } catch (err) {
    // on error, just log (could also revert optimistic change if desired)
    console.error('❌ Error updating favorites:', err)
  }
}

// Watch user changes to reload favorites
watch(user, () => loadFavorites(), { immediate: true })

onMounted(async () => {
  // load favorites and services first
  await Promise.all([loadFavorites(), loadServices()])

  pageReady.value = true
})
</script>

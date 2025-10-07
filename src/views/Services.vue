<template>
  <div class="services-page container py-5">
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

const searchQuery = ref('')
const selectedCategory = ref(null)
const minPrice = ref(null)
const maxPrice = ref(null)
const priceSort = ref('')

// --- Load all services
const loadServices = async () => {
  try {
    const res = await api.get('/services')
    services.value = Array.isArray(res.data) ? res.data : []
  } catch (err) {
    console.error('Error loading services:', err)
    services.value = []
  }
}

// --- Load favorites for logged-in user
const loadFavorites = async () => {
  if (!user.value) return
  try {
    const res = await api.get('/favorites') // backend ruta
    favorites.value = res.data.favorites || []
  } catch (err) {
    console.error('Error loading favorites:', err)
  }
}

// --- Filter + sort
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

// --- Update filters from child component
const updateFilter = ({ search, category, minPrice: min, maxPrice: max, priceSort: sort }) => {
  searchQuery.value = search
  selectedCategory.value = category
  minPrice.value = min
  maxPrice.value = max
  priceSort.value = sort
}

// --- Toggle favorite
const toggleFavorite = async (serviceId) => {
  if (!user.value) {
    alert('Morate biti prijavljeni da biste dodali favorite.')
    return
  }

  try {
    const res = await api.post(`/favorites/${serviceId}`) // backend ruta
    favorites.value = res.data.favorites || []
  } catch (err) {
    console.error('Error toggling favorite:', err)
  }
}

// --- Watch user changes
watch(user, () => loadFavorites())

onMounted(() => {
  loadServices()
  if (user.value) loadFavorites()
})
</script>

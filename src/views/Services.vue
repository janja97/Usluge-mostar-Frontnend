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
import { ref, computed, onMounted } from 'vue'
import api from '../services/api'
import ServiceFilters from '../components/Services/ServiceFilters.vue'
import ServicesList from '../components/Services/ServicesList.vue'

const services = ref([])
const searchQuery = ref('')
const selectedCategory = ref(null)
const minPrice = ref(null)
const maxPrice = ref(null)
const priceSort = ref('') // asc / desc
const favorites = ref([])

// LOAD ALL SERVICES FROM BACKEND
const loadServices = async () => {
  try {
    const res = await api.get('/services') // backend returns all
    services.value = Array.isArray(res.data) ? res.data : []
  } catch (err) {
    console.error('Error loading services:', err)
    services.value = []
  }
}

// FRONTEND FILTER + SORT
const filteredServices = computed(() => {
  let filtered = services.value

  // Search filter
  if (searchQuery.value) {
    filtered = filtered.filter(s => {
      const name = s.customService || s.subcategory || ''
      return name.toLowerCase().includes(searchQuery.value.toLowerCase())
    })
  }

  // Category filter
  if (selectedCategory.value) {
    filtered = filtered.filter(s => s.category === selectedCategory.value)
  }

  // Min/Max price
  if (minPrice.value !== null) filtered = filtered.filter(s => s.price >= minPrice.value)
  if (maxPrice.value !== null) filtered = filtered.filter(s => s.price <= maxPrice.value)

  // Sort by price
  if (priceSort.value === 'asc') filtered = filtered.slice().sort((a,b) => a.price - b.price)
  else if (priceSort.value === 'desc') filtered = filtered.slice().sort((a,b) => b.price - a.price)

  return filtered
})

// Update filters from child component
const updateFilter = ({ search, category, minPrice: min, maxPrice: max, priceSort: sort }) => {
  searchQuery.value = search
  selectedCategory.value = category
  minPrice.value = min
  maxPrice.value = max
  priceSort.value = sort
}

const toggleFavorite = (id) => {
  if (favorites.value.includes(id)) {
    favorites.value = favorites.value.filter(f => f !== id)
  } else {
    favorites.value.push(id)
  }
}

onMounted(() => loadServices())
</script>

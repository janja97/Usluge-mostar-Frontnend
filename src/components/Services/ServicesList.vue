<template>
  <div class="services-list">
    <div v-if="loading" class="loader-container">
      <div class="spinner"></div>
      <p>Učitavanje...</p>
    </div>

    <div v-else-if="!services.length" class="no-services text-center">
      <img src="/img/home/garden.png" alt="No services" class="no-services-img" />
      <h5 class="mt-3">Trenutno nema dostupnih usluga</h5>
    </div>

    <div v-else>
      <div
        v-for="service in paginatedServices"
        :key="service._id"
        class="service-row d-flex align-items-center mb-3 p-3 border rounded"
        @click="goToService(service._id)"
      >
        <div class="service-image-wrapper me-3">
          <img
            v-if="getServiceImage(service)"
            :src="getServiceImage(service)"
            alt="Service image"
            class="service-image"
          />
          <div v-else class="service-placeholder"></div>
        </div>

        <div class="service-info flex-grow-1">
          <h5 class="mb-1">{{ service.customService || service.subcategory || 'Usluga' }}</h5>
          <p class="mb-1 text-muted">Kategorija: {{ service.category }}</p>
          <p class="mb-0 fw-semibold">
            {{ service.priceType === 'dogovor' ? 'Po dogovoru' : service.price + ' BAM / ' + service.priceType }}
          </p>
          <p class="mb-0">{{ truncateDescription(service.description) }}</p>

        </div>

        <button 
          v-if="isLoggedIn" 
          class="btn-favorite ms-3" 
          @click.stop="onToggleFavorite(service._id)"
        >
          <i :class="isFavorite(service._id) ? 'bi bi-heart-fill text-danger' : 'bi bi-heart'"></i>
        </button>
      </div>

      <div v-if="totalPages > 1" class="pagination-container mt-4">
        <button 
          class="page-btn" 
          :disabled="currentPage === 1"
          @click="currentPage--"
        >
          ‹
        </button>

        <span 
          v-for="page in totalPages" 
          :key="page" 
          @click="goToPage(page)"
          class="page-dot"
          :class="{ active: page === currentPage }"
        ></span>

        <button 
          class="page-btn" 
          :disabled="currentPage === totalPages"
          @click="currentPage++"
        >
          ›
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, ref, computed, onMounted, watch, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../store/user'
import categoriesData from '../../data/services.json' 

const props = defineProps({
  services: Array,
  favorites: Array
})
const emit = defineEmits(['toggle-favorite'])

const router = useRouter()
const userStore = useUserStore()
const isLoggedIn = computed(() => !!userStore.user)

const loading = ref(true)

// ------------------- local reactive map of favorite ids -------------------
const localFavMap = reactive({}) // { [id]: true }
const syncLocalFavMap = (favArray) => {
  // Clear existing keys (mutate in-place)
  for (const k in localFavMap) {
    if (Object.prototype.hasOwnProperty.call(localFavMap, k)) delete localFavMap[k]
  }
  // Set new keys
  if (Array.isArray(favArray)) {
    // favArray may contain objects with _id or may be array of ids.
    for (const f of favArray) {
      const id = (f && f._id) ? f._id : f
      if (id) localFavMap[id] = true
    }
  }
}

// Watch incoming props.favorites and sync into localFavMap (in-place mutation)
watch(
  () => props.favorites,
  (newVal) => {
    syncLocalFavMap(newVal)
  },
  { immediate: true, deep: true }
)

// ------------------- pagination + helpers (unchanged) -------------------
const currentPage = ref(1)
const perPage = 6
const totalPages = computed(() => Math.ceil((props.services || []).length / perPage))
const paginatedServices = computed(() => {
  const start = (currentPage.value - 1) * perPage
  return (props.services || []).slice(start, start + perPage)
})
const goToPage = (page) => {
  currentPage.value = page
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const goToService = (id) => {
  router.push(`/service/${id}`)
}

// ------------------- toggle favorite flow in child -------------------
/*
  onToggleFavorite:
  - optimistically flip the local state for the single id (no re-creation)
  - emit to parent to perform backend update & parent optimistic change
  - parent will update props.favorites, which will trigger the watch above to reconcile localFavMap
*/
const onToggleFavorite = (id) => {
  if (!isLoggedIn.value) return

  // Optimistically flip only this id in-place
  if (localFavMap[id]) {
    delete localFavMap[id]
  } else {
    localFavMap[id] = true
  }


  // emit to parent to actually toggle (parent will call API)
  emit('toggle-favorite', id)
}

// isFavorite reads localFavMap (fast, local, and in-place)
const isFavorite = (id) => {
  return !!localFavMap[id]
}

// ------------------- other helpers (unchanged) -------------------
const truncateDescription = (desc) => {
  if (!desc) return ''
  return desc.length > 50 ? desc.substring(0, 50) + '...' : desc
}

const getServiceImage = (service) => {
  if (service.images && service.images.length) {
    return 'data:image/jpeg;base64,' + service.images[0]
  }
  const category = categoriesData.find(
    (cat) => cat.category.toLowerCase() === service.category.toLowerCase()
  )
  return category ? category.image : null
}

onMounted(() => {
  setTimeout(() => (loading.value = false), 300)
})
</script>

<style scoped>

/* Loader */
.loader-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 0;
}
.spinner {
  border: 4px solid var(--color-light-gray);
  border-top: 4px solid var(--color-blue);
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  margin-bottom: 0.5rem;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.no-services {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 0;
}
.no-services-img {
  width: 180px;
  opacity: 0.8;
}

.service-row {
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: box-shadow 0.3s;
}
.service-row:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
.service-image-wrapper {
  width: 100px;
  height: 100px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}
.service-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.service-placeholder {
  width: 100%;
  height: 100%;
  background-color: var(--color-light-gray);
  border-radius: 8px;
}
.service-info h5 {
  font-size: 1.1rem;
}
.service-info p {
  font-size: 0.9rem;
  margin: 2px 0;
}
.btn-favorite {
  border: none;
  background: none;
  font-size: 1.5rem;
  cursor: pointer;
}

/* PAGINATION */
.pagination-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
}
.page-btn {
  border: none;
  background: none;
  font-size: 1.2rem;
  color: var(--color-gray);
  cursor: pointer;
  padding: 4px 8px;
  transition: color 0.2s;
}
.page-btn:hover:not(:disabled) {
  color: var(--color-dark-blue-hover);
}
.page-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
.page-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: var(--color-light-gray);
  display: inline-block;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s;
}
.page-dot:hover {
  background-color: var(--color-dark-blue-hover);
  transform: scale(1.2);
}
.page-dot.active {
  background-color: var(--color-blue);
  transform: scale(1.3);
}

@media (max-width: 600px) {
  .service-row {
    flex-direction: column;
    text-align: center;
  }
  .service-image-wrapper {
    margin-bottom: 1rem;
  }
}
</style>

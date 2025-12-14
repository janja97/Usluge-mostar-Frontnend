<template>
  <div class="services-list container-fluid py-4">
    <div v-if="loading" class="d-flex justify-content-center align-items-center min-vh-75">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="mt-3 ms-2">Učitavanje podataka...</p>
    </div>

    <div v-else-if="!services.length" class="no-services text-center">
      <img src="/img/home/garden.png" alt="No services" class="no-services-img" />
      <h5 class="mt-3">Trenutno nema dostupnih usluga</h5>
      <p class="text-muted">Pokušajte promijeniti filtere.</p>
    </div>

    <div v-else>
      <div
        v-for="service in paginatedServices"
        :key="service._id"
        class="service-row-card"
        @click="goToService(service._id)"
      >
        <div class="service-image-wrapper me-3">
          <img
            v-if="getServiceImage(service)"
            :src="getServiceImage(service)"
            :alt="'Slika usluge: ' + (service.customService || service.subcategory || service.category)"
            class="service-image"
          />
          <div v-else class="service-placeholder">
            <i class="bi bi-gear-wide-connected placeholder-icon"></i>
          </div>
        </div>

        <div class="service-info flex-grow-1">
          <span 
            class="mode-badge-row" 
            :class="{ 
              'badge-offer': service.mode === 'offer', 
              'badge-demand': service.mode === 'demand' 
            }"
          >
            {{ 
              service.mode === 'offer' 
                ? 'PONUDA' 
                : service.mode === 'demand' 
                  ? 'POTRAŽNJA' 
                  : 'USLUGA' 
            }}
          </span>

          <h5 class="service-title-row mt-1 mb-1">
            {{ service.customService || service.subcategory || service.category }}
          </h5>

          <p class="service-price-row fw-semibold mb-1">
            <i class="bi bi-cash me-1"></i> 
            <span v-if="service.priceType === 'dogovor'">Po dogovoru</span>
            <span v-else>{{ formatPrice(service.price, service.priceType) }}</span>
          </p>
          
          <p class="service-description-row mb-0 text-muted">
            {{ truncateDescription(service.description) }}
          </p>
          
          <p v-if="service.city" class="service-location-row mb-0 mt-1 text-muted">
            <i class="bi bi-geo-alt me-1"></i> {{ service.city }}
          </p>
        </div>

        <button 
          v-if="isLoggedIn" 
          class="btn-favorite-row ms-3" 
          @click.stop="onToggleFavorite(service._id)"
        >
          <i :class="isFavorite(service._id) ? 'bi bi-heart-fill fav-active' : 'bi bi-heart fav-inactive'"></i>
        </button>
      </div>

      <div v-if="totalPages > 1" class="pagination-container mt-5">
        <button 
          class="page-btn page-arrow" 
          :disabled="currentPage === 1"
          @click="currentPage--"
          aria-label="Prethodna stranica"
        >
          ‹
        </button>

        <span 
          v-for="page in totalPages" 
          :key="page" 
          @click="goToPage(page)"
          class="page-dot"
          :class="{ active: page === currentPage }"
          :aria-current="page === currentPage ? 'page' : undefined"
          :aria-label="'Idi na stranicu ' + page"
        >
          {{ page }}
        </span>

        <button 
          class="page-btn page-arrow" 
          :disabled="currentPage === totalPages"
          @click="currentPage++"
          aria-label="Sljedeća stranica"
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

// ------------------- local reactive map of favorite ids (Functionality preserved) -------------------
const localFavMap = reactive({}) 
const syncLocalFavMap = (favArray) => {
  for (const k in localFavMap) {
    if (Object.prototype.hasOwnProperty.call(localFavMap, k)) delete localFavMap[k]
  }
  if (Array.isArray(favArray)) {
    for (const f of favArray) {
      const id = (f && f._id) ? f._id : f
      if (id) localFavMap[id] = true
    }
  }
}
watch(
  () => props.favorites,
  (newVal) => { syncLocalFavMap(newVal) },
  { immediate: true, deep: true }
)

// ------------------- pagination + helpers (Functionality preserved) -------------------
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
watch(
  () => props.services,
  () => { currentPage.value = 1 },
  { deep: true }
)

const goToService = (id) => {
  router.push(`/service/${id}`)
}

// ------------------- toggle favorite flow (Functionality preserved) -------------------
const onToggleFavorite = (id) => {
  if (!isLoggedIn.value) return

  if (localFavMap[id]) {
    delete localFavMap[id]
  } else {
    localFavMap[id] = true
  }
  emit('toggle-favorite', id)
}

const isFavorite = (id) => {
  return !!localFavMap[id]
}

const formatPrice = (price, priceType) => {
  const map = { sat: 'h', dan: 'dan', tjedan: 'tjedan', mjesec: 'mjesec' }
  const formattedPrice = new Intl.NumberFormat('hr-HR', { style: 'currency', currency: 'BAM', minimumFractionDigits: 0 }).format(price);
  return `${formattedPrice}/${map[priceType] || priceType}`
}

// ------------------- other helpers (Functionality preserved) -------------------
const truncateDescription = (desc) => {
  if (!desc) return 'Nema opisa...'
  return desc.length > 80 ? desc.substring(0, 80) + '...' : desc
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
/* Define primary colors */
:root {
  --color-primary: var(--color-blue);
  --color-secondary: var(--color-orange);
  --color-text-dark: #333;
  --color-light-gray: #f5f5f5;
  --color-white: #fff;
  --color-green: #198754; /* Success green for Offer */
  --color-yellow: #ffc107; /* Warning yellow for Demand */
  
  /* Dodana varijabla polar green */
  --color-green-polar: #4caf50; 
}

/* Loader and No Services styles are fine */
.no-services-img {
  width: 180px;
  opacity: 0.8;
}

/* ---------- SERVICE ROW CARD (New Design) ---------- */
.service-row-card {
  display: flex;
  align-items: center;
  background: var(--color-white);
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  padding: 1rem;
  cursor: pointer;
  transition: box-shadow 0.3s ease, border-color 0.3s ease;
  position: relative;
}

.service-row-card:hover {
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  border-color: var(--color-primary);
}

/* Image */
.service-image-wrapper {
  width: 120px;
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
  display: flex;
  justify-content: center;
  align-items: center;
}
.placeholder-icon {
  font-size: 2rem;
  color: #a0a0a0;
}

/* Mode Badge - Prominent Status Indicator */
.mode-badge-row {
  display: inline-block;
  padding: 4px 10px;
  font-size: 0.75rem;
  font-weight: 700;
  border-radius: 5px;
  margin-bottom: 5px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}
.badge-offer {
  background-color: var(--color-green);
  color: var(--color-white);
}
.badge-demand {
  background-color: var(--color-yellow);
  color: var(--color-text-dark);
}

/* Info Text */
.service-info {
  padding-left: 1rem;
}

.service-title-row {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--color-text-dark);
}

.service-price-row {
  font-size: 1rem;
  color: var(--color-primary);
}

.service-description-row {
  font-size: 0.9rem;
  color: #6c757d;
}

.service-location-row {
  font-size: 0.85rem;
}

/* Favorite Button */
.btn-favorite-row {
  border: none;
  background: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  flex-shrink: 0;
}
.fav-active {
  color: #dc3545;
}
.fav-inactive {
  color: #a0a0a0;
  transition: color 0.2s;
}
.btn-favorite-row:hover .fav-inactive {
  color: var(--color-primary);
}

/* ---------- PAGINATION (ISPRAVLJENO) ---------- */
.pagination-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
}
.page-btn {
  border: 1px solid var(--color-light-gray);
  background: var(--color-white);
  font-size: 1.2rem;
  color: var(--color-primary);
  cursor: pointer;
  padding: 8px 15px;
  border-radius: 8px;
  transition: all 0.2s;
}
.page-btn:hover:not(:disabled) {
  background-color: var(--color-primary);
  color: var(--color-white);
}
.page-dot {
  padding: 8px 12px;
  border-radius: 8px;
  background-color: var(--color-light-gray);
  color: var(--color-text-dark);
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s, color 0.3s;
}
.page-dot.active {
  background-color: var(--color-secondary); 
  /* ISPRAVKA: Postavljamo tamnu boju teksta (ili bijelu ako je pozadina tamna),
     kako bi broj bio vidljiv na narandžastoj/žutoj pozadini. 
     Ako je sekundarna boja #ffc107 (žuta), treba nam tamni tekst: */
  color: var(--color-text-dark); 
  transform: scale(1.05);
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.1); /* Blaga sjena za isticanje */
}

/* ---------- RESPONSIVE TWEAKS (Mobile Optimization) ---------- */
@media (max-width: 768px) {
  .service-row-card {
    flex-direction: column;
    align-items: flex-start;
    padding: 1rem;
  }
  
  .service-image-wrapper {
    width: 100%;
    height: 150px;
    margin-bottom: 1rem;
    margin-right: 0 !important;
  }

  .service-info {
    width: 100%;
    padding-left: 0;
  }

  .btn-favorite-row {
    position: absolute;
    top: 15px;
    right: 15px;
    z-index: 5;
    background: var(--color-white);
    border-radius: 50%;
    width: 40px;
    height: 40px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }

  .service-title-row {
    font-size: 1.1rem;
  }
  .service-price-row, .service-description-row {
    font-size: 0.9rem;
  }
  .mode-badge-row {
    font-size: 0.7rem;
  }
}
</style>
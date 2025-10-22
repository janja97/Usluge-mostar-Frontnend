<template>
  <div class="services-list">
    <div 
      v-for="service in services" 
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
        @click.stop="toggleFavorite(service._id)"
      >
        <i :class="favorites.includes(service._id) ? 'bi bi-heart-fill text-danger' : 'bi bi-heart'"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, computed } from 'vue'
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

const goToService = (id) => {
  router.push(`/service/${id}`)
}

const toggleFavorite = (id) => {
  if (!isLoggedIn.value) return
  emit('toggle-favorite', id)
}

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
</script>

<style scoped>
.service-row {
  cursor: pointer;
  display: flex;
  align-items: center;
  position: relative;
  transition: box-shadow 0.3s;
}
.service-row:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.service-image-wrapper {
  width: 100px;
  height: 100px;
  flex-shrink: 0;
  border-radius: 8px;
  overflow: hidden;
}

.service-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.service-placeholder {
  width: 100%;
  height: 100%;
  background-color: #ddd;
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
</style>

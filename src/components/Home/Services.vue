<template>
  <!-- Featured Services Section -->
  <section class="featured-services">
    <div class="container">
      <div class="featured-header">
        <h2 class="section-title">Featured Services</h2>
        <router-link to="/services" class="btn primary">View All Listings</router-link>
      </div>

      <div v-if="featuredServices.length === 0" class="text-center">
        <p>There are currently no available services.</p>
      </div>

      <div class="services-grid" v-else>
        <div class="service-card" v-for="(s, index) in featuredServices" :key="index">
          <!-- ✅ Display image from DB or fallback from JSON -->
          <div class="card-image-wrapper">
            <img
              v-if="s.images && s.images.length > 0"
              :src="`data:image/jpeg;base64,${s.images[0]}`"
              alt="Service"
              class="card-image"
            />
            <img
              v-else
              :src="getCategoryImage(s.category)"
              alt="Default category image"
              class="card-image"
            />
          </div>

          <div class="card-content">
            <h5 class="card-title">
              {{ s.subcategory || s.category || s.customService || 'Unknown Service' }}
            </h5>
            <p class="card-user">{{ s.user?.fullName || 'Unknown User' }}</p>
            <p class="card-service">{{ s.service === 'ostalo' ? s.customService : s.service }}</p>
            <p class="card-price">
              Price:
              <span v-if="s.priceType === 'dogovor'">Negotiable</span>
              <span v-else-if="s.priceType === 'sat' || s.priceType === 'dnevno'">
                {{ s.price ? `${s.price} €/${s.priceType === 'sat' ? 'hour' : 'day'}` : 'Not defined' }}
              </span>
              <span v-else>Not defined</span>
            </p>
            <p class="card-description">
              {{ s.description && s.description.length > 50
                ? s.description.substring(0, 50) + '...'
                : s.description }}
            </p>
          </div>

          <div class="card-footer">
            <router-link :to="`/service/${s._id}`" class="btn primary px-3 py-2 fs-6">View Details</router-link>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../../services/api';
import servicesData from '../../data/services.json'; 

const services = ref([]);
const featuredServices = ref([]);

// ✅ helper: get default category image
const getCategoryImage = (category) => {
  const found = servicesData.find(
    (item) => item.category.toLowerCase() === category?.toLowerCase()
  );
  return found ? found.image : '/img/home/female.png'; // fallback ako nema kategorije
};

// Load services
const loadServices = async () => {
  try {
    const res = await api.get('/services');
    services.value = res.data;
    featuredServices.value = res.data.slice(0, 8);
  } catch (err) {
    console.error('Error fetching services:', err);
  }
};

onMounted(loadServices);
</script>

<style scoped>
.featured-services {
  padding: 6rem 2rem;
  background: var(--color-light-gray);
  font-family: 'Inter', sans-serif;
}

.featured-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 3rem;
}

.section-title {
  font-size: 2rem;
  font-weight: 700;
  color: #111;
  margin-bottom: 1rem;
}

.services-grid {
  display: grid;
  gap: 2rem;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}

.service-card {
  background: #fff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.service-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.15);
}

.card-image-wrapper {
  width: 100%;
  height: 180px;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 1rem;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.card-placeholder {
  width: 100%;
  height: 100%;
  background-color: #ddd;
  border-radius: 8px;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111;
  margin-bottom: 0.25rem;
}

.card-user {
  font-size: 0.9rem;
  color: #555;
  margin-bottom: 0.5rem;
}

.card-service {
  font-size: 1rem;
  color: #333;
  margin-bottom: 0.5rem;
}

.card-price {
  font-size: 0.95rem;
  color: #3b82f6;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.card-description {
  font-size: 0.9rem;
  color: #555;
  margin-bottom: 1rem;
}

@media (max-width: 768px) {
  .section-title {
    font-size: 1.75rem;
  }
}
</style>

<template>
  <!-- Featured Services Section -->
  <section class="featured-services">
    <div class="container">
      <div class="featured-header">
        <h2 class="section-title">Istaknute usluge</h2>
        <router-link to="/services" class="btn primary">Vidi sve oglase</router-link>
      </div>

      <div v-if="featuredServices.length === 0" class="text-center">
        <p>Trenutno nema dostupnih usluga.</p>
      </div>

      <div class="services-grid" v-else>
        <div class="service-card" v-for="(s, index) in featuredServices" :key="index">
          <div class="card-content">
            <h5 class="card-title">
              {{ s.subcategory || s.category || s.customService || 'Nepoznata usluga' }}
            </h5>
            <p class="card-user">{{ s.user.fullName }}</p>
            <p class="card-service">{{ s.service === 'ostalo' ? s.customService : s.service }}</p>
            <p class="card-price">
              Cijena:
              <span v-if="s.priceType === 'dogovor'">Po dogovoru</span>
              <span v-else-if="s.priceType === 'sat' || s.priceType === 'dnevno'">
                {{ s.price ? `${s.price} €/${s.priceType === 'sat' ? 'sat' : 'dnevno'}` : 'Nije definirano' }}
              </span>
              <span v-else>Nije definirano</span>
            </p>
            <p class="card-description">
              {{ s.description && s.description.length > 50
                ? s.description.substring(0, 50) + '...'
                : s.description }}
            </p>
          </div>
          <div class="card-footer">
            <router-link :to="`/service/${s._id}`" class="btn primary px-3 py-2 fs-6">Više detalja</router-link>
          </div>
        </div>
      </div>

    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../../services/api';

const services = ref([]);
const featuredServices = ref([]);

const loadServices = async () => {
  try {
    const res = await api.get('/services');
    services.value = res.data;
    featuredServices.value = res.data.slice(0, 8);
  } catch (err) {
    console.error('Greška kod dohvata usluga:', err);
  }
};

onMounted(loadServices);
</script>

<style scoped>
.featured-services {
  padding: 6rem 2rem;
  background: var( --color-light-gray);
  font-family: 'Inter', sans-serif;
}

/* Header */
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

<template>
  <section class="featured-services">
    <div class="container">
      <div class="featured-header">
        <h2 class="section-title">Usluge</h2>
        <router-link to="/services" class="btn primary">Sve usluge</router-link>
      </div>

      <div v-if="featuredServices.length === 0" class="text-center">
        <p>Trenutno nema aktivnih usluga.</p>
      </div>

      <div class="services-grid" v-else>
        <div class="service-card" v-for="(s, index) in featuredServices" :key="index">

          <!-- SLIKA -->
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

            <!-- MODE -->
            <p class="card-mode">
              {{ s.mode === 'offer' ? 'Nudim uslugu:' : 'Tražim uslugu:' }}
            </p>

            <!-- NASLOV -->
            <h5 class="card-title">
              {{ s.subcategory || s.category || s.customService || 'Nepoznata usluga' }}
            </h5>

            <!-- GRAD -->
            <p class="card-city">
              📍 {{ s.city || 'Nepoznat grad' }}
            </p>

            <!-- CIJENA -->
            <p class="card-price">
              <strong>
                <span v-if="s.priceType === 'dogovor'">Po dogovoru</span>
                <span v-else-if="s.priceType === 'sat' || s.priceType === 'dnevno'">
                  {{ s.price ? `${s.price} BAM / ${s.priceType === 'sat' ? 'sat' : 'dan'}` : 'Nije definirano' }}
                </span>
                <span v-else>Nije definirano</span>
              </strong>
            </p>

            <!-- KRATKI OPIS -->
            <p class="card-description">
              {{ s.description && s.description.length > 50
                ? s.description.substring(0, 50) + '...'
                : s.description }}
            </p>
          </div>

          <!-- FOOTER -->
          <div class="card-footer">
            <router-link :to="`/service/${s._id}`" class="btn secondary px-3 py-2 fs-6">
              Detalji
            </router-link>
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

const getCategoryImage = (category) => {
  const found = servicesData.find(
    (item) => item.category.toLowerCase() === category?.toLowerCase()
  );
  return found ? found.image : '/img/home/female.png';
};

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
  font-weight: 800;
  color:var(--color-primary);
}

.services-grid {
  display: grid;
  gap: 2rem;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

/* ★ NOVI STIL KARTICE */
.service-card {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(8px);
  border-radius: 18px;
  padding: 1.6rem;
  box-shadow: 0 8px 20px rgba(0,0,0,0.08);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}

.service-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 20px 28px rgba(0,0,0,0.12);
}

.card-image-wrapper {
  width: 100%;
  height: 190px;
  border-radius: 14px;
  overflow: hidden;
  margin-bottom: 1rem;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-mode {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--color-blue-dark);
  margin-bottom: 0.2rem;
}

.card-title {
  font-size: 1.35rem;
  font-weight: 700;
  color: #111;
  margin-bottom: 0.4rem;
}

/* GRAD */
.card-city {
  font-size: 0.95rem;
  color: #444;
  margin-bottom: 0.7rem;
}

/* CIJENA — PRIMARY */
.card-price {
  font-size: 1.1rem;
  color: var(--color-primary);
  font-weight: 700;
  margin-bottom: 0.8rem;
}

.card-description {
  font-size: 0.9rem;
  color: #555;
  margin-bottom: 1.2rem;
}

.card-footer {
  margin-top: auto;
  display: flex;
  justify-content: flex-end;
}
@media (max-width: 768px) {
  .section-title {
    font-size: 1.5rem;
  }
}
</style>


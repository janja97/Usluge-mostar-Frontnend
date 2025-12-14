<template>
  <div class="favorites-container p-0">
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-orange" role="status">
        <span class="visually-hidden">Učitavanje...</span>
      </div>
      <p class="mt-2 text-muted">Učitavanje omiljenih oglasa...</p>
    </div>

    <div v-else class="favorites-wrapper">
      <div v-if="favorites.length">
        <div
          v-for="fav in favorites"
          :key="fav._id"
          class="favorite-card d-flex justify-content-between align-items-center mb-3"
        >
          <div 
            class="d-flex align-items-center gap-3 w-100 card-info-clickable"
            @click="goToService(fav._id)"
          >
            <div class="image-wrapper flex-shrink-0">
              <img
                :src="getServiceImage(fav)"
                alt="Service image"
                class="service-image"
              />
            </div>

            <div class="service-details-container">
              <h5 class="service-title mb-1">{{ getServiceName(fav) }}</h5>
              
              <div class="d-flex flex-wrap gap-2 mb-1 info-row">
                  <span class="service-category">
                      <i class="bi bi-tag-fill me-1 text-orange-dark"></i>
                      {{ formatCategory(fav.category) }}
                  </span>
                  <span v-if="fav.city" class="text-muted city-info">
                      <i class="bi bi-geo-alt-fill me-1"></i> 
                      {{ fav.city }}
                  </span>
              </div>
              
              <p class="service-price mb-0">
                <span class="fw-bold text-blue-dark me-1">
                  {{ fav.price ? fav.price + ' KM' : 'Po dogovoru' }}
                </span>
                <span v-if="fav.priceType && fav.priceType !== 'dogovor'" class="text-muted price-type-text">
                    / {{ formatPriceType(fav.priceType) }}
                </span>
              </p>
            </div>
          </div>

          <div class="favorite-icon flex-shrink-0" @click.stop="toggleFavorite(fav._id)">
            <i class="bi bi-heart-fill text-danger" title="Ukloni iz favorita"></i>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-5">
        <i class="bi bi-heart-fill text-muted" style="font-size: 2rem;"></i>
        <p class="mt-3 text-muted">Trenutno nemaš omiljene usluge.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import api from "../../../services/api";
import categoriesData from "../../../data/services.json";

const favorites = ref([]);
const loading = ref(true);
const router = useRouter();

const goToService = (id) => {
  router.push(`/service/${id}`);
};

const getServiceName = (fav) => {
  return fav.customService || fav.subcategory || fav.category || "Nepoznata usluga";
};

const formatCategory = (cat) => {
  return cat ? cat : '';
};

const formatPriceType = (type) => {
    switch (type) {
        case 'dogovor': return 'dogovoru';
        case 'sat': return 'sat';
        case 'dnevno': return 'dan';
        default: return '';
    }
}

const getServiceImage = (fav) => {
  if (fav.images && Array.isArray(fav.images) && fav.images.length) {
    // Ako ima slika, uzmi prvu (indeks 0) ili onu označenu kao mainImg ako postoji
    const mainIndex = typeof fav.mainImg === 'number' && fav.mainImg < fav.images.length ? fav.mainImg : 0
    return `data:image/jpeg;base64,${fav.images[mainIndex]}`;
  }

  const category = categoriesData.find(c => c.category === fav.category);
  // Pretpostavka da je putanja do default.png pravilno postavljena
  return category?.image || "/img/default.png"; 
};

onMounted(async () => {
  await loadFavorites();
});

const loadFavorites = async () => {
  loading.value = true;
  try {
    // API vraća listu kompletnih usluga
    const res = await api.get("/favorites", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    favorites.value = res.data;
  } catch (err) {
    console.error("❌ Greška kod učitavanja favorita:", err.response?.data || err);
    favorites.value = [];
  } finally {
    loading.value = false;
  }
};

const toggleFavorite = async (serviceId) => {
  try {
    // Ovdje je post funkcija za TOGGLE, što znači da briše
    await api.post(`/favorites/${serviceId}`, {}, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    });
    
    // Ovdje koristimo optimistično ažuriranje: odmah uklanjamo stavku iz liste
    favorites.value = favorites.value.filter(f => f._id !== serviceId);
  } catch (err) {
    console.error("❌ Greška kod uklanjanja favorita:", err.response?.data || err);
    // U slučaju greške, ponovno učitavamo listu
    alert("Došlo je do greške prilikom uklanjanja favorita. Molimo pokušajte ponovo.");
    await loadFavorites();
  }
};
</script>

<style scoped>
/* ======================================= */
/* DIZAJN FAVORITA */
/* ======================================= */
:root {
  --color-blue: rgba(22, 58, 94);
  --color-blue-dark: #15304e;
  --color-orange: rgba(234, 126, 61);
  --color-orange-dark: #c86f33;
  --color-gray-light: #f5f5f5;
  --color-white: #ffffff;
}

.favorites-container {
  padding: 0;
}

.favorites-wrapper {
  padding: 10px 0;
}

.favorite-card {
  padding: 15px;
  background-color: var(--color-white);
  border: 1px solid var(--color-gray-light);
  border-radius: 10px;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.favorite-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-info-clickable {
    cursor: pointer;
}

/* Image */
.image-wrapper {
  width: 80px;
  height: 80px;
  background-color: var(--color-gray-light);
  border-radius: 8px;
  overflow: hidden;
}

.service-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Text details */
.service-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-blue-dark);
}

.service-category, .city-info {
  font-size: 0.85rem;
  color: #6c757d;
}

.service-category {
    font-weight: 500;
    color: var(--color-blue);
}

.text-orange-dark {
    color: var(--color-orange-dark) !important;
}

.service-price {
  font-size: 1rem;
}

/* Favorite Icon (Action) */
.favorite-icon {
  padding: 10px;
  cursor: pointer;
  transition: transform 0.2s;
}

.favorite-icon i {
  font-size: 1.6rem;
}

.favorite-icon:hover {
  transform: scale(1.1);
}

/* Responsive adjustments */
@media (max-width: 576px) {
    .favorite-card {
        padding: 10px;
    }
    .image-wrapper {
        width: 60px;
        height: 60px;
    }
    .service-title {
        font-size: 1rem;
    }
    .service-category, .city-info {
        font-size: 0.8rem;
    }
    .favorite-icon i {
        font-size: 1.4rem;
    }
}
</style>
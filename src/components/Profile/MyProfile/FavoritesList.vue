<template>
  <div class="favorites-container p-4">
    <h3 class="mb-4">Favorite Listings</h3>

    <div v-if="favorites.length">
      <div
        v-for="fav in favorites"
        :key="fav._id"
        class="favorite-card d-flex justify-content-between align-items-center p-3 mb-3 border rounded shadow-sm"
        @click="goToService(fav._id)"  
        style="cursor: pointer;"
      >
        <div class="d-flex align-items-center gap-3">
          <!-- ✅ Service image or placeholder -->
          <div class="image-wrapper">
            <img
              v-if="fav.images && fav.images.length"
              :src="'data:image/jpeg;base64,' + fav.images[0]"
              alt="Service image"
              class="service-image"
            />
            <div v-else class="service-placeholder"></div>
          </div>

          <!-- ✅ Text details -->
          <div>
            <strong class="service-title">{{ getServiceName(fav) }}</strong><br>
            <span class="service-category">{{ formatCategory(fav.category) }}</span>
            <span v-if="fav.subcategory"> | {{ formatCategory(fav.subcategory) }}</span><br>
            <span class="service-price">
              {{ fav.price ? fav.price + ' KM' : 'Negotiable' }}
              <span v-if="fav.priceType === 'sat'">/hour</span>
              <span v-else-if="fav.priceType === 'dnevno'">/day</span>
            </span>
          </div>
        </div>

        <!-- Favorite heart icon -->
        <div class="favorite-icon" @click.stop="toggleFavorite(fav._id)">
          <i class="bi bi-heart-fill text-danger"></i>
        </div>
      </div>
    </div>

    <p v-else class="text-muted">You currently have no favorite listings.</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import api from "../../../services/api";

const favorites = ref([]);
const router = useRouter();

const goToService = (id) => {
  router.push(`/service/${id}`);
};

const getServiceName = (fav) => {
  return fav.subcategory || fav.customService || fav.category || "Unknown";
};

const formatCategory = (cat) => {
  return cat ? cat.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : '';
};

onMounted(async () => {
  await loadFavorites();
});

const loadFavorites = async () => {
  try {
    const res = await api.get("/favorites", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    favorites.value = res.data;
  } catch (err) {
    console.error("❌ Error fetching favorites:", err.response?.data || err);
  }
};

const toggleFavorite = async (serviceId) => {
  try {
    await api.post(`/favorites/${serviceId}`, {}, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    });
    favorites.value = favorites.value.filter(f => f._id !== serviceId);
  } catch (err) {
    console.error("❌ Error removing favorite:", err.response?.data || err);
  }
};
</script>

<style scoped>
.favorites-container h3 {
  color: #5b77a8;
  font-weight: 600;
}

.favorite-card {
  background-color: #f8f9fa;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.favorite-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.service-title {
  font-size: 1.1rem;
  color: #343a40;
}

.service-category {
  font-size: 0.9rem;
  color: #6c757d;
}

.service-price {
  font-weight: 500;
  color: #495057;
}

.favorite-icon i {
  font-size: 1.5rem;
  transition: transform 0.2s ease;
}

.favorite-icon i:hover {
  transform: scale(1.2);
}

/* ✅ Stilovi za sliku i placeholder */
.image-wrapper {
  width: 70px;
  height: 70px;
  flex-shrink: 0;
}

.service-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #ddd;
}

/* ✅ Sivi placeholder ako nema slike */
.service-placeholder {
  width: 100%;
  height: 100%;
  background-color: #dcdcdc;
  border-radius: 8px;
  border: 1px solid #ccc;
}
</style>

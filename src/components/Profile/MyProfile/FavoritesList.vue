<template>
  <div class="favorites-container p-4">
    <h3 class="mb-4">Favorite Listings</h3>

    <div v-if="favorites.length">
      <div
        v-for="fav in favorites"
        :key="fav._id"
        class="favorite-card d-flex justify-content-between align-items-center p-3 mb-3 border rounded shadow-sm"
        @click="goToService(fav._id)"  <!-- Navigate to service detail page -->
        style="cursor: pointer;"
      >
        <div>
          <!-- Service name -->
          <strong class="service-title">{{ getServiceName(fav) }}</strong><br>

          <!-- Category / Subcategory -->
          <span class="service-category">{{ formatCategory(fav.category) }}</span>
          <span v-if="fav.subcategory"> | {{ formatCategory(fav.subcategory) }}</span><br>

          <!-- Price -->
          <span class="service-price">
            {{ fav.price ? fav.price + ' KM' : 'Negotiable' }}
            <span v-if="fav.priceType === 'sat'">/hour</span>
            <span v-else-if="fav.priceType === 'dnevno'">/day</span>
          </span>
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

// Navigate to service detail page
const goToService = (id) => {
  router.push(`/service/${id}`);
};

// Return service name (priority: subcategory > customService > category)
const getServiceName = (fav) => {
  return fav.subcategory || fav.customService || fav.category || "Unknown";
};

// Format category or subcategory for display (capitalize and replace underscores)
const formatCategory = (cat) => {
  return cat ? cat.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : '';
};

// Fetch favorites on component mount
onMounted(async () => {
  await loadFavorites();
});

// Function to load favorites from backend
const loadFavorites = async () => {
  try {
    const res = await api.get("/favorites", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    favorites.value = res.data; // backend returns full service objects
  } catch (err) {
    console.error("❌ Error fetching favorites:", err.response?.data || err);
  }
};

// Toggle favorite (add or remove from favorites)
const toggleFavorite = async (serviceId) => {
  try {
    await api.post(`/favorites/${serviceId}`, {}, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    });
    // Remove from frontend list immediately
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
</style>

<template>
  <div class="service-details container py-5">
    <!-- Loader -->
    <div v-if="loading" class="text-center">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Učitavanje...</span>
      </div>
    </div>

    <!-- Service Content -->
    <div v-else-if="service" class="service-container">

      <!-- Slider glavnih slika -->
      <div class="image-slider">
        <button v-if="service.images && service.images.length > 1" class="arrow left" @click="prevImage">&#10094;</button>
        <img
          v-if="service.images && service.images.length > 0"
          :src="`data:image/jpeg;base64,${service.images[currentImageIndex]}`"
          alt="Slika usluge"
          class="service-image"
        />
        <div v-else class="service-placeholder">
          <span>Bez slike</span>
        </div>
        <button v-if="service.images && service.images.length > 1" class="arrow right" @click="nextImage">&#10095;</button>

        <i
          :class="[ 'bi', isFavorite ? 'bi-heart-fill text-danger' : 'bi-heart', 'favorite-icon' ]"
          @click="toggleFavorite"
          title="Dodaj u omiljene"
        ></i>
      </div>

      <div class="details-section">
        <h2 class="service-title mb-3">
          <span v-if="service.category && service.subcategory">
            {{ formatCategory(service.category) }} : {{ formatCategory(service.subcategory) }}
          </span>
          <span v-else-if="service.category">{{ formatCategory(service.category) }}</span>
          <span v-else>{{ service.customService || 'Nepoznata usluga' }}</span>
        </h2>

        <p class="service-description mb-3">{{ service.description || "Nema opisa" }}</p>

        <div class="price-info mb-3">
          <p><strong>Vrsta cijene:</strong> {{ formatPriceType(service.priceType) }}</p>
          <p><strong>Cijena:</strong> {{ service.price != null ? service.price + ' KM' : 'Po dogovoru' }}</p>
          <p><strong>Grad:</strong> {{ service.city || 'Nepoznat' }}</p>
          <p><strong>Način:</strong> {{ service.mode === 'offer' ? 'Nudi uslugu' : 'Traži uslugu' }}</p>
        </div>

        <div class="user-actions mt-auto">
          <div class="user-info mb-3">
            <p class="mb-1 text-muted">Objavio:</p>
            <router-link
              v-if="service.user"
              :to="`/profile/${service.user._id}`"
              class="user-name text-decoration-none fw-bold"
            >
              {{ service.user.fullName }}
            </router-link>
            <span v-else>Nepoznat korisnik</span>
          </div>

          <div class="buttons">
            <button
              v-if="service.user && service.user._id !== loggedUserId"
              class="btn btn-outline-primary me-2"
              @click="goToChat"
            >
              💬 Pošalji poruku
            </button>
            <router-link to="/" class="btn btn-outline-secondary">
              ← Povratak
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Error -->
    <div v-else class="alert alert-danger text-center">
      Servis nije pronađen.
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "../services/api";

const route = useRoute();
const router = useRouter();
const service = ref(null);
const loading = ref(true);
const isFavorite = ref(false);
const loggedUserId = localStorage.getItem("userId");
const currentImageIndex = ref(0);

onMounted(async () => {
  await fetchService();
  await fetchFavorites();
});

const fetchService = async () => {
  try {
    const res = await api.get(`/services/${route.params.id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    service.value = res.data;
  } catch (err) {
    console.error("❌ Greška kod dohvaćanja servisa:", err);
  } finally {
    loading.value = false;
  }
};

const fetchFavorites = async () => {
  try {
    const res = await api.get("/favorites", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    const favIds = Array.isArray(res.data.favorites)
      ? res.data.favorites.map(String)
      : [];
    isFavorite.value = favIds.includes(String(route.params.id));
  } catch (err) {
    console.error("❌ Greška kod provjere favorita:", err);
  }
};

const goToChat = () => {
  if (service.value?.user?._id) {
    router.push(`/messages/${service.value.user._id}`);
  }
};

const toggleFavorite = async () => {
  try {
    await api.post(`/favorites/${route.params.id}`, {}, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    isFavorite.value = !isFavorite.value;
  } catch (err) {
    console.error("❌ Greška kod favorita:", err.response?.data || err);
    alert("Greška pri spremanju omiljenih. Provjeri prijavu ili backend.");
  }
};

const formatCategory = (text) =>
  text.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
const formatPriceType = (priceType) => {
  switch (priceType) {
    case "dogovor": return "Po dogovoru";
    case "sat": return "Na sat";
    case "dnevno": return "Na dan";
    default: return priceType;
  }
};

const nextImage = () => {
  if (!service.value || !service.value.images) return;
  currentImageIndex.value = (currentImageIndex.value + 1) % service.value.images.length;
};
const prevImage = () => {
  if (!service.value || !service.value.images) return;
  currentImageIndex.value =
    (currentImageIndex.value - 1 + service.value.images.length) % service.value.images.length;
};
</script>
<style scoped>
.service-container {
  display: flex;
  flex-wrap: wrap;
  gap: 30px;
  max-width: 1000px;
  margin: 0 auto;
}

/* Main image slider */
.image-slider {
  position: relative;
  flex: 1 1 45%;
  min-height: 450px;  /* minimum height */
  max-height: 550px;  /* maximum height */
  height: 500px;       /* fixed height */
  overflow: hidden;
  border-radius: 12px;
  background-color: #e0e0e0; /* background if image does not fill */
  display: flex;
  justify-content: center;
  align-items: center; /* center vertically and horizontally */
}

/* Service image */
.service-image {
  width: 100%;
  height: 100%;
  object-fit: contain; /* show full image, no crop */
  object-position: center; /* vertical center */
  display: block;
  background-color: #e0e0e0; /* background if image does not fill */
}

/* Placeholder */
.service-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 600;
  background-color: #e0e0e0;
}

/* Arrow buttons for slider */
.arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1rem;
  background: rgba(0,0,0,0.4);
  color: #fff;
  border: none;
  padding: 5px 12px;
  cursor: pointer;
  border-radius: 50%;
  z-index: 10;
  transition: background 0.2s ease;
}
.arrow:hover {
  background: rgba(0,0,0,0.7);
}
.arrow.left { left: 10px; }
.arrow.right { right: 10px; }

/* Favorite heart */
.favorite-icon {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 2rem;
  cursor: pointer;
  color: #fff;
  text-shadow: 0 0 8px rgba(0,0,0,0.6);
}

/* Details section */
.details-section {
  flex: 1 1 50%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}
.service-title {
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 15px;
}
.service-description {
  font-size: 1rem;
  color: #444;
  line-height: 1.6;
  margin-bottom: 15px;
}
.price-info p {
  margin-bottom: 0.5rem;
  font-weight: 500;
}

/* User info and buttons */
.user-actions { margin-top: auto; }
.user-name { color: #0d6efd; font-weight: 600; }
.user-name:hover { text-decoration: underline; }
.buttons button,
.buttons .btn {
  margin-right: 8px;
  border-radius: 6px;
  font-size: 0.9rem;
}

/* Responsive */
@media (max-width: 768px) {
  .service-container {
    flex-direction: column;
  }
  .image-slider, .details-section {
    flex: 1 1 100%;
  }
  .image-slider {
    height: 400px; /* fixed height for mobile */
    min-height: 400px;
    max-height: 400px;
  }
  .arrow { font-size: 1.5rem; }
}
</style>

<template>
  <div class="container py-5">
    <div v-if="loading" class="text-center">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Učitavanje...</span>
      </div>
    </div>

    <div v-else-if="service" class="card p-4 shadow-sm position-relative">
      <i
        :class="[
          'bi',
          isFavorite ? 'bi-heart-fill text-danger' : 'bi-heart',
          'favorite-icon'
        ]"
        @click="toggleFavorite"
        title="Dodaj u omiljene"
      ></i>

      <h2 class="mb-3">
        <span v-if="service.category && service.subcategory">
          {{ formatCategory(service.category) }} : {{ formatCategory(service.subcategory) }}
        </span>
        <span v-else-if="service.category">
          {{ formatCategory(service.category) }}
        </span>
        <span v-else>
          {{ service.customService || 'Nepoznata usluga' }}
        </span>
      </h2>

      <p><strong>Vrsta cijene:</strong> {{ formatPriceType(service.priceType) }}</p>
      <p>
        <strong>Cijena:</strong>
        {{ service.price != null ? service.price + ' KM' : 'po dogovoru' }}
      </p>
      <p><strong>Opis:</strong> {{ service.description || "Nema opisa" }}</p>

      <div class="mt-3">
        <p>
          <strong>Objavio:</strong>
          <router-link
            v-if="service.user"
            :to="`/profile/${service.user._id}`"
            class="text-decoration-none text-primary"
          >
            {{ service.user.fullName }}
          </router-link>
          <span v-else>Nepoznat korisnik</span>
        </p>

        <button
          v-if="service.user && service.user._id !== loggedUserId"
          class="btn btn-primary mt-2"
          @click="goToChat"
        >
          💬 Pošalji poruku
        </button>
      </div>

      <router-link to="/" class="btn btn-secondary mt-4">
        ← Povratak
      </router-link>
    </div>

    <div v-else class="alert alert-danger">
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
const loggedUserId = localStorage.getItem("userId"); // 

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
    router.push(`/messages/${service.value.user._id}`)  
  }
}

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

const formatCategory = (text) => text.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
const formatPriceType = (priceType) => {
  switch(priceType) {
    case 'dogovor': return 'Po dogovoru';
    case 'sat': return 'Na sat';
    case 'dnevno': return 'Na dan';
    default: return priceType;
  }
};
</script>

<style scoped>
.card {
  max-width: 700px;
  margin: 0 auto;
  position: relative;
  padding-top: 3rem;
}

.favorite-icon {
  position: absolute;
  top: 15px;
  right: 20px;
  font-size: 1.8rem;
  cursor: pointer;
  transition: transform 0.2s ease, color 0.2s ease;
}
.favorite-icon:hover {
  transform: scale(1.2);
  color: #dc3545;
}
</style>

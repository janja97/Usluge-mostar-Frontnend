<template>
  <div class="container py-5">
    <div v-if="loading" class="text-center">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Učitavanje...</span>
      </div>
    </div>

    <div v-else-if="service" class="card p-4 shadow-sm">
      <h2 class="mb-3">
        <span v-if="service.category && service.subcategory">
          {{ service.category }} : {{ service.subcategory }}
        </span>
        <span v-else-if="service.category">
          {{ service.category }}
        </span>
        <span v-else>
          {{ service.customService || 'Nepoznata usluga' }}
        </span>
      </h2>

      <p><strong>Vrsta cijene:</strong> {{ service.priceType }}</p>
      <p>
        <strong>Cijena:</strong>
        {{ service.price != null ? service.price + ' KM' : 'po dogovoru' }}
      </p>
      <p><strong>Opis:</strong> {{ service.description || "Nema opisa" }}</p>

      <div class="mt-3">
        <p><strong>Objavio:</strong> {{ service.user?.fullName || "Nepoznat korisnik" }}</p>
      </div>

      <router-link to="/" class="btn btn-secondary mt-3">
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
import { useRoute } from "vue-router";
import api from "../services/api"; 

const route = useRoute();
const service = ref(null);
const loading = ref(true);

onMounted(async () => {
  try {
    const res = await api.get(`/services/${route.params.id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    });
    service.value = res.data;
  } catch (err) {
    console.error("❌ Greška kod dohvaćanja servisa:", err);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.card {
  max-width: 700px;
  margin: 0 auto;
}
</style>

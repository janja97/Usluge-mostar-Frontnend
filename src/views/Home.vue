<template>
  <div class="container mt-5">
    <h2>Sve dostupne usluge</h2>
    <div v-if="services.length === 0">Nema dostupnih usluga.</div>
    <div class="row" v-else>
      <div class="col-md-4 mb-3" v-for="(s, index) in services" :key="index">
        <div class="card p-3">
          <h5>{{ s.user.fullName }} ({{ s.city }})</h5>
          <p>{{ s.service === 'ostalo' ? s.customService : s.service }}</p>
          <p>Cijena: {{ s.price }}</p>
          <p>Radni dani: {{ s.workingDays.join(', ') }}</p>
          <p v-if="s.workingHours.from">Radno vrijeme: {{ s.workingHours.from }} - {{ s.workingHours.to }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../services/api';

const services = ref([]);

const loadServices = async () => {
  try {
    const res = await api.get('/services');
    services.value = res.data;
  } catch (err) {
    console.error('Greška kod dohvata usluga:', err.response?.data || err);
  }
}

onMounted(loadServices);
</script>

<template>
  <div>
    <!-- Filter komponenta -->
    <ServiceFilters
      :services="services"
      @update:filtered="filteredServices = $event"
    />

    <!-- Aktivni oglasi -->
    <div class="services p-5 mt-4">
      <div v-if="filteredServices.length > 0">
        <div
          v-for="s in filteredServices"
          :key="s._id"
          class="service py-3 d-flex justify-content-between align-items-center border-bottom"
        >
          <div>
            <strong>{{ getServiceName(s) }}</strong><br />
            Tip cijene: {{ s.priceType }}<br />
            Cijena: {{ s.price || "po dogovoru" }}<br />
            <span v-if="s.description"><em>{{ s.description }}</em></span>
          </div>
        </div>
      </div>
      <p v-else>Nemate aktivnih oglasa.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../../../services/api';
import ServiceFilters from '../../ServiceFilters.vue';

const services = ref([]);
const filteredServices = ref([]);

onMounted(async () => {
  try {
    const res = await api.get('/services/my', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    services.value = res.data;
  } catch (err) {
    console.error(err);
  }
});

const getServiceName = (s) => s.subcategory || s.customService || s.category || 'Nepoznato';
</script>

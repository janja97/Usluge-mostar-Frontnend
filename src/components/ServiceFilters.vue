<template>
  <div class="filters p-3 mt-3">
    <h5>Filteri</h5>
    <div class="row g-2">
      <div class="col-md-4">
        <input v-model="localFilters.name" class="form-control" placeholder="Pretraga po nazivu" />
      </div>

      <div class="col-md-4">
        <select v-model="localFilters.priceType" class="form-select">
          <option value="">Tip cijene (sve)</option>
          <option value="dogovor">Dogovor</option>
          <option value="sat">Po satu</option>
          <option value="dnevno">Dnevno</option>
        </select>
      </div>

      <div class="col-md-4">
        <label class="form-label">Cijena (od - do)</label>
        <div class="d-flex flex-column">
          <input
            type="range"
            v-model.number="localFilters.minPrice"
            :min="minServicePrice"
            :max="maxServicePrice"
            step="10"
          />
          <input
            type="range"
            v-model.number="localFilters.maxPrice"
            :min="minServicePrice"
            :max="maxServicePrice"
            step="10"
          />
          <small>
            Od: {{ localFilters.minPrice }} KM — Do: {{ localFilters.maxPrice }} KM
          </small>
        </div>
      </div>
    </div>

    <div class="mt-3 text-end">
      <button class="btn btn-sm btn-outline-secondary" @click="resetFilters">
        Resetiraj filtere
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, watchEffect } from 'vue';

const props = defineProps({
  services: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(['update:filtered']);

const localFilters = ref({
  name: '',
  priceType: '',
  minPrice: 0,
  maxPrice: 0
});

// minimalna i maksimalna cijena iz niza
const minServicePrice = computed(() => {
  if (!props.services.length) return 0;
  return Math.min(...props.services.map(s => s.price || 0));
});

const maxServicePrice = computed(() => {
  if (!props.services.length) return 1000;
  return Math.max(...props.services.map(s => s.price || 1000));
});

// automatski postavimo min/max cijene kad se services promijeni
watchEffect(() => {
  localFilters.value.minPrice = minServicePrice.value;
  localFilters.value.maxPrice = maxServicePrice.value;
});

// filtriranje
watch(
  [() => localFilters.value, () => props.services],
  () => {
    const filtered = props.services.filter(s => {
      const name = (s.subcategory || s.customService || s.category || '').toLowerCase();
      const matchName = localFilters.value.name ? name.includes(localFilters.value.name.toLowerCase()) : true;
      const matchPriceType = localFilters.value.priceType ? s.priceType === localFilters.value.priceType : true;
      const matchPrice = (s.price || 0) >= localFilters.value.minPrice && (s.price || 0) <= localFilters.value.maxPrice;

      return matchName && matchPriceType && matchPrice;
    });

    emit('update:filtered', filtered);
  },
  { deep: true, immediate: true }
);

const resetFilters = () => {
  localFilters.value = {
    name: '',
    priceType: '',
    minPrice: minServicePrice.value,
    maxPrice: maxServicePrice.value
  };
};
</script>

<style scoped>
.filters small {
  font-size: 0.85rem;
}
</style>

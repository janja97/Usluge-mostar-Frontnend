<template>
  <div class="service-filters mb-4">
    <!-- Search + filter button -->
    <div class="d-flex mb-3">
      <input 
        v-model="localSearch" 
        type="text" 
        placeholder="Pretraži usluge ili odaberi kategoriju..." 
        class="form-control me-2"
        @input="emitFilter"
      />
      <button class="btn btn-outline-secondary me-2 col-2" @click="showModal = true">
        <i class="bi bi-funnel"></i> Filteri
      </button>
      <button 
        class="btn btn-outline-danger col-2" 
        :disabled="!isFilterActive"
        @click="clearFilters"
      >
        <i class="bi bi-x-circle"></i> Očisti filtere
      </button>
    </div>

    <!-- Categories icons -->
    <div class="categories d-flex flex-wrap overflow-auto">
      <div 
        v-for="(cat, index) in categories" 
        :key="index" 
        class="category-item text-center me-3 mb-2"
        :class="{ 'active': selectedCategory === cat.name }"
        @click="selectCategory(cat.name)"
      >
        <div 
          class="category-icon mb-1 d-flex align-items-center justify-content-center"
          :style="{ backgroundColor: lightenColor(cat.color, 0.6), color: cat.color }"
        >
          <i :class="['bi', cat.icon]" style="font-size:1.5rem"></i>
        </div>
        <span class="category-name">{{ cat.name }}</span>
      </div>
    </div>

    <!-- Modal for extra filters -->
    <div class="modal fade" tabindex="-1" :class="{ show: showModal }" style="display: block;" v-if="showModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Dodatni filteri</h5>
            <button type="button" class="btn-close" @click="showModal = false"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label>Minimalna cijena</label>
              <input type="number" class="form-control" v-model.number="minPrice" placeholder="0">
            </div>
            <div class="mb-3">
              <label>Maksimalna cijena</label>
              <input type="number" class="form-control" v-model.number="maxPrice" placeholder="1000">
            </div>
            <div class="mb-3">
              <label>Sortiraj po cijeni</label>
              <select class="form-select" v-model="priceSort">
                <option value="">Bez sortiranja</option>
                <option value="asc">Rastuće</option>
                <option value="desc">Padajuće</option>
              </select>
            </div>
            <div class="mb-3">
              <label>Lokacija (placeholder)</label>
              <input type="text" class="form-control" disabled placeholder="Za buduću funkcionalnost">
            </div>
            <div class="mb-3">
              <label>Ocjena korisnika (placeholder)</label>
              <input type="number" class="form-control" disabled placeholder="Za buduću funkcionalnost">
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="showModal = false">Zatvori</button>
            <button class="btn btn-primary" @click="applyExtraFilters">Primijeni filtere</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineEmits, defineProps, computed } from 'vue'
import servicesData from '../../data/services.json'

const props = defineProps({
  initialSearch: String,
  initialCategory: String,
  initialMinPrice: Number,
  initialMaxPrice: Number,
  initialPriceSort: String
})
const emit = defineEmits(['update:filter'])

const localSearch = ref(props.initialSearch || '')
const selectedCategory = ref(props.initialCategory || null)
const minPrice = ref(props.initialMinPrice || null)
const maxPrice = ref(props.initialMaxPrice || null)
const priceSort = ref(props.initialPriceSort || '')
const showModal = ref(false)

const colors = ['#0d6efd','#198754','#dc3545','#ffc107','#6f42c1','#fd7e14','#0dcaf0','#20c997','#adb5bd']
const bootstrapIcons = ['bi-house','bi-car-front','bi-tools','bi-briefcase','bi-laptop','bi-pc-display','bi-music-note','bi-pencil','bi-grid']

const categories = ref(
  servicesData.map((item, index) => ({
    name: item.category,
    icon: bootstrapIcons[index % bootstrapIcons.length],
    color: colors[index % colors.length]
  }))
)

// Check if any filter is active
const isFilterActive = computed(() => {
  return localSearch.value || selectedCategory.value || minPrice.value || maxPrice.value || priceSort.value
})

const selectCategory = (category) => {
  selectedCategory.value = selectedCategory.value === category ? null : category
  emitFilter()
}

// Emit all filters to parent
const emitFilter = () => {
  emit('update:filter', {
    search: localSearch.value,
    category: selectedCategory.value,
    minPrice: minPrice.value,
    maxPrice: maxPrice.value,
    priceSort: priceSort.value
  })
}

// Apply filters from modal
const applyExtraFilters = () => {
  emitFilter()
  showModal.value = false
}

// Clear filters
const clearFilters = () => {
  localSearch.value = ''
  selectedCategory.value = null
  minPrice.value = null
  maxPrice.value = null
  priceSort.value = ''
  emitFilter()
}

// Utility: lighten color
function lightenColor(color, percent) {
  const num = parseInt(color.replace('#',''),16),
        amt = Math.round(2.55 * percent * 100),
        R = (num >> 16) + amt,
        G = (num >> 8 & 0x00FF) + amt,
        B = (num & 0x0000FF) + amt;
  return '#' + (
    0x1000000 +
    (R<255?R<1?0:R:255)*0x10000 +
    (G<255?G<1?0:G:255)*0x100 +
    (B<255?B<1?0:B:255)
  ).toString(16).slice(1)
}
</script>

<style scoped>
.categories {
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;  
  gap: 0.5rem;
  padding-bottom: 5px;
  padding-top: 20px;
}

.category-item {
  cursor: pointer;
  flex: 0 0 100px;   
  text-align: center;
  transition: transform 0.2s;
}

.category-item.active {
  transform: scale(1.1);
  font-weight: 600;
}

.category-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin: auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

.category-name {
  font-size: 0.75rem;     
  word-break: break-word;  
  line-height: 1.1rem;
  text-transform: capitalize;
  display: -webkit-box;
  -webkit-line-clamp: 2;  
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.modal {
  background-color: rgba(0,0,0,0.5);
}
</style>

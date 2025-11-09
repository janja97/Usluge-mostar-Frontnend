<template>
  <div class="service-filters container-fluid py-3">
    <!-- Search + filter button -->
    <div class="filter-bar d-flex flex-wrap align-items-center gap-2 mb-4">
      <div class="flex-grow-1 position-relative">
        <i class="bi bi-search search-icon"></i>
        <input 
          v-model="localSearch" 
          type="text" 
          placeholder="Pretraži usluge ili kategorije..." 
          class="form-control stylish-input search"
          @input="emitFilter"
        />
      </div>

      <button class="btn filter-btn" @click="showModal = true">
        <i class="bi bi-funnel"></i> Filteri
      </button>

      <button 
        class="btn clear-btn" 
        :disabled="!isFilterActive"
        @click="clearFilters"
      >
        <i class="bi bi-x-circle"></i> Očisti
      </button>
    </div>

    <!-- Categories horizontal scroll -->
    <div class="categories-scroll">
      <div 
        v-for="(cat, index) in categories" 
        :key="index"
        class="category-card"
        :class="{ 'active': selectedCategory === cat.name }"
        @click="selectCategory(cat.name)"
      >
        <div 
          class="icon-wrapper" 
          :style="{ backgroundColor: lightenColor(cat.color, 0.35) }"
        >
          <img :src="cat.icon" :alt="cat.name" class="category-icon" />
        </div>
        <p class="category-label">{{ cat.name }}</p>
      </div>
    </div>

    <!-- Modal for extra filters -->
    <div class="modern-modal" v-if="showModal">
      <div class="modal-content-custom">
        <div class="modal-header-custom">
          <h5>Dodatni filteri</h5>
          <button class="btn-close" @click="showModal = false"></button>
        </div>

        <div class="modal-body-custom">
          <!-- 1. Vrsta oglasa -->
          <div class="form-group">
            <label>Vrsta oglasa</label>
            <select class="form-select stylish-input" v-model="mode">
              <option value="">Sve</option>
              <option value="offer">Ponuda</option>
              <option value="demand">Potražnja</option>
            </select>
          </div>

          <!-- 2. Županija / Regija -->
          <div class="form-group">
            <label>Županija / Regija</label>
            <select class="form-select stylish-input" v-model="selectedCounty" @change="updateCityOptions">
              <option value="">Sve</option>
              <option v-for="county in allCounties" :key="county" :value="county">
                {{ county }}
              </option>
            </select>
          </div>

          <!-- 3. Grad -->
          <div class="form-group" v-if="selectedCounty">
            <label>Grad</label>
            <select class="form-select stylish-input" v-model="selectedCity">
              <option value="">Sve</option>
              <option v-for="city in cityOptions" :key="city" :value="city">
                {{ city }}
              </option>
              <option value="custom">Drugi (unesi ručno)</option>
            </select>
          </div>

          <div class="form-group" v-if="selectedCity === 'custom'">
            <label>Unesite grad</label>
            <input type="text" class="form-control stylish-input" v-model="customCity" placeholder="Unesite grad">
          </div>

          <!-- 4. Minimalna / Maksimalna cijena -->
          <div class="form-group">
            <label>Minimalna cijena</label>
            <input type="number" class="form-control stylish-input" v-model.number="minPrice" placeholder="0">
          </div>
          <div class="form-group">
            <label>Maksimalna cijena</label>
            <input type="number" class="form-control stylish-input" v-model.number="maxPrice" placeholder="1000">
          </div>

          <!-- 5. Sortiranje po cijeni -->
          <div class="form-group">
            <label>Sortiraj po cijeni</label>
            <select class="form-select stylish-input" v-model="priceSort">
              <option value="">Bez sortiranja</option>
              <option value="asc">Rastuće</option>
              <option value="desc">Padajuće</option>
            </select>
          </div>
        </div>

        <div class="modal-footer-custom">
          <button class="btn secondary-btn" @click="showModal = false">Zatvori</button>
          <button class="btn primary-btn" @click="applyExtraFilters">Primijeni</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import servicesData from '../../data/services.json'
import countiesAndCities from '../../data/city.json'
import { defineEmits } from 'vue'

const emit = defineEmits(['update:filter'])

const localSearch = ref('')
const selectedCategory = ref(null)
const minPrice = ref(null)
const maxPrice = ref(null)
const priceSort = ref('')
const showModal = ref(false)
const mode = ref('')

const selectedCounty = ref('')
const selectedCity = ref('')
const cityOptions = ref([])
const customCity = ref('')

// Flatten all counties/regije
const allCounties = Object.keys(countiesAndCities).sort()

// Kategorije
const categories = ref(
  servicesData.map(item => ({
    name: item.category,
    icon: item.icon || '/img/icons/default.svg',
    color: item.color || '#adb5bd'
  }))
)

// Provjera aktivnih filtera
const isFilterActive = computed(() => {
  return localSearch.value || selectedCategory.value || minPrice.value || maxPrice.value || priceSort.value || mode.value || selectedCounty.value || selectedCity.value || customCity.value
})

// Odabir kategorije
const selectCategory = (category) => {
  selectedCategory.value = selectedCategory.value === category ? null : category
  emitFilter()
}

// Emit filter
const emitFilter = () => {
  const cityValue = selectedCity.value === 'custom' ? customCity.value : selectedCity.value

  emit('update:filter', {
    search: localSearch.value,
    category: selectedCategory.value,
    minPrice: minPrice.value,
    maxPrice: maxPrice.value,
    priceSort: priceSort.value,
    mode: mode.value,
    county: selectedCounty.value,
    city: cityValue
  })
}

const applyExtraFilters = () => {
  emitFilter()
  showModal.value = false
}

const clearFilters = () => {
  localSearch.value = ''
  selectedCategory.value = null
  minPrice.value = null
  maxPrice.value = null
  priceSort.value = ''
  mode.value = ''
  selectedCounty.value = ''
  selectedCity.value = ''
  customCity.value = ''
  cityOptions.value = []
  emitFilter()
}

// Update gradove kada se odabere županija
const updateCityOptions = () => {
  selectedCity.value = ''
  cityOptions.value = []

  if (!selectedCounty.value) return

  cityOptions.value = countiesAndCities[selectedCounty.value] || []
}

// Pomoćna funkcija za boje kategorija
function lightenColor(color, percent) {
  const num = parseInt(color.replace('#',''),16);
  const amt = Math.round(2.55 * percent * 95);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  
  return '#' + (
    0x1000000 +
    (R<255?R<1?0:R:255)*0x10000 +
    (G<255?G<1?0:G:255)*0x100 +
    (B<255?B<1?0:B:255)
  ).toString(16).slice(1);
}
</script>

<style scoped>
/* ---------- Filter bar ---------- */
.filter-bar {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 14px;
  padding: 1rem 0.5rem;
}

.stylish-input {
  border-radius: 12px;
  border: 1px solid var(--color-light-blue);
  padding: 10px 14px;
  transition: all 0.3s ease;
}

.stylish-input:focus {
  border-color: var(--color-blue);
  box-shadow: 0 0 0 3px rgba(59,130,246,0.2);
  outline: none;
}

.search-icon {
  position: absolute;
  top: 50%;
  left: 12px;
  transform: translateY(-50%);
  color: var(--color-gray);
}

.stylish-input {
  padding-left: 35px;
}

.filter-btn {
  background: var(--color-blue);
  color: white;
  border-radius: 10px;
  transition: all 0.3s ease;
}

.filter-btn:hover {
  background: var(--color-blue-hover);
}

.clear-btn {
  background: var(--color-orange);
  color: white;
  border-radius: 10px;
  transition: all 0.3s ease;
}

.clear-btn:hover {
  background: var(--color-orange-hover);
}

/* ---------- Horizontal scroll kategorije ---------- */
.categories-scroll {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  gap: 1rem;
  padding: 1rem 0.5rem;
  scrollbar-width: thin;
  scrollbar-color: var(--color-light-blue) transparent;
}

.categories-scroll::-webkit-scrollbar {
  height: 8px;
}

.categories-scroll::-webkit-scrollbar-thumb {
  background: var(--color-light-blue);
  border-radius: 10px;
}

.category-card {
  flex: 0 0 auto;
  scroll-snap-align: start;
  background: white;
  border-radius: 16px;
  padding: 12px;
  text-align: center;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  cursor: pointer;
  min-width: 100px;
  max-width:200px;
  height: 130px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.category-card:hover {
  transform: translateY(-5px) scale(1.03);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.category-card.active {
  background: var(--color-light-blue);
  color: white;
  font-weight: 600;
  box-shadow: 0 0 10px rgba(96,165,250,0.5);
}

.category-icon {
  width: 28px;
  height: 28px;
  object-fit: contain;
}

.icon-wrapper {
  width: 55px;
  height: 55px;
  border-radius: 50%;
  margin: 0 auto 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
}

/* ---------- Modal ---------- */
.modern-modal {
  position: fixed;
  inset: 0;
  background: rgba(24,48,112,0.35);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
  animation: fadeIn 0.3s ease;
}

.modal-content-custom {
  background: rgba(255,255,255,0.92);
  border-radius: 20px;
  padding: 24px;
  width: 90%;
  max-width: 420px;
  max-height: 80vh;      /* Fiksna visina modala */
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  animation: slideUp 0.3s ease;
  overflow: hidden;      /* Sprečava scroll pozadine */
}

.modal-header-custom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.modal-body-custom {
  flex: 1;               /* Popunjava preostali prostor */
  overflow-y: auto;      /* Scroll unutar modala */
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-right: 5px;    /* Za scrollbar */
}

/* Scrollbar za modal */
.modal-body-custom::-webkit-scrollbar {
  width: 6px;
}

.modal-body-custom::-webkit-scrollbar-thumb {
  background-color: rgba(59,130,246,0.5);
  border-radius: 3px;
}

.form-group label {
  font-weight: 500;
  color: var(--color-gray);
  margin-bottom: 4px;
}

.modal-footer-custom {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 15px;
}

.primary-btn {
  background: var(--color-blue);
  color: #fff;
  border-radius: 10px;
  padding: 8px 16px;
}

.secondary-btn {
  background: var(--color-light-gray);
  border-radius: 10px;
  padding: 8px 16px;
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

/* ---------- Responsive tweaks ---------- */
@media (max-width: 768px) {
  .filter-bar {
    flex-direction: column;
    align-items: stretch;
    gap: 0.8rem;
  }

  .filter-bar > .flex-grow-1 {
    width: 100%;
  }

  .filter-bar .btn {
    width: 100%;
  }
  .search {
    padding-left: 35px !important;
  }
  .modal-content-custom{
    max-height: 90vh;
  } 
  .modal-footer-custom button ,.form-group label ,.category-label, .stylish-input ,.filter-bar .btn{
    font-size: 1rem !important;
  }
  .stylish-input {
    padding-left: 10px;
  }
  h5 {
    font-size: 1rem;
  }
}
</style>

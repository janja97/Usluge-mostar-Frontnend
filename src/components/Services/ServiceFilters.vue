<template>
  <div class="service-filters container-fluid py-3">
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

      <button class="btn filter-btn position-relative" @click="showModal = true">
        <i class="bi bi-funnel"></i> Filteri
        <span v-if="isExtraFilterActive" class="filter-active-dot"></span>
      </button>

      <button 
        class="btn clear-btn" 
        :disabled="!isFilterActive"
        @click="clearFilters"
      >
        <i class="bi bi-x-circle"></i> Očisti
      </button>
    </div>

    <div class="categories-scroll">
      <div
        v-for="(cat, index) in categories"
        :key="index"
        class="category-card"
        :class="{ active: selectedCategory === cat.name }"
        @click="selectCategory(cat.name)"
      >
        <div class="icon-wrapper">
          <img :src="cat.icon" :alt="cat.name" class="category-icon" />
        </div>
        <p class="category-label">{{ cat.name }}</p>
      </div>
    </div>

    <div class="modern-modal" v-if="showModal">
      <div class="modal-content-custom">
        <div class="modal-header-custom">
          <h5>Dodatni filteri</h5>
          <button class="btn-close" @click="showModal = false"></button>
        </div>

        <div class="modal-body-custom">
          <div class="form-group">
            <label>Vrsta oglasa</label>
            <select class="form-select stylish-input" v-model="mode">
              <option value="">Sve</option>
              <option value="offer">Ponuda</option>
              <option value="demand">Potražnja</option>
            </select>
          </div>

          <div class="form-group">
            <label>Županija / Regija</label>
            <select class="form-select stylish-input" v-model="selectedCounty" @change="updateCityOptions">
              <option value="">Sve</option>
              <option v-for="county in allCounties" :key="county" :value="county">
                {{ county }}
              </option>
            </select>
          </div>

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
            <input type="text" class="form-control stylish-input" v-model="customCity" placeholder="Unesite grad" />
          </div>

          <div class="form-group">
            <label>Minimalna cijena</label>
            <input type="number" class="form-control stylish-input" v-model.number="minPrice" />
          </div>

          <div class="form-group">
            <label>Maksimalna cijena</label>
            <input type="number" class="form-control stylish-input" v-model.number="maxPrice" />
          </div>

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
import { ref, computed } from "vue";
import { defineEmits } from "vue";
// Assuming servicesData and countiesAndCities are imported correctly
import servicesData from "../../data/services.json";
import countiesAndCities from "../../data/city.json";

const emit = defineEmits(["update:filter"]);

const localSearch = ref("");
const selectedCategory = ref(null);
const minPrice = ref(null);
const maxPrice = ref(null);
const priceSort = ref("");
const mode = ref("");

const selectedCounty = ref("");
const selectedCity = ref("");
const cityOptions = ref([]);
const customCity = ref("");

const showModal = ref(false);

// LOAD COUNTIES
const allCounties = Object.keys(countiesAndCities).sort();

// LOAD CATEGORIES
const categories = ref(
  servicesData.map((item) => ({
    name: item.category,
    icon: item.icon || "/img/icons/default.svg",
    color: item.color || "#ccc",
  }))
);

// EMIT FILTER EVENT
const emitFilter = () => {
  const cityValue =
    selectedCity.value === "custom" ? customCity.value : selectedCity.value;

  emit("update:filter", {
    search: localSearch.value,
    category: selectedCategory.value,
    minPrice: minPrice.value,
    maxPrice: maxPrice.value,
    priceSort: priceSort.value,
    mode: mode.value,
    county: selectedCounty.value,
    city: cityValue,
  });
};

// CATEGORY SELECT TOGGLE
const selectCategory = (cat) => {
  selectedCategory.value = selectedCategory.value === cat ? null : cat;
  emitFilter();
};

// CLEAR ALL FILTERS
const clearFilters = () => {
  localSearch.value = "";
  selectedCategory.value = null;
  minPrice.value = null;
  maxPrice.value = null;
  priceSort.value = "";
  mode.value = "";
  selectedCounty.value = "";
  selectedCity.value = "";
  customCity.value = "";
  cityOptions.value = [];
  emitFilter();
};

// UPDATE CITY OPTIONS BASED ON COUNTY SELECTION
const updateCityOptions = () => {
  selectedCity.value = "";
  customCity.value = "";
  cityOptions.value = countiesAndCities[selectedCounty.value] || [];
};

// APPLY EXTRA FILTERS FROM MODAL
const applyExtraFilters = () => {
  emitFilter();
  showModal.value = false;
};

// COMPUTED: Check if ANY filter (search, category, or extra) is active (for the Clear button)
const isFilterActive = computed(() => {
  return (
    localSearch.value ||
    selectedCategory.value ||
    minPrice.value ||
    maxPrice.value ||
    priceSort.value ||
    mode.value ||
    selectedCounty.value ||
    selectedCity.value ||
    customCity.value
  );
});

// COMPUTED: Check if EXTRA filters (only modal fields) are active (for the orange dot)
const isExtraFilterActive = computed(() => {
    // We exclude `localSearch` and `selectedCategory` here
    return (
        minPrice.value ||
        maxPrice.value ||
        priceSort.value ||
        mode.value ||
        selectedCounty.value ||
        selectedCity.value ||
        customCity.value
    );
});
</script>

<style scoped>
/* GENERAL STYLING */
.service-filters {
    padding-top: 2rem;
    padding-bottom: 2rem;
}

/* ---------- Filter Bar (Modern, Darker Look) ---------- */
.filter-bar {
    /* Dark background for prominence */
    background: var(--color-blue); 
    border-radius: 16px;
    padding: 1rem 1rem;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.stylish-input {
    /* Base styling for all form controls */
    border-radius: 10px;
    border: 1px solid var(--color-blue-light);
    padding: 12px 14px;
    transition: all 0.3s ease;
    background-color: var(--color-white);
    color: var(--color-text-dark);
}

.stylish-input:focus {
    /* Orange glow on focus */
    border-color: var(--color-orange);
    box-shadow: 0 0 0 3px rgba(234, 126, 61, 0.3); 
    outline: none;
}

/* Search input specific styling */
.search-icon {
    position: absolute;
    top: 50%;
    left: 14px;
    transform: translateY(-50%);
    color: var(--color-blue-dark);
    z-index: 2; 
}

.search {
    padding-left: 40px; /* Space for the search icon */
}

/* Filter Button */
.filter-btn {
    background: var(--color-orange);
    color: white;
    border-radius: 10px;
    padding: 10px 18px;
    font-weight: 600;
    transition: background-color 0.3s ease;
}

.filter-btn:hover {
    background: var(--color-orange-hover);
}

/* Active Filter Indicator Dot */
.filter-active-dot {
    position: absolute;
    top: 5px;
    right: 5px;
    width: 8px;
    height: 8px;
    background-color: var(--color-orange-dark);
    border-radius: 50%;
    /* Border matches filter bar background */
    border: 2px solid var(--color-blue); 
    z-index: 10;
}


/* Clear Button */
.clear-btn {
    background: var(--color-blue-dark);
    color: white;
    border-radius: 10px;
    padding: 10px 18px;
    font-weight: 600;
    transition: background-color 0.3s ease;
}

.clear-btn:hover:not(:disabled) {
    background: #0d2139; /* Slightly darker shade */
}

.clear-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* ---------- Horizontal Scroll Categories ---------- */
.categories-scroll {
    display: flex;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    gap: 1rem;
    padding: 1rem 0.5rem;
    scrollbar-width: thin; 
    scrollbar-color: var(--color-blue-light) transparent;
}

.category-card {
    flex: 0 0 auto;
    scroll-snap-align: start;
    background: var(--color-white);
    border-radius: 16px;
    padding: 15px 12px;
    text-align: center;
    transition: all 0.3s ease;
    box-shadow: 0 2px 10px rgba(0,0,0,0.08);
    cursor: pointer;
    min-width: 100px;
    max-width: 200px;
    height: 120px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border: 2px solid transparent;
}

.category-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 5px 15px rgba(0,0,0,0.15);
}

.category-card.active {
    background: var(--color-blue);
    color: var(--color-white);
    font-weight: 600;
    /* Orange active border for strong focus */
    border-color: var(--color-orange); 
    box-shadow: 0 0 10px rgba(22, 58, 94, 0.5);
}

/* Icon Wrapper Background */
.icon-wrapper {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background-color: var(--color-gray-light); 
    margin: 0 auto 8px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.category-card.active .icon-wrapper {
    /* Darker icon background when active */
    background-color: var(--color-blue-dark); 
}

.category-icon {
    width: 28px;
    height: 28px;
    object-fit: contain;
}

.category-label {
    font-size: 0.9rem;
    margin-top: 5px;
    color: var(--color-text-dark);
    /* Ensure full name display */
    word-wrap: break-word; 
    white-space: normal;
}

.category-card.active .category-label {
    color: var(--color-white);
}

/* ---------- Modal Styling ---------- */
.modern-modal {
    position: fixed;
    inset: 0;
    /* Semi-transparent dark overlay with blur */
    background: rgba(21, 48, 78, 0.7); 
    backdrop-filter: blur(6px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1050;
    animation: fadeIn 0.3s ease;
}

.modal-content-custom {
    background: var(--color-white);
    border-radius: 20px;
    padding: 30px;
    width: 90%;
    max-width: 450px;
    max-height: 85vh; 
    display: flex;
    flex-direction: column;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    animation: slideUp 0.3s ease;
    overflow: hidden; 
}

.modal-header-custom h5 {
    font-weight: 700;
    color: var(--color-blue-dark);
    font-size: 1.5rem;
}

.modal-body-custom {
    flex: 1; 
    overflow-y: auto; 
    display: flex;
    flex-direction: column;
    gap: 15px;
    padding-right: 10px; 
}

.form-group label {
    font-weight: 600;
    color: var(--color-blue);
    margin-bottom: 5px;
    display: block;
    font-size: 0.95rem;
}

.modal-footer-custom {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 20px;
}

.primary-btn {
    background: var(--color-orange);
    color: var(--color-white);
    border-radius: 10px;
    padding: 10px 20px;
    font-weight: 600;
    transition: background-color 0.3s ease;
}
.primary-btn:hover {
    background: var(--color-orange-hover);
}

.secondary-btn {
    background: var(--color-gray-light);
    color: var(--color-text-dark);
    border-radius: 10px;
    padding: 10px 20px;
    transition: background-color 0.3s ease;
}
.secondary-btn:hover {
    background: var(--color-light-gray);
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(50px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

/* ---------- Responsive tweaks ---------- */
@media (max-width: 768px) {
  .filter-bar {
    flex-direction: column;
    align-items: stretch;
    gap: 0.8rem;
  }

  .filter-bar > .flex-grow-1, .filter-bar .btn {
    width: 100%;
  }

  .stylish-input {
    font-size: 1rem !important;
  }
  
  .search {
    padding-left: 40px !important;
  }
  
  .search-icon {
    left: 14px;
  }

  .modal-content-custom {
    padding: 20px;
  }
  
  .modal-header-custom h5 {
    font-size: 1.25rem;
  }
}
</style>
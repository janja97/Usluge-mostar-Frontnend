<template>
  <div class="services-page container py-5">
    <ServiceFilters 
      :initial-search="searchQuery"
      :initial-category="selectedCategory"
      :initial-min-price="minPrice"
      :initial-max-price="maxPrice"
      :initial-price-sort="priceSort"
      :initial-mode="mode"
      :initial-county="selectedCounty"
      :initial-city="selectedCity"
      @update:filter="updateFilter"
    />

    <ServicesList 
      :services="filteredServices"
      :favorites="favorites"
      @toggle-favorite="toggleFavorite"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import api from "../services/api";
import { useUserStore } from "../store/user";
import ServiceFilters from "../components/Services/ServiceFilters.vue";
import ServicesList from "../components/Services/ServicesList.vue";

const userStore = useUserStore();
const user = computed(() => userStore.user);

const services = ref([]);
const favorites = ref([]);
const pageReady = ref(false);

const searchQuery = ref("");
const selectedCategory = ref(null);
const minPrice = ref(null);
const maxPrice = ref(null);
const priceSort = ref("");
const mode = ref("");

const selectedCounty = ref("");
const selectedCity = ref("");

const loadServices = async () => {
  try {
    const res = await api.get("/services");
    services.value = Array.isArray(res.data) ? res.data : [];
  } catch (err) {
    console.error("❌ Error loading services:", err);
    services.value = [];
  }
};

const loadFavorites = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return (favorites.value = []);

    const res = await api.get("/favorites", {
      headers: { Authorization: `Bearer ${token}` },
    });

    favorites.value = Array.isArray(res.data) ? res.data : [];
  } catch (err) {
    console.error("❌ Error loading favorites:", err);
    favorites.value = [];
  }
};

// ---------------- FILTER LOGIKA ----------------
const filteredServices = computed(() => {
  let filtered = services.value;

  if (searchQuery.value) {
    filtered = filtered.filter((s) =>
      (s.customService || s.subcategory || "")
        .toLowerCase()
        .includes(searchQuery.value.toLowerCase())
    );
  }

  if (selectedCategory.value)
    filtered = filtered.filter((s) => s.category === selectedCategory.value);

  if (minPrice.value !== null)
    filtered = filtered.filter((s) => s.price >= minPrice.value);

  if (maxPrice.value !== null)
    filtered = filtered.filter((s) => s.price <= maxPrice.value);

  if (priceSort.value === "asc")
    filtered = filtered.slice().sort((a, b) => a.price - b.price);
  else if (priceSort.value === "desc")
    filtered = filtered.slice().sort((a, b) => b.price - a.price);

  // MODE FILTER
  if (mode.value) {
    filtered = filtered.filter((s) => s.mode === mode.value);
  }

  // COUNTY FILTER
  if (selectedCounty.value) {
    filtered = filtered.filter((s) => s.county === selectedCounty.value);
  }

  // CITY FILTER
  if (selectedCity.value) {
    filtered = filtered.filter((s) => s.city === selectedCity.value);
  }

  return filtered;
});

// ---------------- UPDATE FILTERS ----------------
const updateFilter = ({
  search,
  category,
  minPrice: min,
  maxPrice: max,
  priceSort: sort,
  mode: selectedMode,
  county,
  city,
}) => {
  searchQuery.value = search;
  selectedCategory.value = category;
  minPrice.value = min;
  maxPrice.value = max;
  priceSort.value = sort;
  mode.value = selectedMode;
  selectedCounty.value = county || "";
  selectedCity.value = city || "";
};

// ---------------- FAVORITES ----------------
const toggleFavorite = async (serviceId) => {
  if (!user.value) return alert("Morate biti prijavljeni.");

  const index = favorites.value.findIndex((f) => f._id === serviceId);
  if (index !== -1) favorites.value.splice(index, 1);
  else {
    const service = services.value.find((s) => s._id === serviceId);
    if (service) favorites.value.push(service);
  }

  try {
    const res = await api.post(`/favorites/${serviceId}`);
    const updated = Array.isArray(res.data.favorites)
      ? res.data.favorites
      : [];
    favorites.value.splice(0, favorites.value.length, ...updated);
  } catch (err) {
    console.error("❌ Error updating favorites:", err);
  }
};

watch(user, () => loadFavorites(), { immediate: true });

onMounted(async () => {
  await Promise.all([loadServices(), loadFavorites()]);
  pageReady.value = true;
});
</script>

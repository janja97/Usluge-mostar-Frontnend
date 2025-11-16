<template>
  <div class="container pt-5">

    <!-- GLOBAL LOADING OVERLAY -->
    <div v-if="leftLoading || rightLoading" class="loading-overlay">
      <div class="loading-box text-center">
        <!-- Spinner for loading -->
        <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;"></div>
        <p class="mt-3">Učitavanje profila...</p>
      </div>
    </div>

    <!-- PAGE CONTENT -->
    <div class="d-flex flex-wrap" v-else>

      <!-- LEFT SIDE (profile image + header info) -->
      <div class="col-md-4 col-12">
        <Header
          :user="user"
          @updateUser="updateUser"
          @deleteUser="removeUser"
          :isOwnProfile="isOwnProfile"
        />
      </div>

      <!-- RIGHT SIDE (tabs + content) -->
      <div class="col-md-8 col-12 p-3">

        <!-- TABS -->
        <ul class="nav nav-tabs">
          <li class="nav-item">
            <button class="nav-link" :class="{ active: activeTab === 'details' }" @click="activeTab = 'details'">
              Detalji
            </button>
          </li>
          <li class="nav-item">
            <button class="nav-link" :class="{ active: activeTab === 'services' }" @click="activeTab = 'services'">
              Aktivni oglasi
            </button>
          </li>
          <li class="nav-item" v-if="isOwnProfile">
            <button class="nav-link" :class="{ active: activeTab === 'favorites' }" @click="activeTab = 'favorites'">
              Omiljeni
            </button>
          </li>
          <li class="nav-item" v-if="isOwnProfile">
            <button class="nav-link" :class="{ active: activeTab === 'add' }" @click="activeTab = 'add'">
              Dodaj novu uslugu
            </button>
          </li>
          <li class="nav-item">
            <button class="nav-link" :class="{ active: activeTab === 'reviews' }" @click="activeTab = 'reviews'">
              Komentari
            </button>
          </li>
        </ul>

        <!-- TAB CONTENT -->
        <div class="tab-content mt-3">
          <!-- DETAILS -->
          <div v-if="activeTab === 'details'">
            <h4>{{ user?.fullName }}</h4>
            <p><strong>Email:</strong> {{ user?.email }}</p>
          </div>

          <!-- SERVICES -->
          <ServicesList
            v-if="activeTab === 'services'"
            ref="servicesListRef"
            :userId="route.params.id ? route.params.id : loggedInUserId"
            :isOwnProfile="isOwnProfile"
          />

          <!-- FAVORITES -->
          <FavoritesList
            v-if="activeTab === 'favorites' && isOwnProfile"
          />

          <!-- ADD SERVICE -->
          <AddService
            v-if="activeTab === 'add' && isOwnProfile"
            @serviceAdded="refreshServices"
          />

          <!-- REVIEWS -->
          <Reviews v-if="activeTab === 'reviews'" />
        </div>
      </div>

    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from "vue";
import { useUserStore } from "../store/user";
import { useRoute } from "vue-router";
import api from "../services/api";

import Header from "../components/Profile/Header.vue";
import ServicesList from "../components/Profile/MyProfile/ServicesList.vue";
import FavoritesList from "../components/Profile/MyProfile/FavoritesList.vue";
import AddService from "../components/Profile/MyProfile/AddService.vue";
import Reviews from "../components/Profile/MyProfile/Reviews.vue";

const route = useRoute();
const userStore = useUserStore();

const user = ref(null);
const loggedInUserId = ref(null);

// LOADING STATES
const leftLoading = ref(true);
const rightLoading = ref(true);

// DEFAULT ACTIVE TAB
const activeTab = ref("details");

const servicesListRef = ref(null);

// FUNCTION TO UPDATE USER
const updateUser = (updated) => {
  user.value = updated;
};

// FUNCTION TO REMOVE USER
const removeUser = () => {
  user.value = null;
};

// REFRESH SERVICES LIST
const refreshServices = () => {
  activeTab.value = "services";
  servicesListRef.value?.fetchServices();
};

// FETCH USER DATA
const fetchUser = async () => {
  try {
    if (route.params.id) {
      // Fetch other user's profile
      const res = await api.get(`/users/${route.params.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      user.value = res.data;
    } else {
      // Fetch own profile
      await userStore.fetchUser();
      user.value = userStore.$state.user;
    }

    loggedInUserId.value = userStore.$state.user?._id;

  } catch (err) {
    console.error("Error fetching user:", err);
  }

  // TURN OFF LOADING
  leftLoading.value = false;
  rightLoading.value = false;
};

onMounted(fetchUser);
watch(() => route.params.id, () => fetchUser());

// CHECK IF PROFILE BELONGS TO LOGGED-IN USER
const isOwnProfile = computed(() =>
  !route.params.id || route.params.id === loggedInUserId.value
);
</script>

<style scoped>
/* LOADING OVERLAY COVERS ENTIRE SCREEN */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh; /* FULL SCREEN HEIGHT */
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(2px);
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* LOADING BOX */
.loading-box {
  padding: 20px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>

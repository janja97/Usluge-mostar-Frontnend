<template>
  <div class="profile-page container py-5">
    
    <div v-if="leftLoading" class="profile-layout-skeleton">
      <div class="col-md-4 col-12 profile-card-wrapper p-md-0 p-2">
        <div class="skeleton-header-box">
          <div class="skeleton-box avatar-placeholder mb-3"></div>
          <div class="skeleton-box title-placeholder mb-2"></div>
          <div class="skeleton-box text-placeholder short"></div>
          <div class="skeleton-box button-placeholder mt-3"></div>
        </div>
      </div>
      
      <div class="col-md-8 col-12 profile-content-wrapper p-md-4 p-2">
        <div class="skeleton-tabs-box mb-4">
          <div class="skeleton-box tab-item"></div>
          <div class="skeleton-box tab-item"></div>
          <div class="skeleton-box tab-item" v-if="isOwnProfile"></div>
        </div>
        <div class="tab-content-skeleton p-3">
          <div class="skeleton-box section-heading-placeholder mb-4"></div>
          <div class="skeleton-box text-placeholder long mb-2"></div>
          <div class="skeleton-box text-placeholder medium mb-4"></div>
          <div class="skeleton-box text-placeholder long mb-2"></div>
          <div class="skeleton-box text-placeholder medium mb-4"></div> <div class="skeleton-box text-placeholder short"></div>
        </div>
      </div>
    </div>

    <div class="d-flex flex-wrap profile-layout g-md-4" v-else-if="user">

      <div class="col-md-4 col-12 profile-card-wrapper p-md-0 p-2">
        <Header
          :user="user"
          @updateUser="updateUser"
          @deleteUser="removeUser"
          :isOwnProfile="isOwnProfile"
        />
      </div>

      <div class="col-md-8 col-12 profile-content-wrapper p-md-0 p-2">

        <div class="tabs-scroll-container">
          <ul class="nav nav-pills mb-4 profile-tabs" role="tablist">
            <li class="nav-item" role="presentation">
              <button class="nav-link" :class="{ active: activeTab === 'details' }" @click="activeTab = 'details'">
                <i class="bi bi-info-circle me-2"></i> Details
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button class="nav-link" :class="{ active: activeTab === 'services' }" @click="activeTab = 'services'">
                <i class="bi bi-list-columns-reverse me-2"></i> Active Ads
              </button>
            </li>
            <li class="nav-item" v-if="isOwnProfile" role="presentation">
              <button class="nav-link" :class="{ active: activeTab === 'favorites' }" @click="activeTab = 'favorites'">
                <i class="bi bi-heart me-2"></i> Favorites
              </button>
            </li>
            <li class="nav-item" v-if="isOwnProfile" role="presentation">
              <button class="nav-link" :class="{ active: activeTab === 'add' }" @click="activeTab = 'add'">
                <i class="bi bi-plus-circle me-2"></i> Add New Service
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button class="nav-link" :class="{ active: activeTab === 'reviews' }" @click="activeTab = 'reviews'">
                <i class="bi bi-star me-2"></i> Reviews
              </button>
            </li>
          </ul>
        </div>

        <div class="tab-content profile-tab-content p-4 rounded">
          
          <div v-if="activeTab === 'details'">
            <h4 class="content-title">User Details</h4>
            
            <p class="content-text"><strong>Email:</strong> {{ user?.email }}</p>

            <h5 class="mt-4 details-subtitle">About Me:</h5>
            <p class="content-text about-text">{{ user?.about || 'Nema dostupnog opisa.' }}</p>

            <p class="content-text"><strong>Profession:</strong> {{ user?.profession }}</p>
            <p class="content-text"><strong>City:</strong> {{ user?.city }}</p>
            <p class="content-text"><strong>Contact Phone:</strong> {{ user?.phone }}</p>
          </div>

          <ServicesList
            v-if="activeTab === 'services'"
            ref="servicesListRef"
            :userId="route.params.id ? route.params.id : loggedInUserId"
            :isOwnProfile="isOwnProfile"
          />

          <FavoritesList
            v-if="activeTab === 'favorites' && isOwnProfile"
          />

          <AddService
            v-if="activeTab === 'add' && isOwnProfile"
            @serviceAdded="refreshServices"
          />

          <Reviews v-if="activeTab === 'reviews'" />
        </div>
      </div>
    </div>
    
    <div v-else class="error-state-container">
      <i class="bi bi-person-fill-exclamation error-icon"></i>
      <h2 class="error-title">Profile Not Found</h2>
      <p class="error-message">The requested user profile could not be loaded or does not exist.</p>
    </div>
  </div>
</template>

<script setup>
// OSTATAK JAVASCRIPT LOGIKE OSTAJE ISTI
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

// LOADING STATE (Using only one state for the whole page)
const leftLoading = ref(true);

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
  leftLoading.value = true;
  user.value = null; 

  try {
    const token = localStorage.getItem("token");
    let res;

    if (route.params.id) {
      res = await api.get(`/users/${route.params.id}`, {
        headers: { Authorization: token ? `Bearer ${token}` : undefined },
      });
      user.value = res.data;
    } else {
      await userStore.fetchUser();
      user.value = userStore.$state.user;
    }

    loggedInUserId.value = userStore.$state.user?._id;

  } catch (err) {
    console.error("Error fetching user:", err);
    user.value = null;
  } finally {
    leftLoading.value = false;
  }
};

onMounted(fetchUser);
watch(() => route.params.id, () => fetchUser());

const isOwnProfile = computed(() =>
  !route.params.id || route.params.id === loggedInUserId.value
);
</script>

<style scoped>

.profile-page {
  background-color: var(--color-white);
  min-height: 90vh; 
}

/* Base Layout */
.profile-layout,
.profile-layout-skeleton {
  display: flex;
  flex-wrap: wrap;
}

/* Content specific styling */
.profile-card-wrapper > :deep(.profile-header),
.skeleton-header-box {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 5px 20px var(--color-shadow);
  background: var(--color-white);
  height: fit-content;
}

/* TABS SCROLL CONTAINER WITH SHADOW INDICATOR */
.tabs-scroll-container {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  margin-left: 10px;
  margin-right: 10px;
  position: relative;
}

.profile-tabs {
  flex-wrap: nowrap;
  white-space: nowrap;
  margin-left: 5px; 
  padding-bottom: 5px; 
}

/* Hide scrollbar visually */
.tabs-scroll-container::-webkit-scrollbar {
  display: none;
}
.tabs-scroll-container {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* Tabs Styling (Nav-Pills) */
.profile-tabs .nav-item {
    padding: 0 5px; 
}
.profile-tabs .nav-link {
  color: var(--color-blue);
  background-color: var(--color-white);
  border: 1px solid var(--color-border-light);
  font-weight: 600;
  border-radius: 8px;
  transition: background-color 0.3s, color 0.3s;
  padding: 8px 15px;
}

.profile-tabs .nav-link.active {
  background-color: var(--color-orange);
  color: var(--color-white);
  border-color: var(--color-orange-dark);
  box-shadow: 0 2px 8px rgba(234, 126, 61, 0.3);
}

.profile-tabs .nav-link:not(.active):hover {
  background-color: var(--color-orange-lighter);
  color: var(--color-text-dark);
  border-color: var(--color-orange-light);
}

/* TAB CONTENT (BORDER REMOVED) */
.profile-tab-content {
  background: var(--color-white);
  border-radius: 12px;
  box-shadow: 0 5px 20px var(--color-shadow);
  padding: 30px !important;
  border: none !important; /* Uklonjen border */
}

.content-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-blue-dark);
  border-bottom: 2px solid var(--color-border-light);
  padding-bottom: 10px;
  margin-bottom: 20px;
}

.details-subtitle {
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--color-orange);
  margin-bottom: 5px;
}

.content-text {
  font-size: 1rem;
  color: var(--color-gray);
}
.about-text {
    white-space: pre-wrap; /* Osigurava prikaz formatiranja (novih linija) ako user.about sadrži takve znakove */
    margin-bottom: 20px;
}


/* ======================================= */
/* 4. SKELETON LOADING STYLES */
/* ======================================= */

.skeleton-box {
  background-color: #e9ecef; 
  border-radius: 8px;
  opacity: 0.7;
  animation: pulse 1.5s infinite ease-in-out;
}

@keyframes pulse {
  0% { opacity: 0.7; }
  50% { opacity: 0.4; }
  100% { opacity: 0.7; }
}

/* Left Side Skeleton */
.skeleton-header-box {
  padding: 30px;
}
.avatar-placeholder {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  margin: 0 auto;
}
.title-placeholder {
  width: 80%;
  height: 25px;
  margin: 15px auto 8px;
}
.text-placeholder.short {
  width: 50%;
  height: 15px;
  margin: 0 auto;
}
.button-placeholder {
  width: 100%;
  height: 40px;
  background-color: var(--color-blue-light); 
}

/* Right Side Skeleton */
.skeleton-tabs-box {
  display: flex;
  gap: 10px;
  padding: 0 15px;
}
.tab-item {
  width: 120px;
  height: 40px;
}
.tab-content-skeleton {
  border: none !important;
  border-radius: 8px;
  margin-top: 15px; 
  padding: 30px;
  background: var(--color-white);
  box-shadow: 0 5px 20px var(--color-shadow);
}

/* Simplified content lines for tab content skeleton */
.section-heading-placeholder {
  width: 200px;
  height: 25px;
  margin-bottom: 15px;
}
.text-placeholder.long {
  width: 90%;
  height: 18px;
}
.text-placeholder.medium {
  width: 60%;
  height: 18px;
}


/* ======================================= */
/* 5. RESPONSIVE ADJUSTMENTS (MOBILE) */
/* ======================================= */

@media (max-width: 767.98px) {
  .profile-layout, .profile-layout-skeleton {
    gap: 0;
  }

  .profile-card-wrapper > :deep(.profile-header),
  .profile-tab-content,
  .skeleton-header-box,
  .tab-content-skeleton {
    box-shadow: none !important;
    border-radius: 0 !important;
    border: none !important;
  }
  
  .profile-tab-content {
      padding-left: 15px !important;
      padding-right: 15px !important;
  }
  
  .profile-card-wrapper, 
  .profile-content-wrapper {
    padding-left: 0 !important;
    padding-right: 0 !important;
  }
  
  .tabs-scroll-container {
      box-shadow: none;
  }

  .skeleton-tabs-box {
    padding: 0 15px;
  }
}
</style>
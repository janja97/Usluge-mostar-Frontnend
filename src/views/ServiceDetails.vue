<template>
  <div class="service-details container py-5">
    
    <div v-if="loading" class="service-container skeleton-container">
      <div class="image-slider">
        <div class="skeleton-box image-placeholder"></div>
      </div>
      <div class="details-section">
        <div class="skeleton-box badge-placeholder mb-3"></div>
        <div class="skeleton-box title-placeholder mb-3"></div>
        <div class="skeleton-box text-placeholder short mb-4"></div>
        <div class="skeleton-info-box mb-4">
          <div class="skeleton-box info-item-placeholder"></div>
          <div class="skeleton-box info-item-placeholder"></div>
        </div>
        <div class="skeleton-box section-heading-placeholder"></div>
        <div class="skeleton-box text-placeholder long"></div>
        <div class="skeleton-box text-placeholder medium"></div>
        <div class="skeleton-box button-placeholder mt-auto pt-4"></div>
      </div>
    </div>

    <div v-if="showAuthError" class="custom-modal-backdrop" @click="showAuthError = false">
      <div class="custom-modal" @click.stop>
        <div class="modal-header">
          <h5 class="modal-title">Authentication Error</h5>
          <button type="button" class="close-btn" @click="showAuthError = false">&times;</button>
        </div>
        <div class="modal-body">
          <p>{{ authErrorMessage }}</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary" @click="goToLoginAndCloseModal">Log In</button>
          <button class="btn btn-secondary" @click="showAuthError = false">Close</button>
        </div>
      </div>
    </div>
    
    <div v-else-if="service" class="service-container">
      
      <div class="image-slider">
        <button 
          v-if="displayedImages.length > 1" 
          class="arrow left" 
          @click.stop="prevImage"
          aria-label="Previous image"
        >
          &#10094;
        </button>
        
        <img
          v-if="displayedImages.length > 0"
          :src="displayedImages[currentImageIndex]"
          :alt="'Service image ' + (service.customService || service.subcategory || service.category)"
          class="service-image"
        />
        <div v-else class="service-placeholder">
          <i class="bi bi-image" style="font-size: 3rem;"></i>
          <span class="mt-3">No image available</span>
        </div>
        
        <button 
          v-if="displayedImages.length > 1" 
          class="arrow right" 
          @click.stop="nextImage"
          aria-label="Next image"
        >
          &#10095;
        </button>

        <i
          :class="['bi', isFavorite ? 'bi-heart-fill fav-active' : 'bi-heart', 'favorite-icon']"
          @click.stop="toggleFavorite"
          title="Add to favorites"
        ></i>
      </div>

      <div class="details-section">
        
        <div class="mode-badge-container mb-3">
          <span 
            class="mode-badge" 
            :class="{ 
              'badge-offer': service.mode === 'offer', 
              'badge-demand': service.mode === 'demand' 
            }"
          >
            {{ service.mode === 'offer' ? 'OFFER' : 'DEMAND' }}
          </span>
        </div>

        <h1 class="service-title">
          {{ service.customService || formatCategory(service.subcategory || service.category || 'Unknown Service') }}
        </h1>
        
        <p v-if="service.category && service.subcategory" class="text-muted subcategory-text mb-3">
          {{ formatCategory(service.category) }} / {{ formatCategory(service.subcategory) }}
        </p>

        <hr class="my-3">

        <div class="quick-info-box mb-4 p-3">
          <div class="info-item">
            <i class="bi bi-cash-stack"></i>
            <span class="fw-bold">{{ service.price != null ? service.price + ' KM' : 'By arrangement' }}</span>
          </div>
          <div class="info-item">
            <i class="bi bi-geo-alt"></i>
            <span>{{ service.city || 'Unknown City' }}</span>
          </div>
          <div class="info-item">
            <i class="bi bi-clock"></i>
            <span>{{ formatPriceType(service.priceType) }}</span>
          </div>
        </div>
        
        <h3 class="section-heading mt-3 mb-2">Service Description</h3>
        <p class="service-description">{{ service.description || "No detailed description." }}</p>

        <div class="user-actions mt-auto pt-4 border-top">
          <div class="user-info d-flex align-items-center mb-3">
            <div class="d-flex flex-column">
              <span class="mb-0 text-muted small">Posted by:</span>
              <router-link
                v-if="service.user"
                :to="`/profile/${service.user._id}`"
                class="user-name text-decoration-none fw-bold"
              >
                {{ service.user.fullName || 'Anonymous User' }}
              </router-link>
              <span v-else class="user-name">Unknown User</span>
              
            </div>
          </div>

          <div class="buttons d-flex flex-wrap">
            <p>{{ service.user && service.user._id !== getLoggedUserId() }}</p>
            <button
              v-if="service.user && service.user._id !== getLoggedUserId()"
              class="btn btn-primary me-2 mb-2"
              @click="goToChat"
            >
              <i class="bi bi-chat-dots me-1"></i> Send Message
            </button>
            <button class="btn btn-outline-secondary mb-2" @click="router.back()">
              <i class="bi bi-arrow-left me-1"></i> Back
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="error-container">
      <i class="bi bi-search-heart-dizzy error-icon"></i>
      <h2 class="error-title">Oops! Service Not Found.</h2>
      <p class="error-message">It looks like the requested ad does not exist or has been deleted.</p>
      
      <button class="btn btn-primary btn-lg mt-3" @click="router.back()">
        <i class="bi bi-arrow-left me-2"></i> Go Back
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "../services/api";
import categoriesData from "../data/services.json";
// Assuming you have a user store to get the logged-in user's ID
import { useUserStore } from '../store/user'; 

const route = useRoute();
const router = useRouter();
const userStore = useUserStore(); // Initialize User Store

const service = ref(null);
const loading = ref(true); // Default to true, show loading
const favorites = ref([]);
const isFavorite = ref(false);
const currentImageIndex = ref(0);

// Reactive state for custom modal
const showAuthError = ref(false);
const authErrorMessage = ref('');

// Helper functions for fetching state from localStorage
const getAuthToken = () => localStorage.getItem("token");
// Use user store for logged-in user ID for reliability
const getLoggedUserId = () => userStore.user?._id; 

/**
 * @description Displays a custom modal with an authentication error message.
 * @param {string} message - The error message to display.
 */
const showCustomModal = (message) => {
  authErrorMessage.value = message;
  showAuthError.value = true;
};

/**
 * @description Closes the modal and navigates to the login page.
 */
const goToLoginAndCloseModal = () => {
  showAuthError.value = false;
  router.push('/login');
};

// Computed property for handling images (Base64 or fallback)
const displayedImages = computed(() => {
  if (service.value?.images?.length) {
    // Convert Base64 image data to a URL format
    return service.value.images.map((img) => `data:image/jpeg;base64,${img}`);
  }

  const categoryItem = categoriesData.find(
    (cat) =>
      cat.category.toLowerCase() === service.value?.category?.toLowerCase()
  );

  // Fallback to category image or general placeholder
  return categoryItem && categoryItem.image
    ? [categoryItem.image]
    : ["/img/home/placeholder.png"];
});

onMounted(async () => {
  // 🚀 OPTIMIZATION: Run async calls in parallel
  try {
    const servicePromise = fetchService();
    // Only fetch favorites if a token exists
    const favoritesPromise = getAuthToken() ? fetchFavorites() : Promise.resolve();

    await Promise.all([servicePromise, favoritesPromise]);
  } catch (err) {
    console.error("Error fetching data:", err);
  } finally {
    // Loading stops only after all data fetching attempts are complete
    loading.value = false;
  }
});

/**
 * @description Fetches selected service details from the API.
 */
const fetchService = async () => {
  const token = getAuthToken();
  try {
    const res = await api.get(`/services/${route.params.id}`, {
      headers: { Authorization: token ? `Bearer ${token}` : undefined },
    });
    service.value = res.data;
  } catch (err) {
    console.error("❌ Error fetching service:", err);
    // If 404 or similar error, explicitly set service to null to show error UI
    if (err.response && (err.response.status === 404 || err.response.status === 500)) {
      service.value = null; 
    }
    throw err; 
  }
};

/**
 * @description Fetches all user favorites and checks if the current service is included.
 */
const fetchFavorites = async () => {
  const token = getAuthToken();
  if (!token) return;

  try {
    const res = await api.get("/favorites", {
      headers: { Authorization: `Bearer ${token}` },
    });
    favorites.value = res.data;
    checkIfFavorite();
  } catch (err) {
    console.error("❌ Error fetching favorites:", err);
    throw err;
  }
};

/**
 * @description Checks if the current service ID exists in the fetched favorites list.
 */
const checkIfFavorite = () => {
  if (service.value && favorites.value.length) {
    isFavorite.value = favorites.value.some(
      (fav) => fav._id === service.value._id
    );
  } else {
    isFavorite.value = false;
  }
};

/**
 * 🚀 IMPLEMENTED FIX: Redirects to the Messenger page and passes the service owner's ID
 * as a query parameter to automatically open the chat.
 */
const goToChat = () => {
  const loggedUserId = getLoggedUserId();
  const token = getAuthToken();
  const recipientId = service.value?.user?._id;

  if (!loggedUserId || !token) {
    showCustomModal("You must be logged in to send messages to other users.");
    return;
  }
  
  if (recipientId) {
    router.push({
      name: 'Messenger', // Assuming your Messenger route name is 'Messenger'
      query: { userId: recipientId }
    });
  } else {
    console.error("Recipient ID not found for this service.");
  }
};

/**
 * @description Toggles the favorite status of the service (add/remove).
 */
const toggleFavorite = async () => {
  const loggedUserId = getLoggedUserId();
  const token = getAuthToken();

  if (!loggedUserId || !token) {
    showCustomModal("You must be logged in to add a service to favorites.");
    return;
  }
  
  try {
    await api.post(`/favorites/${route.params.id}`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    isFavorite.value = !isFavorite.value;
  } catch (err) {
    console.error("❌ Error toggling favorite:", err.response?.data || err);
    showCustomModal("An error occurred while saving favorites. Please check your login status.");
  }
};

// Helper functions for display formatting (translations)
const formatCategory = (text) => text.replace(/_/g, " ");

const formatPriceType = (priceType) => {
  switch (priceType) {
    case "dogovor": return "By Arrangement";
    case "sat": return "Per Hour";
    case "dnevno": return "Per Day";
    default: return priceType;
  }
};

const nextImage = () => {
  if (!displayedImages.value.length) return;
  currentImageIndex.value =
    (currentImageIndex.value + 1) % displayedImages.value.length;
};

const prevImage = () => {
  if (!displayedImages.value.length) return;
  currentImageIndex.value =
    (currentImageIndex.value - 1 + displayedImages.value.length) %
    displayedImages.value.length;
};
</script>

<style scoped>
/* ALL STYLES REMAIN UNCHANGED */

/* GENERAL STYLES */

.service-container {
  display: flex;
  flex-wrap: wrap;
  gap: 30px; 
  max-width: 1000px;
  margin: 0 auto;
  background: var(--color-white);
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  padding: 30px;
}

/* 1. IMAGE SLIDER */
.image-slider {
  position: relative;
  flex: 0 0 380px;
  height: 300px; 
  overflow: hidden;
  border-radius: 12px;
  background-color: var(--color-light-gray);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.service-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.service-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-weight: 600;
  color: var(--color-secondary);
}

/* ARROW BUTTONS */
.arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.5rem;
  background: rgba(0, 0, 0, 0.4); 
  color: var(--color-white);
  border: none;
  width: 40px;
  height: 40px;
  line-height: 40px; 
  text-align: center;
  cursor: pointer;
  border-radius: 50%;
  z-index: 10;
  transition: background 0.2s ease;
  user-select: none; 
}
.arrow:hover { background: rgba(0, 0, 0, 0.7); }
.arrow.left { left: 10px; }
.arrow.right { right: 10px; }

/* Favorite heart */
.favorite-icon {
  position: absolute;
  top: 15px;
  right: 15px;
  font-size: 2.2rem;
  cursor: pointer;
  color: var(--color-white);
  text-shadow: 0 0 10px rgba(0, 0, 0, 0.8);
  transition: transform 0.2s;
}
.fav-active { color: #dc3545 !important; }
.favorite-icon:hover { transform: scale(1.1); }

/* 2. DETAILS SECTION */
.details-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding-top: 10px;
}
.mode-badge-container {
  min-height: 25px;
}
.mode-badge {
  display: inline-block;
  padding: 6px 15px;
  font-size: 0.8rem;
  font-weight: 700;
  border-radius: 20px;
  letter-spacing: 1px;
  text-transform: uppercase;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.badge-offer {
  background-color: var(--color-green);
  color: var(--color-white);
}
.badge-demand {
  background-color: var(--color-yellow);
  color: var(--color-text-dark);
}
.service-title {
  font-size: 2.2rem;
  font-weight: 800;
  color: var(--color-text-dark);
  line-height: 1.2;
}
.subcategory-text {
    font-size: 1rem;
    font-weight: 500;
}
.section-heading {
    font-size: 1.2rem;
    font-weight: 700;
    color: var(--color-primary);
}
.service-description {
  font-size: 1rem;
  color: #444;
  line-height: 1.7;
}

/* Quick Info Box (Price/Location) */
.quick-info-box {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  background-color: var(--color-light-gray);
  border-radius: 10px;
  gap: 15px;
  padding: 15px; 
}
.info-item {
  display: flex;
  align-items: center;
  font-size: 1rem;
  color: var(--color-text-dark);
  flex: 1 1 45%;
}
.info-item i {
  font-size: 1.2rem;
  color: var(--color-primary);
  margin-right: 8px;
}

/* User Info and Actions */
.user-actions { 
  margin-top: 30px; 
}
.user-name { 
  font-size: 1.1rem;
  color: var(--color-text-dark); 
  transition: color 0.2s;
}
.user-name:hover { color: var(--color-primary); }

.buttons .btn-primary {
  
    font-weight: 600;
}


/* ======================================= */
/* 3. SKELETON LOADING STYLES */
/* ======================================= */

.skeleton-container {
  padding: 30px;
}

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

.image-placeholder {
  width: 100%;
  height: 300px; 
}
.badge-placeholder {
  width: 80px;
  height: 25px;
}
.title-placeholder {
  width: 90%;
  height: 35px;
}
.text-placeholder {
  height: 18px;
}
.text-placeholder.short {
  width: 50%;
}
.text-placeholder.medium {
  width: 70%;
  margin-top: 10px;
}
.text-placeholder.long {
  width: 100%;
  margin-bottom: 10px;
}
.section-heading-placeholder {
  width: 150px;
  height: 22px;
  margin-top: 20px;
  margin-bottom: 10px;
}
.skeleton-info-box {
  display: flex;
  justify-content: space-between;
  gap: 15px;
  padding: 15px;
  background-color: #f1f3f5;
  border-radius: 10px;
}
.info-item-placeholder {
  width: 45%;
  height: 30px;
}
.button-placeholder {
  width: 100%;
  height: 45px;
  margin-top: 20px !important;
}


/* ======================================= */
/* 4. ERROR PAGE DESIGN (Service Not Found) */
/* ======================================= */

.error-container {
  max-width: 600px;
  margin: 80px auto;
  text-align: center;
  padding: 40px;
  border-radius: 15px;
  background: var(--color-white);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
}

.error-icon {
  font-size: 5rem;
  color: #dc3545; 
  margin-bottom: 20px;
  display: block;
}
.error-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text-dark);
}
.error-message {
  font-size: 1.1rem;
  color: var(--color-secondary);
  margin-bottom: 30px;
}

/* ======================================= */
/* 5. CUSTOM MODAL STYLES */
/* ======================================= */

.custom-modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5); 
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050; 
}

.custom-modal {
  background: var(--color-white);
  border-radius: 8px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  animation: fadeIn 0.3s ease-out;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  background-color: var(--color-light-gray);
}

.modal-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-text-dark);
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  color: var(--color-secondary);
}

.modal-body {
  padding: 20px;
}

.modal-footer {
  padding: 10px 20px 20px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Responsive adjustments */
@media (max-width: 992px) {
  .service-container, .skeleton-container {
    flex-direction: column;
    gap: 20px;
    padding: 20px;
    box-shadow: none;
  }
  .image-slider {
    flex: 1 1 auto;
    max-width: 100%;
    height: 350px;
  }
  .details-section {
    flex: 1 1 100%;
  }
  .skeleton-info-box {
    flex-direction: column;
  }
  .info-item-placeholder {
    width: 100%;
  }
}
</style>
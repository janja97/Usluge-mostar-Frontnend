<template>
  <div class="profile-header p-4">
    <div class="d-flex flex-wrap justify-content-center flex-column">
      
      <div class="position-relative d-flex justify-content-center avatar-section">
        <div class="profile-icon-wrapper d-flex justify-content-center align-items-center">
          <template v-if="avatarSrc">
            <img :src="avatarSrc" alt="Profile Image" class="profile-image" />
          </template>
          <template v-else>
            <i class="bi bi-person-circle text-blue-lighter" style="font-size: 100px;"></i>
          </template>
        </div>

        <div v-if="isOwnProfile" class="settings-btn" @click="openModal">
          <i class="bi bi-gear-fill"></i>
        </div>
      </div>

      <div class="text-center mt-3">
        <div class="stars" v-if="averageRating !== null && averageRating > 0">
          <span v-for="n in 5" :key="n">
            <i
              class="bi"
              :class="n <= Math.round(averageRating) ? 'bi-star-fill text-orange' : 'bi-star text-orange'"
            ></i>
          </span>
          <p class="mt-1 rating-text">
            {{ averageRating.toFixed(1) }} / 5 ({{ totalReviewsCount }} reviews)
          </p>
        </div>

        <div class="text-muted rating-text" v-else>
          Korisnik još nije ocijenjen.
        </div>
      </div>

      <div class="d-flex flex-column align-items-center justify-content-center text-center mt-4">
        <h1 v-if="displayUser" class="mb-1 profile-name">{{ displayUser.fullName }}</h1>
        <p v-if="displayUser?.profession" class="profile-profession">{{ displayUser.profession }}</p>
        <p v-if="displayUser?.city" class="profile-city">
            <i class="bi bi-geo-alt-fill me-1"></i>
            {{ displayUser.city }}
        </p>
        
        <div v-if="!isOwnProfile" class="mt-3 w-100">
            <button class="btn btn-primary-custom w-75">
                <i class="bi bi-chat-dots me-2"></i> Kontaktiraj
            </button>
        </div>
      </div>
    </div>

    <div class="modal fade" id="settingsModal" tabindex="-1" aria-hidden="true" ref="modalRef">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header modal-header-custom">
            <h5 class="modal-title">Edit Profile</h5>
            <button type="button" class="btn-close btn-close-white" @click="closeModal"></button>
          </div>

          <div class="modal-body">
            <form @submit.prevent="saveChanges">
              <div class="mb-3">
                <label class="form-label">Profile Image</label>
                <input type="file" @change="handleImageUpload" class="form-control form-control-sm" />
                <img v-if="previewImage" :src="previewImage" class="profile-preview-img mt-2" />
              </div>
              <div class="mb-3">
                <label class="form-label">Full Name</label>
                <input v-model="form.fullName" class="form-control form-control-sm" />
              </div>
              <div class="mb-3">
                <label class="form-label">Phone</label>
                <input v-model="form.phone" class="form-control form-control-sm" />
              </div>
              <div class="mb-3">
                <label class="form-label">New Password (leave blank if unchanged)</label>
                <input type="password" v-model="form.password" class="form-control form-control-sm" />
              </div>
              <div class="mb-3">
                <label class="form-label">City</label>
                <input v-model="form.city" class="form-control form-control-sm" />
              </div>
              
              <div class="mb-3">
                <label class="form-label">Profession</label>
                <select v-model="form.profession" class="form-select form-select-sm">
                    <option value="">Odaberite profesiju</option>
                    <option v-for="prof in professionsList" :key="prof" :value="prof">
                        {{ prof }}
                    </option>
                </select>
              </div>

              <div class="mb-3">
                <label class="form-label">Birth Year</label>
                <input type="number" v-model="form.birthYear" class="form-control form-control-sm" />
              </div>
              <div class="mb-3">
                <label class="form-label">About Me</label>
                <textarea v-model="form.about" class="form-control form-control-sm" rows="3"></textarea>
              </div>
            </form>
          </div>

          <div class="modal-footer modal-footer-custom d-flex justify-content-between align-items-center">
            <button type="button" class="btn btn-delete" @click="deleteUser">
                <i class="bi bi-trash-fill me-1"></i> Delete Profile
            </button>
            <div>
              <button type="button" class="btn btn-secondary-custom me-2" @click="closeModal">Cancel</button>
              <button type="button" class="btn btn-primary-custom" @click="saveChanges">
                <i class="bi bi-save me-1"></i> Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, watch } from "vue";
import api from "../../services/api";

// ⚠️ Assumption: The JSON file is available via this import. Adjust the path if necessary.
import professionsData from "../../data/profession.json"; 

// Sort the list of professions (good practice)
const professionsList = professionsData.sort((a, b) => a.localeCompare(b, 'hr'));

export default {
  props: {
    user: { type: Object, required: false },
    isOwnProfile: { type: Boolean, required: true }
  },
  emits: ["updateUser", "deleteUser"],
  setup(props, { emit }) {
    const modalRef = ref(null);
    const previewImage = ref(null);
    const averageRating = ref(null);
    const totalReviewsCount = ref(0); // <-- REFERENCE FOR TOTAL REVIEWS

    const displayUser = computed(() => props.user || null);

    // Computed property to display avatar image from byte array
    const avatarSrc = computed(() => {
      if (!displayUser.value?.avatar?.data) return null;

      try {
        const byteArray =
          displayUser.value.avatar.data.data || displayUser.value.avatar.data;
        const base64String = btoa(
          new Uint8Array(byteArray).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            ""
          )
        );
        return `data:${displayUser.value.avatar.contentType};base64,${base64String}`;
      } catch (e) {
        console.error("Error processing avatar data:", e);
        return null;
      }
    });

    // Function to fetch the user's rating summary
    const fetchRating = async () => {
      if (!displayUser.value?._id) {
        averageRating.value = null; 
        totalReviewsCount.value = 0; // Reset count
        return;
      }

      try {
        const userId = displayUser.value._id;
        // The API now correctly returns 'totalReviews'
        const { data } = await api.get(`/reviews/user/${userId}/summary`);

        averageRating.value = data.averageRating ? parseFloat(data.averageRating.toFixed(1)) : 0;
        totalReviewsCount.value = data.totalReviews || 0; // <-- CORRECTLY READING 'totalReviews' from API
      } catch (err) {
        console.error("Error fetching rating summary:", err);
        averageRating.value = 0;
        totalReviewsCount.value = 0; // Reset count on error
      }
    };

    // Form state for the modal
    const form = reactive({
      fullName: "",
      phone: "",
      password: "",
      city: "",
      profession: "",
      birthYear: "",
      about: "",
      avatar: null
    });

    // Watch for user data changes to fetch rating and populate form
    watch(
      displayUser,
      (newUser) => {
        fetchRating(); // Fetch rating when user data changes
        if (newUser) {
          form.fullName = newUser.fullName || "";
          form.phone = newUser.phone || "";
          form.city = newUser.city || "";
          form.profession = newUser.profession || "";
          form.birthYear = newUser.birthYear || "";
          form.about = newUser.about || "";
          form.password = ""; 
        }
      },
      { immediate: true, deep: true }
    );

    const handleImageUpload = (e) => {
      const file = e.target.files[0];
      if (file) {
        form.avatar = file;
        previewImage.value = URL.createObjectURL(file);
      }
    };

    const openModal = () => {
      // Repopulate form with current data before opening
      if (displayUser.value) {
          form.fullName = displayUser.value.fullName || "";
          form.phone = displayUser.value.phone || "";
          form.city = displayUser.value.city || "";
          form.profession = displayUser.value.profession || "";
          form.birthYear = displayUser.value.birthYear || "";
          form.about = displayUser.value.about || "";
          form.password = ""; 
      }
      previewImage.value = avatarSrc.value; // Show current image

      // Ensure Bootstrap is loaded before trying to use it
      if (typeof bootstrap !== 'undefined') {
        const modal = new bootstrap.Modal(modalRef.value);
        modal.show();
      } else {
          console.error("Bootstrap object is not defined.");
      }
    };

    const closeModal = () => {
      if (typeof bootstrap !== 'undefined') {
        const modalInstance = bootstrap.Modal.getInstance(modalRef.value);
        if (modalInstance) modalInstance.hide();
      }
      previewImage.value = null;
      form.avatar = null;
    };

    const saveChanges = async () => {
      try {
        const formData = new FormData();
        
        // Helper function to check and append field only if changed and not empty
        const appendFieldIfChanged = (key) => {
            const currentValue = form[key];
            const originalValue = props.user[key];
            
            if (currentValue !== originalValue && currentValue !== "" && currentValue !== null) {
                formData.append(key, currentValue);
            }
        };

        // Append standard fields
        appendFieldIfChanged('fullName');
        appendFieldIfChanged('phone');
        appendFieldIfChanged('city');
        appendFieldIfChanged('profession');
        appendFieldIfChanged('birthYear');
        appendFieldIfChanged('about');
        
        // Special handling for password: append only if a new one is entered
        if (form.password) {
            formData.append('password', form.password);
        }
        
        // Special handling for image
        if (form.avatar) {
            formData.append('avatar', form.avatar);
        }
        
        // If no changes were made, just close the modal
        if (Array.from(formData.keys()).length === 0) {
            closeModal();
            return;
        }

        const { data } = await api.put("/users/profile", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });

        emit("updateUser", data);
        closeModal();
      } catch (err) {
        console.error("Error updating profile:", err);
      }
    };

    const deleteUser = async () => {
      if (!confirm("Are you sure you want to delete your profile? This action is permanent.")) return;
      try {
        await api.delete("/users/profile");
        emit("deleteUser", displayUser.value._id);
        localStorage.removeItem("token");
        window.location.href = "/"; // Redirect to homepage or login
      } catch (err) {
        console.error("Error deleting user:", err);
      }
    };

    return {
      form,
      modalRef,
      previewImage,
      displayUser,
      avatarSrc,
      averageRating,
      totalReviewsCount, // RETURNED: Available in template
      professionsList, 
      handleImageUpload,
      openModal,
      closeModal,
      saveChanges,
      deleteUser
    };
  }
};
</script>

<style scoped>
/* ======================================= */
/* CUSTOM VARIABLES AND STYLES */
/* ======================================= */
:root {
  /* Variables re-defined for reference */
  --color-blue: rgba(22, 58, 94);
  --color-blue-dark: #15304e;
  --color-orange: rgba(234, 126, 61);
  --color-orange-dark: #c86f33;
  --color-blue-lighter: #6e93b6;
  --color-gray: #334155;
  --color-gray-light: #f5f5f5;
  --color-white: #ffffff;
  --color-shadow: rgba(0, 0, 0, 0.15);
}

.profile-header {
    background-color: var(--color-white);
}

/* AVATAR AND SETTINGS */
.avatar-section {
    padding-top: 10px;
}

.profile-icon-wrapper {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    border: 4px solid var(--color-blue-lighter);
    background-color: var(--color-gray-light);
    overflow: hidden;
}

.profile-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.settings-btn {
  position: absolute;
  top: 0;
  right: 20px; 
  background: var(--color-blue);
  color: var(--color-white);
  border-radius: 50%;
  width: 35px;
  height: 35px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  box-shadow: 0 2px 8px var(--color-shadow);
  transition: background-color 0.2s;
}

.settings-btn:hover {
    background: var(--color-blue-dark);
}

/* TEXT AND RATINGS */
.profile-name {
    font-size: 1.8rem;
    font-weight: 700;
    color: var(--color-blue-dark);
}
.profile-profession {
    font-size: 1.1rem;
    font-weight: 500;
    color: var(--color-orange-dark);
    margin-top: -5px;
}
.profile-city {
    font-size: 0.9rem;
    color: var(--color-gray);
    margin-bottom: 0;
}
.text-blue-lighter {
    color: var(--color-blue-lighter) !important;
}
.text-orange {
    color: var(--color-orange) !important;
}
.rating-text {
    font-size: 0.9rem;
    color: var(--color-gray);
}
.btn-primary-custom {
    background-color: var(--color-blue);
    border-color: var(--color-blue);
    color: var(--color-white);
    font-weight: 600;
    transition: background-color 0.2s;
}
.btn-primary-custom:hover {
    background-color: var(--color-blue-dark);
    border-color: var(--color-blue-dark);
}

/* MODAL STYLES */
.modal-header-custom {
    background-color: var(--color-blue);
    color: var(--color-white);
    border-bottom: none;
}
.btn-close-white {
    filter: brightness(0) invert(1); /* Turns black X to white X */
}
.modal-footer-custom {
    background-color: var(--color-gray-light);
    border-top: 1px solid #dee2e6;
}
.profile-preview-img {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--color-orange-dark);
}
.btn-secondary-custom {
    background-color: var(--color-gray-light);
    border-color: var(--color-gray-light);
    color: var(--color-gray);
    font-weight: 500;
}
.btn-secondary-custom:hover {
    background-color: #e0e0e0;
}
.btn-delete {
    background-color: #dc3545;
    border-color: #dc3545;
    color: var(--color-white);
    font-weight: 600;
}
.btn-delete:hover {
    background-color: #c82333;
    border-color: #bd2130;
}

/* Custom styles for modal inputs */
.form-label {
    font-weight: 600;
    color: var(--color-blue-dark);
    margin-bottom: 0.25rem;
    font-size: 0.9rem;
}
.form-control-sm, .form-select-sm {
    border-radius: 6px;
}
</style>
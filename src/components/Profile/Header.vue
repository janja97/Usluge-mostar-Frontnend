<template>
  <div class="about-me p-3">
    <div class="d-flex flex-wrap justify-content-center flex-column">
      <div class="position-relative d-flex justify-content-center">
        <!-- Profilna slika -->
        <div class="profile-icon-wrapper d-flex justify-content-center align-items-center">
          <template v-if="avatarSrc">
            <img :src="avatarSrc" alt="Profile Image" class="profile-image" />
          </template>
          <template v-else>
            <i class="bi bi-person-circle text-secondary" style="font-size: 100px;"></i>
          </template>
        </div>

        <!-- Settings button -->
        <div v-if="isOwnProfile" class="settings-btn" @click="openModal">
          <i class="bi bi-gear"></i>
        </div>
      </div>

      <!-- Podaci o korisniku -->
      <div class="d-flex flex-column align-items-center justify-content-center text-center mt-5">
        <h1 v-if="displayUser" class="mb-1 playfair">{{ displayUser.fullName }}</h1>
        <p v-if="displayUser?.profession" class="playfair">{{ displayUser.profession }}</p>
      </div>
    </div>

    <!-- Edit Profile Modal -->
    <div class="modal fade" id="settingsModal" tabindex="-1" aria-hidden="true" ref="modalRef">
      <div class="modal-dialog">
        <div class="modal-content">
          <!-- Header -->
          <div class="modal-header">
            <h5 class="modal-title">Edit Profile</h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>

          <!-- Body -->
          <div class="modal-body">
            <form @submit.prevent="saveChanges">
              <div class="mb-2">
                <label>Profile Image</label>
                <input type="file" @change="handleImageUpload" class="form-control" />
                <img v-if="previewImage" :src="previewImage" class="profile-preview-img mt-2" />
              </div>
              <div class="mb-2">
                <label>Full Name</label>
                <input v-model="form.fullName" class="form-control" />
              </div>
              <div class="mb-2">
                <label>Phone</label>
                <input v-model="form.phone" class="form-control" />
              </div>
              <div class="mb-2">
                <label>New Password</label>
                <input type="password" v-model="form.password" class="form-control" />
              </div>
              <div class="mb-2">
                <label>City</label>
                <input v-model="form.city" class="form-control" />
              </div>
              <div class="mb-2">
                <label>Profession</label>
                <input v-model="form.profession" class="form-control" />
              </div>
              <div class="mb-2">
                <label>Birth Year</label>
                <input type="number" v-model="form.birthYear" class="form-control" />
              </div>
              <div class="mb-2">
                <label>About Me</label>
                <textarea v-model="form.about" class="form-control"></textarea>
              </div>
            </form>
          </div>

          <!-- Footer -->
          <div class="modal-footer d-flex justify-content-between align-items-center">
            <button type="button" class="btn btn-danger" @click="deleteUser">Delete</button>
            <div>
              <button type="button" class="btn btn-secondary" @click="closeModal">Cancel</button>
              <button type="button" class="btn btn-primary" @click="saveChanges">Save</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, watch } from "vue";
import axios from "axios";
import api from "../../services/api";


export default {
  props: {
    user: { type: Object, required: false },
    loggedInUser: { type: Object, required: false },
    isOwnProfile: { type: Boolean, required: true }
  },
  emits: ["updateUser", "deleteUser"],
  setup(props, { emit }) {
    const modalRef = ref(null);
    const previewImage = ref(null);

    const displayUser = computed(() => props.user || props.loggedInUser || null);

    const avatarSrc = computed(() => {
      if (displayUser.value?.avatar?.data) {
        const byteArray = displayUser.value.avatar.data.data || displayUser.value.avatar.data;
        const base64String = btoa(
          new Uint8Array(byteArray).reduce((data, byte) => data + String.fromCharCode(byte), "")
        );
        return `data:${displayUser.value.avatar.contentType};base64,${base64String}`;
      }
      return null;
    });

    const form = reactive({
      fullName: displayUser.value?.fullName || "",
      phone: displayUser.value?.phone || "",
      password: "",
      city: displayUser.value?.city || "",
      profession: displayUser.value?.profession || "",
      birthYear: displayUser.value?.birthYear || "",
      about: displayUser.value?.about || "",
      avatar: null,
    });

    watch(
      () => displayUser.value,
      (newUser) => {
        if (newUser) {
          form.fullName = newUser.fullName;
          form.phone = newUser.phone;
          form.city = newUser.city;
          form.profession = newUser.profession;
          form.birthYear = newUser.birthYear;
          form.about = newUser.about;
        }
      },
      { immediate: true }
    );

    const handleImageUpload = (e) => {
      const file = e.target.files[0];
      if (file) {
        form.avatar = file;
        previewImage.value = URL.createObjectURL(file);
      }
    };

    const openModal = () => {
      const modal = new bootstrap.Modal(modalRef.value);
      modal.show();
    };

    const closeModal = () => {
      const modalInstance = bootstrap.Modal.getInstance(modalRef.value);
      if (modalInstance) modalInstance.hide();
    };

    const saveChanges = async () => {
      try {
        const formData = new FormData();
        for (const key in form) {
          if (form[key]) formData.append(key, form[key]);
        }

        const { data } = await api.put('/users/profile', formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        emit("updateUser", data);
        closeModal();
      } catch (err) {
        console.error("Error updating profile:", err);
      }
    };

    const deleteUser = async () => {
      if (!confirm("Are you sure you want to delete your profile?")) return;
      try {
        await api.delete("/users/profile");
        emit("deleteUser", displayUser.value._id);
        localStorage.removeItem("token");
        window.location.href = "/";
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
      handleImageUpload,
      openModal,
      closeModal,
      saveChanges,
      deleteUser,
    };
  },
};
</script>

<style scoped>
.settings-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  cursor: pointer;
}
.profile-image {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #ccc;
}
.profile-preview-img {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #ccc;
}
</style>

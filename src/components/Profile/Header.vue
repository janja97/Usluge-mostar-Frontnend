<template>
  <div class="about-me p-3">
    <div class="d-flex flex-wrap justify-content-center flex-column">
      <div class="position-relative d-flex justify-content-center">
        <!-- User avatar ili Bootstrap ikona -->
        <div class="profile-icon-wrapper d-flex justify-content-center align-items-center">
          <i class="bi bi-person-circle text-secondary" style="font-size: 100px;"></i>
        </div>

        <!-- Settings button -->
        <div v-if="user && user._id === loggedInUserId" class="settings-btn" @click="openModal">
          <i class="bi bi-gear"></i>
        </div>
      </div>

      <!-- User info -->
      <div
        class="d-flex flex-column align-items-center justify-content-center text-center mt-5"
      >
        <h1 v-if="user" class="mb-1 playfair">
          {{ fullName }}
        </h1>
        <p v-if="user && user.profession" class="playfair">
          {{ user.profession }}
        </p>
      </div>
    </div>

    <!-- Edit Profile Modal -->
    <div
      class="modal fade"
      id="settingsModal"
      tabindex="-1"
      aria-hidden="true"
      ref="modalRef"
    >
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
            <button type="button" class="btn btn-danger" @click="deleteUser">
              Delete
            </button>
            <div>
              <button type="button" class="btn btn-secondary" @click="closeModal">
                Cancel
              </button>
              <button type="button" class="btn btn-primary" @click="saveChanges">
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { ref, reactive, computed, watch } from "vue";

export default {
  props: {
    user: { type: Object, required: false },
    loggedInUserId: { type: String, required: false },
  },
  emits: ["updateUser", "deleteUser"],
  setup(props, { emit }) {
    const modalRef = ref(null);

    const form = reactive({
      fullName: props.user?.fullName || "",
      phone: props.user?.phone || "",
      password: "",
      city: props.user?.city || "",
      profession: props.user?.profession || "",
      birthYear: props.user?.birthYear || "",
      about: props.user?.about || "",
      avatar: null,
    });

    const fullName = computed(
      () => props.user?.fullName || `${props.user?.firstName || ""} ${props.user?.lastName || ""}`
    );

    watch(
      () => props.user,
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
      { deep: true }
    );

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
        Object.keys(form).forEach((key) => {
          if (form[key] !== null && form[key] !== "") {
            formData.append(key, form[key]);
          }
        });

        const { data } = await axios.put("/users/profile", formData, {
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
        await axios.delete("/users/profile");
        emit("deleteUser", props.user._id);
        localStorage.removeItem("token");
        window.location.href = "/";
      } catch (err) {
        console.error("Error deleting user:", err);
      }
    };

    return {
      form,
      fullName,
      modalRef,
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
</style>

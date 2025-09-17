<template>
  <div class="about-me p-3">
    <div class="d-flex flex-wrap justify-content-center flex-column">
      <div class="position-relative d-flex justify-content-center">
        <!-- Slika -->
        <img
          src="../../assets/dash.jpg"
          alt="Dashboard"
          class="profile-img"
        />

        <!-- Settings button -->
        <div
          class="settings-btn"
          data-bs-toggle="modal"
          data-bs-target="#settingsModal"
        >
          <i class="bi bi-gear"></i>
        </div>
      </div>


      <!-- Info o useru -->
      <div class="d-flex flex-column align-items-center justify-content-center text-center mt-5">
        <h1 v-if="user" class="mb-1 playfair">
          {{ fullName }}
        </h1>
        <p v-if="user && user.profession" class="playfair">{{ user.profession }}</p>
       
      </div>
    </div>

    <!-- Modal -->
    <div class="modal fade" id="settingsModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <!-- Header -->
          <div class="modal-header">
            <h5 class="modal-title">Uredi profil</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>

          <!-- Body -->
          <div class="modal-body">
            <form>
              <div class="mb-3">
                <label class="form-label">Ime i prezime</label>
                <input type="text" class="form-control" v-model="editUser.fullName" />
              </div>
              <div class="mb-3">
                <label class="form-label">Telefon</label>
                <input type="text" class="form-control" v-model="editUser.phone" />
              </div>
              <div class="mb-3">
                <label class="form-label">Grad</label>
                <input type="text" class="form-control" v-model="editUser.city" />
              </div>
              <div class="mb-3">
                <label class="form-label">Email</label>
                <input type="email" class="form-control" v-model="editUser.email" disabled />
              </div>
            </form>
          </div>

          <!-- Footer -->
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" @click="saveChanges">Save</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, watch } from "vue";
import axios from "axios";

const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["updateUser"]);

const editUser = reactive({ ...props.user });

// kad se user promijeni izvana → update lokalne kopije
watch(
  () => props.user,
  (newVal) => {
    Object.assign(editUser, newVal);
  },
  { deep: true }
);

const fullName = computed(
  () =>
    props.user?.fullName ||
    `${props.user?.firstName || ""} ${props.user?.lastName || ""}`
);

const saveChanges = async () => {
  try {
    const res = await axios.put(`/users/${props.user._id}`, editUser);
    emit("updateUser", res.data); // pošalji novi user roditelju
    const modal = bootstrap.Modal.getInstance(document.getElementById("settingsModal"));
    modal.hide(); // zatvori modal
  } catch (err) {
    console.error("Greška pri update:", err);
  }
};
</script>
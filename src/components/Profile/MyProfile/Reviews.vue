<template>
  <div class="reviews p-3">
    <h4>Komentari korisnika</h4>

    <!-- lista postojećih komentara -->
    <div v-if="loading" class="text-muted">Učitavanje komentara...</div>

    <div v-else-if="reviews.length === 0" class="text-muted">
      Ovaj korisnik još nema komentara.
    </div>

    <div v-else>
      <div
        v-for="review in reviews"
        :key="review._id"
        class="border rounded p-3 mb-3 shadow-sm"
      >
        <div class="d-flex justify-content-between align-items-center">
          <strong>{{ review.reviewer?.fullName || 'Nepoznati korisnik' }}</strong>
          <span class="text-warning">⭐ {{ review.rating }}/5</span>
        </div>
        <p class="mb-1">{{ review.comment }}</p>
        <small class="text-muted">{{ formatDate(review.createdAt) }}</small>
      </div>
    </div>

    <!-- forma za dodavanje recenzije -->
    <div v-if="canAddReview" class="mt-4">
      <h5>Ostavi komentar i ocjenu</h5>

      <div class="mb-2">
        <label>Ocjena:</label>
        <select v-model="newReview.rating" class="form-select w-auto">
          <option disabled value="">Odaberi ocjenu</option>
          <option v-for="n in 5" :key="n" :value="n">{{ n }} ⭐</option>
        </select>
      </div>

      <div class="mb-2">
        <textarea
          v-model="newReview.comment"
          class="form-control"
          placeholder="Napiši svoj komentar..."
          rows="3"
        ></textarea>
      </div>

      <button
        @click="submitReview"
        class="btn btn-primary"
        :disabled="submitting"
      >
        Pošalji
      </button>

      <p v-if="errorMsg" class="text-danger mt-2">{{ errorMsg }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import { useUserStore } from "../../../store/user";
import api from "../../../services/api";

const route = useRoute();
const userStore = useUserStore();

const reviews = ref([]);
const loading = ref(true);
const submitting = ref(false);
const errorMsg = ref("");
const newReview = ref({ rating: "", comment: "" });

// dohvaćanje svih recenzija
const fetchReviews = async () => {
  // odredi ID korisnika čije recenzije dohvaćamo
  const userId = route.params.id || userStore.$state.user?._id;

  if (!userId) {
    console.error("❌ Nije moguće dohvatiti recenzije – ID korisnika nije dostupan.");
    loading.value = false;
    return;
  }

  loading.value = true;
  try {
    const res = await api.get(`/reviews/user/${userId}`);
    reviews.value = res.data;
  } catch (err) {
    console.error("❌ Greška pri dohvaćanju komentara:", err);
  } finally {
    loading.value = false;
  }
};


// logika – može li korisnik dodati recenziju
const canAddReview = computed(() => {
  const loggedUser = userStore.$state.user;
  if (!loggedUser || !route.params.id) return false;
  return loggedUser._id !== route.params.id;
});

const submitReview = async () => {
  const reviewedUserId = route.params.id;

  if (!reviewedUserId) {
    errorMsg.value = "Ne može se dodati recenzija – ID korisnika nedostaje.";
    return;
  }

  if (!newReview.value.rating) {
    errorMsg.value = "Molimo odaberite ocjenu.";
    return;
  }

  try {
    submitting.value = true;
    await api.post(
      `/reviews`,
      {
        reviewedUser: reviewedUserId,
        rating: newReview.value.rating,
        comment: newReview.value.comment,
      },
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );

    // reset forme i error poruke
    newReview.value = { rating: "", comment: "" };
    errorMsg.value = "";

    // ponovno dohvaćanje recenzija
    await fetchReviews();
  } catch (err) {
    console.error("❌ Greška pri slanju recenzije:", err);
    errorMsg.value =
      err.response?.data?.message || "Došlo je do greške. Pokušajte ponovo.";
  } finally {
    submitting.value = false;
  }
};

const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString("hr-HR");

onMounted(fetchReviews);
</script>

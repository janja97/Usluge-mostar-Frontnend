<template>
  <div class="reviews p-0">
    <h4 class="tab-title mb-4">Komentari korisnika</h4>

    <div v-if="loading" class="text-center py-4">
      <div class="spinner-border text-blue-dark" role="status">
        <span class="visually-hidden">Učitavanje...</span>
      </div>
      <p class="mt-2 text-muted">Učitavanje komentara...</p>
    </div>

    <div v-else-if="reviews.length === 0" class="empty-state text-center py-5">
      <i class="bi bi-chat-left-text-fill text-muted mb-3"></i>
      <p class="text-muted">Ovaj korisnik još nema komentara. Budite prvi!</p>
    </div>

    <div v-else class="reviews-list">
      <div
        v-for="review in reviews"
        :key="review._id"
        class="review-card mb-3"
      >
        <div class="d-flex justify-content-between align-items-start mb-2">
          <div class="reviewer-info">
            <i class="bi bi-person-circle me-2"></i>
            <strong class="reviewer-name">{{ review.reviewer?.fullName || 'Nepoznati korisnik' }}</strong>
          </div>
          
          <div class="rating-display">
            <span class="rating-stars me-1">{{ renderStars(review.rating) }}</span>
            <span class="rating-score text-orange-dark">({{ review.rating }}/5)</span>
          </div>
        </div>
        
        <p class="comment-text mb-2">{{ review.comment || 'Korisnik nije ostavio tekstualni komentar.' }}</p>
        
        <div class="d-flex justify-content-end">
            <small class="text-muted review-date">
                <i class="bi bi-calendar-event me-1"></i>
                {{ formatDate(review.createdAt) }}
            </small>
        </div>
      </div>
    </div>

    <div v-if="canAddReview" class="mt-4 review-form-container p-4">
      <h5 class="form-title">Ostavi komentar i ocjenu</h5>

      <form @submit.prevent="submitReview">
        <div class="mb-3">
          <label for="rating-select" class="form-label review-label">Ocjena *</label>
          <select v-model="newReview.rating" id="rating-select" class="form-select w-auto rating-select-input" required>
            <option disabled value="">Odaberi ocjenu</option>
            <option v-for="n in 5" :key="n" :value="n">{{ renderStars(n) }} ({{ n }}/5)</option>
          </select>
        </div>

        <div class="mb-3">
          <label for="comment-textarea" class="form-label review-label">Komentar (Opcionalno)</label>
          <textarea
            v-model="newReview.comment"
            id="comment-textarea"
            class="form-control"
            placeholder="Napiši svoje iskustvo, preporuku ili kritiku..."
            rows="3"
          ></textarea>
        </div>

        <button
          type="submit"
          class="btn btn-review-submit"
          :disabled="submitting || !newReview.rating"
        >
          <span v-if="submitting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          Pošalji Komentar
        </button>

        <p v-if="errorMsg" class="text-danger mt-3 fw-bold">{{ errorMsg }}</p>
      </form>
    </div>
  </div>
</template>

<script setup>
// *** LOGIKA JE NETAKNUTA ***
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

// Utility funkcija za generiranje zvijezdica
const renderStars = (rating) => {
    const fullStar = '★'; // Pun znak zvjezdice
    const emptyStar = '☆'; // Prazan znak zvjezdice
    const maxRating = 5;
    
    let stars = '';
    for (let i = 0; i < maxRating; i++) {
        stars += i < rating ? fullStar : emptyStar;
    }
    return stars;
};

// dohvaćanje svih recenzija
const fetchReviews = async () => {
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
        errorMsg.value = ""; // Resetiraj poruku prije slanja
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
        console.error("❌ Greška pri slanju recenzije:", err.response?.data || err);
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

<style scoped>
/* ======================================= */
/* DIZAJN I BOJE */
/* ======================================= */
:root {
  --color-blue: rgba(22, 58, 94);
  --color-blue-dark: #15304e;
  --color-orange: rgba(234, 126, 61);
  --color-orange-dark: #c86f33;
  --color-gray-light: #f5f5f5;
  --color-white: #ffffff;
}

.reviews {
    padding: 0;
}

.tab-title {
    color: var(--color-blue-dark);
    border-bottom: 2px solid var(--color-gray-light);
    padding-bottom: 15px;
}

/* ======================================= */
/* KARTE RECIJENZIJA */
/* ======================================= */
.review-card {
    background-color: var(--color-white);
    border: 1px solid #e9ecef;
    border-radius: 8px;
    padding: 18px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    transition: transform 0.2s;
}

.review-card:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
}

.reviewer-info {
    font-size: 1rem;
    color: var(--color-blue-dark);
}

.reviewer-name {
    font-weight: 700;
}

.rating-display {
    font-size: 1.1rem;
    font-weight: 600;
}

.rating-stars {
    color: gold; /* Ostavljam zlatnu za zvjezdice */
    letter-spacing: 2px;
}

.rating-score {
    font-size: 0.9rem;
    color: #6c757d;
    font-weight: 500;
}

.comment-text {
    font-style: italic;
    font-size: 0.95rem;
    color: #343a40;
    margin-left: 28px; /* Poravnanje s imenom */
    padding-left: 10px;
    border-left: 3px solid var(--color-gray-light);
}

.review-date {
    font-size: 0.8rem;
    color: #adb5bd !important;
}

.empty-state i {
    font-size: 3rem;
    color: #e9ecef !important;
}

/* ======================================= */
/* FORMA ZA UNOS */
/* ======================================= */

.review-form-container {
    background-color: var(--color-gray-light);
    border-radius: 10px;
    border: 1px solid #dee2e6;
}

.form-title {
    color: var(--color-blue);
    font-weight: 700;
    padding-bottom: 10px;
    border-bottom: 1px dashed #ced4da;
    margin-bottom: 20px;
}

.review-label {
    font-weight: 600;
    color: var(--color-blue-dark);
    margin-bottom: 5px;
}

.rating-select-input {
    border-radius: 6px;
    border: 1px solid #ced4da;
    color: var(--color-blue-dark);
}

.form-control {
    border-radius: 6px;
    border: 1px solid #ced4da;
    padding: 0.6rem 0.75rem;
}

.form-control:focus {
    border-color: var(--color-orange);
    box-shadow: 0 0 0 0.25rem rgba(234, 126, 61, 0.25);
}

.btn-review-submit {
    background-color: var(--color-orange-dark);
    border-color: var(--color-orange-dark);
    color: var(--color-white);
    font-weight: 600;
    padding: 0.6rem 1.2rem;
    border-radius: 8px;
    transition: background-color 0.2s;
}

.btn-review-submit:hover:not(:disabled) {
    background-color: var(--color-orange);
    border-color: var(--color-orange);
}
</style>
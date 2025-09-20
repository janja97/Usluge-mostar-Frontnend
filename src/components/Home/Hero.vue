<template>
  <section class="hero-section">
    <div class="container">
      <div class="hero-content">
        <div class="text-content">
          <h1 class="hero-title">Sve usluge na jednom mjestu</h1>
          <p class="hero-subtitle">
            Pregledajte sve dostupne usluge – od čuvanja djece, šetnje pasa, keramičarskih radova do električarskih usluga. Kliknite na oglas i stupite u kontakt s osobom koja pruža uslugu. Brzo, jednostavno i sigurno.
          </p>
          <div class="hero-buttons">
            <router-link to="/services" class="btn primary">Pronadi posao</router-link>

            <!-- <router-link to="/register" class="btn primary">Registriraj se</router-link>
            <router-link to="/login" class="btn secondary">Prijavi se</router-link> -->
          </div>
        </div>

        <!-- Slideshow -->
        <div class="hero-image">
          <transition-group name="fade" tag="div" class="d-flex">
            <img
              v-for="(image, index) in [currentImage]"
              :key="image"
              :src="`/img/home/${image}`"
              alt="Hero"
              class="slideshow-img"
            />
          </transition-group>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";

const images = [
  "babysiting.png",
  "cleaning.png",
  "cleaning_window.png",
  "cleaningpool.png",
  "cleaning_service.png",
  "garden.png",
  "oldmen.png",
  "teacher.png",
  "teacher2.png",
  "serviser.png",
  "electricity.png",
  "pointe.png"
];

const currentIndex = ref(0);
const currentImage = ref(images[currentIndex.value]);
let intervalId = null;

onMounted(() => {
  intervalId = setInterval(() => {
    currentIndex.value = (currentIndex.value + 1) % images.length;
    currentImage.value = images[currentIndex.value];
  }, 7000); 
});

onBeforeUnmount(() => {
  clearInterval(intervalId);
});
</script>

<style scoped>
.hero-section {
  padding: 6rem 2rem;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
}

.container {
  max-width: 1200px;
  width: 100%;
}

.hero-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
}

.text-content {
  flex: 1;
  text-align: left;
}

.hero-title {
  font-size: 3rem;
  font-weight: 700;
  color: #111;
  margin-bottom: 1rem;
}

.hero-subtitle {
  font-size: 1.25rem;
  color: #555;
  margin-bottom: 2rem;
}

.hero-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}



/* Slideshow */
.hero-image {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative; 
  width: 350px;
  height: 350px;
}

.slideshow-img {
  position: absolute; 
  top: 0;
  left: 0;
  width: 350px;
  height: 350px;
  object-fit: cover;
  border-radius: 1rem;
  background: transparent;
}

/* Animation */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 2s ease, filter 2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  filter: blur(20px);
}

@media (max-width: 768px) {
  .hero-content {
    flex-direction: column;
    text-align: center;
  }

  .text-content {
    text-align: center;
  }

  .hero-buttons {
    flex-direction: row; 
    justify-content: center; 
    gap: 1rem; 
  }

  .slideshow-img {
    display: none;
  }

  .hero-title {
    font-size: 2.25rem;
  }
  .hero-subtitle {
    font-size: 1rem;
  }
  .hero-image{
    width: 0;
    height: 0;
  }
}
</style>

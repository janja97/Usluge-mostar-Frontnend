<template>
  <div class="error-page">
    <img src="/img/error/error.png" alt="Error" class="error-image" />
    <p>Stranica nije pronađena.</p>
    <router-link to="/" class="btn primary">Vrati se na početnu</router-link>
  </div>
</template>

<script setup>
</script>

<style scoped>
.error-page {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 80px);
  background: var(--bg-dark-blue);
  text-align: center;
  padding: 60px;
}

.error-image {
  width: 100%;
  max-width: 500px; 
  height: auto;
  margin-bottom: 20px;
}

p {
  font-size:2rem;
  margin-bottom: 20px;
  color: var(--color-orange);
  font-weight: 500;
}

 @media (max-width: 480px) {
  .error-page {
    padding: 20px;
    min-height: calc(100vh - 200px);
  }
}
</style>

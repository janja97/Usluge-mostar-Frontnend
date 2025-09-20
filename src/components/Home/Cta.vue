<template>
  <!-- CTA Section -->
  <section class="cta-section text-center py-5">
    <div class="container">
      <h2 class="mb-4">Pridruži se sada!</h2>
      <router-link to="/register" class="btn cta-btn btn-lg">Registriraj se besplatno</router-link>
    </div>
  </section>
</template>

<style scoped>
.cta-section {
  background: var(--bg-dark-blue);
  color: var(--color-text-light);  
}

.cta-section h2 {
  margin-bottom: 1.5rem;
}

.cta-btn {
  background-color: var(--color-orange); 
  color: #fff;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 9999px;
  font-weight: 500;
  transition: background 0.3s ease;
}

.cta-btn:hover {
  background-color: var(--color-orange-hover); 
  color: #fff;
}
</style>

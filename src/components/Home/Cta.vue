<template>
  <section class="final-cta py-5" aria-labelledby="final-cta-heading">
    <div class="container text-center">
      
      <p class="cta-subtitle">Jednostavno, brzo i sigurno.</p>
      <h2 id="final-cta-heading">Spremni za rješavanje problema ili pronalazak klijenata?</h2>
      
      <a href="/register" class="btn-cta-large mt-4">
        Registriraj se besplatno i započni!
      </a>
      
    </div>
  </section>
</template>

<script>
export default {
  name: 'FinalCta'
}
</script>

<style scoped>
/* FINAL CTA - DARK BACKGROUND */
.final-cta {
    /* Set to dark background */
    background-color: var(--color-blue-dark);
    color: var(--color-text-light); 
    padding: 5rem 2rem;
}

.cta-subtitle {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--color-orange); /* Highlighted subtitle in orange */
    margin-bottom: 0.5rem;
    text-transform: uppercase;
}

.final-cta h2 {
    /* Main H2 tag for SEO and prominence */
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--color-text-light);
    margin-bottom: 2rem;
}

/* Reusing the large button style */
.btn-cta-large {
    display: inline-block;
    padding: 15px 40px;
    font-size: 1.3rem;
    font-weight: 700;
    text-decoration: none;
    border-radius: 50px; 
    cursor: pointer;
    text-transform: uppercase;
    
    background-color: var(--color-orange);
    color: var(--color-white);
    border: 2px solid var(--color-orange);
    box-shadow: 0 8px 15px rgba(234, 126, 61, 0.4);
    transition: all 0.3s ease;
}

.btn-cta-large:hover {
    background-color: var(--color-orange-hover);
    border-color: var(--color-orange-hover);
    box-shadow: 0 4px 8px rgba(234, 126, 61, 0.6);
    transform: translateY(-2px);
}

/* Media Queries */
@media (max-width: 768px) {
    .final-cta {
        padding: 3rem 1rem;
    }
    .final-cta h2 {
        font-size: 2rem;
    }
    .btn-cta-large {
        width: 100%;
        font-size: 1.1rem;
        padding: 15px 20px;
        box-sizing: border-box;
    }
}
</style>
<template>
  <section class="key-features py-5" aria-labelledby="key-features-heading">
    <div class="container">
      <h2 id="key-features-heading" class="section-title text-center mb-5">Zašto odabrati našu platformu?</h2>
      
      <div class="features-grid">
        
        <div class="feature-card">
          <div class="feature-icon">
            <span class="feature-symbol">🛡️</span> 
          </div>
          <h3 class="feature-title">Provjereni Majstori</h3>
          <p class="feature-description">
            Svi ponuđači usluga prolaze rigorozne provjere. Vaša sigurnost je naš prioritet.
          </p>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon">
            <span class="feature-symbol">⚡</span>
          </div>
          <h3 class="feature-title">Brzo i Lokalno</h3>
          <p class="feature-description">
            Pronađite pomoć u svojoj neposrednoj blizini, što osigurava brz dolazak i realizaciju posla.
          </p>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon">
            <span class="feature-symbol">📞</span>
          </div>
          <h3 class="feature-title">24/7 Podrška</h3>
          <p class="feature-description">
            Naš tim za podršku dostupan je u svakom trenutku za sva vaša pitanja i pomoć.
          </p>
        </div>

      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'KeyFeatures'
}
</script>

<style scoped>
/* KEY FEATURES - DARK BACKGROUND */
.key-features {
    /* Set to dark background */
    background-color: var(--color-blue-dark); 
    color: var(--color-text-light); /* Light text for contrast */
    padding: 6rem 2rem;
}

.section-title {
    font-size: 3rem;
    font-weight: 700;
    color: var(--color-text-light); 
    margin-bottom: 3rem;
}

/* Decorative line */
.section-title::after {
    content: '';
    display: block;
    width: 60px;
    height: 3px;
    background-color: var(--color-orange);
    margin: 10px auto 0;
    border-radius: 2px;
}

/* Grid for cards */
.features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2.5rem;
}

.feature-card {
    text-align: center;
    padding: 2.5rem 1.5rem;
    background-color: var(--color-blue); /* Slightly lighter dark color for card */
    border-radius: 12px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    transition: transform 0.3s ease;
    border-top: 5px solid var(--color-orange);
}

.feature-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
}

.feature-icon {
    margin-bottom: 1rem;
}

.feature-symbol {
    font-size: 3rem;
    line-height: 1;
    color: var(--color-orange); 
}

.feature-title {
    /* Using h3 for SEO hierarchy */
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 0.75rem;
    color: var(--color-orange-light); 
}

.feature-description {
    font-size: 1rem;
    color: var(--color-blue-lighter);
}

/* Media Queries */
@media (max-width: 768px) {
    .key-features {
        padding: 4rem 1rem;
    }
    .section-title {
        font-size: 2.2rem;
    }
}
</style>
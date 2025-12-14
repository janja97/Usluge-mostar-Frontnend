<template>
  <section class="how-it-works-redesign py-5" aria-labelledby="how-it-works-heading">
    <div class="container">
      
      <div class="header-content text-center mb-5">
        <h2 id="how-it-works-heading">Jednostavan put do uspjeha</h2>
        <p class="section-intro-redesign">
          Bilo da tražiš pouzdanu pomoć ili želiš ponuditi svoje vještine, naša platforma je najbrži i najsigurniji put do realizacije.
        </p>
      </div>

      <div class="steps-grid">
        
        <div class="step-card">
          <div class="step-icon">
            <span class="step-symbol">🔍</span> 
          </div>
          <h3 class="step-title">1. Pronađi ili Ponudi</h3>
          <p class="step-description">
            Koristite filtriranu pretragu da pronađete lokalne majstore ili objavite detaljan oglas o svojim uslugama/potrebama.
          </p>
        </div>
        
        <div class="step-card">
          <div class="step-icon">
            <span class="step-symbol">💬</span>
          </div>
          <h3 class="step-title">2. Direktna Komunikacija</h3>
          <p class="step-description">
            Uspostavite kontakt s drugom stranom. Razmijenite informacije, dogovorite detalje posla i cijenu.
          </p>
        </div>
        
        <div class="step-card">
          <div class="step-icon">
            <span class="step-symbol">✅</span>
          </div>
          <h3 class="step-title">3. Sigurno Ostvari Posao</h3>
          <p class="step-description">
            Obavite dogovoreni posao. Ostavite recenziju i izgradite povjerenje u zajednici.
          </p>
        </div>

      </div>
      
    </div>
  </section>
</template>

<script>
export default {
  name: 'HowItWorks'
}
</script>

<style scoped>
/* HOW IT WORKS - LIGHT BACKGROUND */
.how-it-works-redesign {
    /* Set to light background */
    background-color: var(--color-gray-light); 
    color: var(--color-text-dark); 
    padding: 6rem 2rem;
    position: relative;
}

/* Header & Intro */
.header-content h2 {
    font-size: 3rem;
    color: var(--color-blue-dark);
    font-weight: 700;
    margin-bottom: 0.5rem;
}

.section-intro-redesign {
    font-size: 1.15rem;
    max-width: 700px;
    margin: 0 auto;
    color: var(--color-gray); 
}

/* Steps Grid */
.steps-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2.5rem;
    margin-top: 4rem;
}

/* Step Card */
.step-card {
    text-align: center;
    padding: 2rem;
    background-color: var(--color-white); /* White card background */
    border-radius: 10px;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    /* Using the primary color as the bottom accent */
    border-bottom: 4px solid var(--color-blue); 
}

.step-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

/* Icons */
.step-icon {
    margin-bottom: 1.5rem;
    display: block;
}

.step-symbol {
    font-size: 3rem;
    line-height: 1;
    color: var(--color-orange); /* Orange accent color for symbols */
}

.step-title {
    /* Using h3 for SEO hierarchy */
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 0.75rem;
    color: var(--color-blue-dark); 
}

.step-description {
    font-size: 1rem;
    color: var(--color-gray);
}

/* Media Queries */
@media (max-width: 768px) {
    .how-it-works-redesign {
        padding: 4rem 1rem;
    }
    .header-content h2 {
        font-size: 2.5rem;
    }
}
</style>
<template>
  <section class="faq-section py-5" aria-labelledby="faq-heading">
    <div class="container">
      <h2 id="faq-heading" class="section-title text-center mb-5">Imate pitanje? Imamo odgovor.</h2>
      
      <div class="faq-list">
        
        <div class="faq-item">
          <h3 class="faq-question">1. Kako funkcionira plaćanje usluga?</h3>
          <p class="faq-answer">
            Plaćanje se dogovara direktno s ponuđačem usluge. Platforma ne uzima proviziju od dogovorene cijene, već se plaća mala naknada za korištenje platforme pri objavljivanju oglasa.
          </p>
        </div>

        <div class="faq-item">
          <h3 class="faq-question">2. Jesu li moji osobni podaci sigurni?</h3>
          <p class="faq-answer">
            Apsolutno. Koristimo najnovije sigurnosne protokole za zaštitu vaših podataka i nikada ih ne dijelimo s trećim stranama. Komunikacija se odvija putem našeg sigurnog chat sustava.
          </p>
        </div>

        <div class="faq-item">
          <h3 class="faq-question">3. Što ako nisam zadovoljan obavljenim poslom?</h3>
          <p class="faq-answer">
            Naša platforma služi kao posrednik za povezivanje. Ako dođe do neslaganja, nudimo mehanizam rješavanja sporova i sustav recenzija koji osigurava transparentnost i kvalitetu.
          </p>
        </div>

      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'FaqSection'
}
</script>

<style scoped>
/* FAQ SECTION - LIGHT BACKGROUND */
.faq-section {
    /* Set to light background */
    background-color: var(--color-gray-light); 
    color: var(--color-text-dark);
    padding: 6rem 2rem;
}

.section-title {
    font-size: 3rem;
    font-weight: 700;
    color: var(--color-blue-dark);
    margin-bottom: 3rem;
}

.faq-list {
    max-width: 900px;
    margin: 0 auto;
}

.faq-item {
    background-color: var(--color-white); /* White card */
    border-radius: 8px;
    margin-bottom: 15px;
    padding: 20px 30px;
    border-left: 5px solid var(--color-blue); /* Blue accent line */
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    transition: background-color 0.3s ease;
}

.faq-item:hover {
    background-color: var(--color-gray-light);
}

.faq-question {
    /* Using h3 for SEO hierarchy */
    font-size: 1.3rem;
    font-weight: 600;
    color: var(--color-blue-dark); /* Dark blue questions */
    margin-bottom: 10px;
    cursor: pointer; 
}

.faq-answer {
    font-size: 1rem;
    color: var(--color-gray);
    line-height: 1.6;
    margin-top: 10px;
}

/* Media Queries */
@media (max-width: 768px) {
    .faq-section {
        padding: 4rem 1rem;
    }
    .section-title {
        font-size: 2.2rem;
    }
    .faq-question {
        font-size: 1.1rem;
    }
}
</style>
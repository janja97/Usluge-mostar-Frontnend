<template>
  <section class="testimonials-redesign py-5" aria-labelledby="testimonials-heading">
    <div class="container">
      <h2 id="testimonials-heading" class="section-title text-center mb-5">Što kažu naši zadovoljni korisnici</h2>
      
      <div class="testimonial-grid">
        
        <div class="testimonial-card">
          <p class="quote-icon">❝</p>
          <p class="quote-text">"Brzo sam pronašao mehaničara za auto u susjedstvu. Izuzetno jednostavna i super usluga!"</p>
          <div class="author-info">
            <span class="author-name">Ivan H.</span>
            <span class="author-role"> | Klijent</span>
          </div>
        </div>
        
        <div class="testimonial-card">
          <p class="quote-icon">❝</p>
          <p class="quote-text">"Objavila sam uslugu čuvanja pasa i dobila sam više upita u prvom tjednu nego u mjesec dana na drugim platformama."</p>
          <div class="author-info">
            <span class="author-name">Ana K.</span>
            <span class="author-role"> | Ponuđač usluge</span>
          </div>
        </div>
        
        <div class="testimonial-card">
          <p class="quote-icon">❝</p>
          <p class="quote-text">"Jednostavno, brzo i pouzdano. Trebala mi je hitna pomoć električara, i našao sam ga za 15 minuta. Preporučujem svima!"</p>
          <div class="author-info">
            <span class="author-name">Marko P.</span>
            <span class="author-role"> | Klijent</span>
          </div>
        </div>
        
      </div>
      
    </div>
  </section>
</template>

<script>
export default {
  name: 'Testimonials'
}
</script>

<style scoped>
/* TESTIMONIALS - MEDIUM/DARK BACKGROUND */
.testimonials-redesign {
    /* Set to medium dark color */
    background-color: var(--color-blue); 
    color: var(--color-text-light);
    padding: 6rem 2rem;
}

.section-title {
    font-size: 3rem;
    font-weight: 700;
    color: var(--color-text-light);
    margin-bottom: 3rem;
    position: relative;
    padding-bottom: 10px;
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
.testimonial-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2.5rem;
}

/* Testimonial Card */
.testimonial-card {
    background-color: var(--color-blue-dark); /* Darker card for depth */
    border-radius: 12px;
    padding: 2.5rem;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4);
    border: 1px solid var(--color-blue-light);
    position: relative;
    transition: all 0.3s ease;
}

.testimonial-card:hover {
    transform: translateY(-8px); 
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.5);
    border-color: var(--color-orange); 
}

/* Quotes */
.quote-icon {
    font-size: 4rem;
    color: var(--color-orange); 
    line-height: 0.8;
    margin-bottom: 1rem;
    position: absolute;
    top: 15px;
    left: 20px;
    opacity: 0.7; 
}

.quote-text {
    font-size: 1.15rem;
    line-height: 1.7;
    margin-bottom: 1.5rem;
    color: var(--color-blue-lighter);
    padding-top: 25px; 
    font-style: italic;
}

/* Author info */
.author-info {
    border-top: 1px solid var(--color-blue-light);
    padding-top: 15px;
    text-align: right;
}

.author-name {
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--color-orange-light); 
}

.author-role {
    font-size: 0.9rem;
    color: var(--color-blue-lighter);
    font-weight: 300;
}

/* Media Queries */
@media (max-width: 768px) {
    .testimonials-redesign {
        padding: 4rem 1rem;
    }
    .section-title {
        font-size: 2.2rem;
    }
}
</style>
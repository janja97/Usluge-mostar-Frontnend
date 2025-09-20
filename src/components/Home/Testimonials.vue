<template>
   <!-- Testimonials Section -->
  <section class="testimonials py-5">
    <div class="container">
      <h2 class="text-center mb-4">Što kažu naši korisnici</h2>
      <div class="row">
        <div class="col-12 col-md-4 mb-4">
          <div class="card text-center">
            <div class="card-body">
              <p>"Brzo sam pronašao mehaničara za auto. Super usluga!"</p>
              <h6>- Ivan H.</h6>
            </div>
          </div>
        </div>
        <div class="col-12 col-md-4 mb-4">
          <div class="card text-center">
            <div class="card-body">
              <p>"Objavila sam uslugu čuvanja pasa i dobila puno upita."</p>
              <h6>- Ana K.</h6>
            </div>
          </div>
        </div>
        <div class="col-12 col-md-4 mb-4">
          <div class="card text-center">
            <div class="card-body">
              <p>"Jednostavno i pouzdano. Preporučujem svima!"</p>
              <h6>- Marko P.</h6>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
<style scoped>
.testimonials {

  padding: 6rem 2rem;
}

.testimonials h2 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 2rem;
}

.testimonials .card {
  background: rgba(255, 255, 255, 0.05); 
  border: 1px solid var(--color-orange);
  border-radius: 1rem;
  padding: 2rem;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.testimonials .card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.3);
}

.testimonials .card p {
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.testimonials .card h6 {
  font-weight: 600;
  color: var(--color-orange);
}

@media (max-width: 768px) {
  .testimonials {
    padding: 3rem 1rem;
  }
  .testimonials h2 {
    font-size: 2rem;
  }
  .testimonials .card {
    padding: 1.5rem;
  }
}

</style>

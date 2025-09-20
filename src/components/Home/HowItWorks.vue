<template>
  <!-- How It Works Section -->
  <section class="how-it-works py-5">
    <div class="container">
      <div class="content-wrapper mb-5">
        <div class="text-side">
          <h2>Kako radi?</h2>
          <p class="section-intro">
            Naša platforma povezuje ljude koji žele ponuditi male usluge – čuvanje djece, šetnja pasa, keramičarski i električarski radovi, čišćenje, pomoć starijima – s klijentima koji traže pouzdane osobe za ove zadatke. Brzo, jednostavno i sigurno!
          </p>
        </div>
        <div class="image-side">
          <img src="../../../public/img/home/serviser.png" alt="Serviser" />
        </div>
      </div>

      <div class="row text-center">
        <div class="col-12 col-md-4 mb-4">
          <i class="fas fa-search fa-3x mb-3 text-primary"></i>
          <h5 class="fs-3">Traži usluge</h5>
          <p>Pregledaj ponuđene usluge u svojoj blizini i kontaktiraj ponuđače.</p>
        </div>
        <div class="col-12 col-md-4 mb-4">
          <i class="fas fa-plus-circle fa-3x mb-3 text-primary"></i>
          <h5 class="fs-3">Ponudi uslugu</h5>
          <p>Objavi svoju uslugu i privuci klijente koji traže tvoje vještine.</p>
        </div>
        <div class="col-12 col-md-4 mb-4">
          <i class="fas fa-handshake fa-3x mb-3 text-primary"></i>
          <h5 class="fs-3">Dogovori se</h5>
          <p>Komuniciraj, dogovori cijenu i završi posao sigurno.</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.how-it-works {
  position: relative;
  background: var(--bg-dark-blue);
  color: var(--color-text-light);
  overflow: hidden;
  padding: 6rem 2rem;
}

.content-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  flex-wrap: wrap;
}

.text-side {
  flex: 1;
  min-width: 300px;
}
.text-side h2 {
  font-size: 50px;
}
.image-side {
  flex: 1;
  min-width: 300px;
  display: flex;
  justify-content: flex-end;
}
.image-side img {
  max-width: 100%;
  height: auto;
}

.section-intro {
  font-size: 1.1rem;
  color: var(--color-text-light);
  max-width: 600px;
  margin-top: 1rem;
}

/* Card */
.row.text-center i {
  color: var(--color-blue);
}
.row.text-center p {
  max-width: 200px; 
  margin: 0 auto; 
  font-size: 0.95rem; 
}


@media (max-width: 992px) {
  .content-wrapper {
    flex-direction: column;
    text-align: center;
  }

  .image-side {
    justify-content: center;
    margin-top: 2rem;
  }
  .text-side h2  {
    font-size: 25px;
  }
}
</style>

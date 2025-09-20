<template>
  <footer class="footer py-5">
    <div class="container d-flex flex-column flex-md-row justify-content-between align-items-center">
      
      <!-- Logo / Text -->
      <div class="footer-logo mb-3 mb-md-0">
        <h3>USLUGE MOSTAR</h3>
      </div>

      <!-- Navigacija -->
      <ul class="footer-nav list-unstyled d-flex flex-column flex-md-row mb-3 mb-md-0">
        <li class="me-md-4 mb-2 mb-md-0">
          <router-link to="/">Početna</router-link>
        </li>
        <li class="me-md-4 mb-2 mb-md-0">
          <router-link to="/services">Usluge</router-link>
        </li>
        <li class="me-md-4 mb-2 mb-md-0">
          <router-link to="/login">Prijava</router-link>
        </li>
        <li class="me-md-4 mb-2 mb-md-0">
          <router-link to="/register">Registracija</router-link>
        </li>
      </ul>

      <!-- Copyright -->
      <div class="footer-copy">
        <small>&copy; 2025 Usluge Mostar. Sva prava pridržana.</small>
      </div>

    </div>
  </footer>
</template>

<style scoped>
.footer {
  background-color: #fff;
  color: #1f2937; 
  border-top: 1px solid #e5e7eb;
}

.footer-logo h3 {
  font-size: 1.5rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #111827;
}

.footer-nav a {
  color: #374151;
  text-decoration: none;
  transition: color 0.3s ease;
}

.footer-nav a:hover {
  color: var(--color-blue); 
}

.footer-copy small {
  color: #6b7280;
}

@media (max-width: 768px) {
  .footer {
    text-align: center;
  }

  .footer-nav {
    flex-direction: column;
    align-items: center;
  }

  .footer-nav li {
    margin: 0.25rem 0;
  }
}
</style>

<template>
  <div class="home-page">
    <Hero />
    
    <Services />
    
    <KeyFeatures /> 

    <HowItWorks />
    
    <Testimonials />
    
    <FaqSection /> 
    
    <FinalCta /> 
  
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../services/api';

// Postojeće komponente
import Hero from "../components/Home/Hero.vue";
import Services from "../components/Home/Services.vue"; // Ispravio sam "Serivces" u "Services" radi konzistentnosti
import HowItWorks from "../components/Home/HowItWorks.vue";
import Testimonials from '../components/Home/Testimonials.vue';

// NOVE KOMPONENTE
import KeyFeatures from '../components/Home/KeyFeatures.vue'; // Dodano
import FaqSection from '../components/Home/Faq.vue';   // Dodano
import FinalCta from '../components/Home/Cta.vue';       // Preimenovano iz Cta radi jasnoće


</script>

<style scoped>
/* Home page styling is usually minimal as components carry their own styles */
.home-page {
  /* Ensures no extra spacing or overflow issues */
  overflow-x: hidden;
}
</style>
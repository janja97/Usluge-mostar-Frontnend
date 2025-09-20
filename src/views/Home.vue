<template>
  <div class="home-page">
    <Hero />
    <Serivces />
    <HowItWorks />
    <Testimonials />
    <Cta />
  
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../services/api';
import Hero from "../components/Home/Hero.vue";
import Serivces from "../components/Home/Services.vue";
import HowItWorks from "../components/Home/HowItWorks.vue";
import Testimonials from '../components/Home/Testimonials.vue';
import Cta from '../components/Home/Cta.vue';


</script>

<style scoped>



</style>
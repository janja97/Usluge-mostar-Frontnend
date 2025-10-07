<template>
  <div class="add-service-tab p-4">
    <h3>Dodaj novu uslugu</h3>
    <form @submit.prevent="addService">
      <div class="row">
        <!-- Category -->
        <div class="col-md-6 mb-3">
          <label for="category" class="form-label">Kategorija *</label>
          <select v-model="newService.category" id="category" class="form-select" required @change="handleCategoryChange">
            <option value="">Odaberi kategoriju</option>
            <option v-for="cat in serviceCategories" :key="cat.category" :value="cat.category">
              {{ cat.category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) }}
            </option>
          </select>
        </div>

        <!-- Subcategory -->
        <div class="col-md-6 mb-3" v-if="selectedCategory && selectedCategory.subcategories.length > 0">
          <label for="subcategory" class="form-label">Podkategorija</label>
          <select v-model="newService.subcategory" id="subcategory" class="form-select">
            <option value="">Odaberi podkategoriju</option>
            <option v-for="sub in selectedCategory.subcategories" :key="sub" :value="sub">
              {{ sub.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) }}
            </option>
          </select>
        </div>

        <!-- Custom Service -->
        <div class="col-12 mb-3" v-if="newService.category === 'ostalo' && !newService.subcategory">
          <label for="customService" class="form-label">Opis usluge *</label>
          <input v-model="newService.customService" type="text" id="customService" class="form-control" placeholder="Unesite naziv usluge" required />
        </div>

        <!-- City -->
        <div class="col-md-6 mb-3">
          <label for="city" class="form-label">Grad *</label>
          <input v-model="newService.city" type="text" id="city" class="form-control" placeholder="Npr. Mostar" required />
        </div>

        <!-- Price Type -->
        <div class="col-md-6 mb-3">
          <label for="priceType" class="form-label">Tip cijene *</label>
          <select v-model="newService.priceType" id="priceType" class="form-select" required @change="handlePriceTypeChange">
            <option value="">Odaberi tip cijene</option>
            <option value="dogovor">Po dogovoru</option>
            <option value="sat">Na sat</option>
            <option value="dnevno">Na dan</option>
          </select>
        </div>

        <!-- Price -->
        <div class="col-md-6 mb-3" v-if="showPriceInput">
          <label for="price" class="form-label">Cijena ({{ newService.priceType === 'sat' ? 'KM/sat' : 'KM/dan' }}) *</label>
          <input v-model.number="newService.price" type="number" id="price" class="form-control" min="0" step="0.01" required />
        </div>

        <!-- Description -->
        <div class="col-12 mb-3">
          <label for="description" class="form-label">Opis usluge</label>
          <textarea v-model="newService.description" id="description" class="form-control" rows="4" maxlength="1000"></textarea>
          <div class="form-text">{{ wordCount }}/200 riječi</div>
        </div>
      </div>

      <button type="submit" class="btn btn-success" :disabled="!isFormValid">Spremi</button>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, getCurrentInstance } from 'vue';
import api from '../../../services/api';
import serviceCategories from '../../../data/services.json';

const { emit } = getCurrentInstance();

const newService = ref({
  category: '',
  subcategory: '',
  customService: '',
  priceType: '',
  price: null,
  description: '',
  city: ''
});

const selectedCategory = computed(() => serviceCategories.find(cat => cat.category === newService.value.category));
const wordCount = computed(() => newService.value.description ? newService.value.description.trim().split(/\s+/).filter(w => w.length>0).length : 0);
const showPriceInput = computed(() => newService.value.priceType==='sat'||newService.value.priceType==='dnevno');
const isFormValid = computed(() => newService.value.category && newService.value.city && newService.value.priceType && (newService.value.category!=='ostalo'||newService.value.customService) && (!showPriceInput.value || (newService.value.price!==null && newService.value.price>=0)));

const handleCategoryChange = () => { newService.value.subcategory=''; newService.value.customService=''; }
const handlePriceTypeChange = () => { if(newService.value.priceType==='dogovor') newService.value.price=null; }

const addService = async () => {
  if(wordCount.value>200){ alert('Opis ne smije prelaziti 200 riječi!'); return; }
  try{
    const payload = {
      category: newService.value.category,
      subcategory: newService.value.category!=='ostalo'? newService.value.subcategory||null : null,
      customService: newService.value.category==='ostalo'? newService.value.customService||'' : '',
      priceType: newService.value.priceType,
      price: newService.value.price,
      description: newService.value.description,
      city: newService.value.city
    };
    await api.post('/services', payload);
    emit('serviceAdded');
    newService.value={category:'',subcategory:'',customService:'',priceType:'',price:null,description:'',city:''};
  }catch(err){
    console.error('❌ Greška kod dodavanja usluge:', err.response?.data || err);
  }
};
</script>

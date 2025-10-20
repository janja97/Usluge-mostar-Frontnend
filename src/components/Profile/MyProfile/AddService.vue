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

        <!-- MODE -->
        <div class="col-md-6 mb-3">
          <label for="mode" class="form-label">Mode *</label>
          <select v-model="newService.mode" id="mode" class="form-select" required>
            <option value="">Odaberi</option>
            <option value="offer">Offer</option>
            <option value="demand">Demand</option>
          </select>
        </div>

        <!-- IMAGES -->
        <div class="col-12 mb-3">
          <label for="images" class="form-label">Galerija slika</label>
          <input type="file" id="images" multiple @change="handleFilesChange" accept="image/*" class="form-control" />
        </div>

        <!-- PRIKAZ SLIKA -->
        <div class="col-12 mb-3" v-if="previewImages.length">
          <label class="form-label">Pregled slika (klik na glavnu)</label>
          <div class="d-flex flex-wrap gap-2">
            <div v-for="(img, index) in previewImages" :key="index" class="position-relative">
              <img :src="img" @click="setMainImg(index)" :class="{'border border-primary': mainImgIndex===index}" style="width:100px;height:100px;object-fit:cover;cursor:pointer" />
              <span v-if="mainImgIndex===index" class="position-absolute top-0 start-0 badge bg-primary">Main</span>
            </div>
          </div>
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
import imageCompression from 'browser-image-compression';

const { emit } = getCurrentInstance();

const newService = ref({
  category: '',
  subcategory: '',
  customService: '',
  priceType: '',
  price: null,
  description: '',
  city: '',
  mode: '',
  rawFiles: []
});

const previewImages = ref([]);
const mainImgIndex = ref(0);

const selectedCategory = computed(() => serviceCategories.find(cat => cat.category === newService.value.category));
const wordCount = computed(() => newService.value.description ? newService.value.description.trim().split(/\s+/).filter(w => w.length>0).length : 0);
const showPriceInput = computed(() => newService.value.priceType==='sat'||newService.value.priceType==='dnevno');
const isFormValid = computed(() => newService.value.category && newService.value.city && newService.value.priceType && newService.value.mode && (newService.value.category!=='ostalo'||newService.value.customService) && (!showPriceInput.value || (newService.value.price!==null && newService.value.price>=0)));

const handleCategoryChange = () => { newService.value.subcategory=''; newService.value.customService=''; }
const handlePriceTypeChange = () => { if(newService.value.priceType==='dogovor') newService.value.price=null; }

const handleFilesChange = async (e) => {
  const files = Array.from(e.target.files);
  newService.value.rawFiles = [];
  previewImages.value = [];

  for (const file of files) {
    const compressedFile = await imageCompression(file, {
      maxWidthOrHeight: 600,
      maxSizeMB: 0.1,
      initialQuality: 0.6,
      useWebWorker:true
    });

    newService.value.rawFiles.push(compressedFile);

    const reader = new FileReader();
    reader.onload = event => previewImages.value.push(event.target.result);
    reader.readAsDataURL(compressedFile);
  }
  mainImgIndex.value = 0;
}

const setMainImg = (index) => { mainImgIndex.value = index; }

const addService = async () => {
  if(wordCount.value>200){ alert('Opis ne smije prelaziti 200 riječi!'); return; }
  try{
    const formData = new FormData();
    formData.append('category', newService.value.category);
    formData.append('subcategory', newService.value.subcategory || '');
    formData.append('customService', newService.value.customService || '');
    formData.append('priceType', newService.value.priceType);
    formData.append('price', newService.value.price || 0);
    formData.append('description', newService.value.description);
    formData.append('city', newService.value.city);
    formData.append('mode', newService.value.mode);
    formData.append('mainImg', mainImgIndex.value);

    newService.value.rawFiles.forEach(file => formData.append('images', file));

    await api.post('/services', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

    emit('serviceAdded');
    newService.value={category:'',subcategory:'',customService:'',priceType:'',price:null,description:'',city:'',mode:'',rawFiles:[]};
    previewImages.value = [];
    mainImgIndex.value = 0;
  }catch(err){
    console.error('❌ Greška kod dodavanja usluge:', err.response?.data || err);
  }
};
</script>

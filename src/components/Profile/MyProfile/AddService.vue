<template>
  <div class="add-service-tab p-0">
    <h3 class="tab-title mb-4">Dodaj novu uslugu / oglas</h3>
    
    <form @submit.prevent="addService" class="add-service-form p-4">
      <div class="row">

        <div class="col-md-6 mb-3">
          <label for="category" class="form-label form-label-custom required">Kategorija</label>
          <select 
            v-model="newService.category" 
            id="category" 
            class="form-select" 
            required 
            @change="handleCategoryChange"
          >
            <option value="">Odaberi kategoriju</option>
            <option v-for="cat in serviceCategories" :key="cat.category" :value="cat.category">
              {{ cat.category }}
            </option>
          </select>
        </div>

        <div class="col-md-6 mb-3" v-if="selectedCategory && selectedCategory.subcategories.length">
          <label for="subcategory" class="form-label form-label-custom">Podkategorija</label>
          <select v-model="newService.subcategory" id="subcategory" class="form-select">
            <option value="">Odaberi podkategoriju</option>
            <option v-for="sub in selectedCategory.subcategories" :key="sub" :value="sub">
              {{ sub }}
            </option>
          </select>
        </div>

        <div class="col-12 mb-3" v-if="newService.category === 'ostalo' && !newService.subcategory">
          <label for="customService" class="form-label form-label-custom required">Naziv usluge (Detaljnije)</label>
          <input v-model="newService.customService" type="text" id="customService" class="form-control" placeholder="Npr. Postavljanje pločica, Web dizajn..." required />
        </div>

        <div class="col-md-6 mb-3">
          <label for="county" class="form-label form-label-custom required">Županija / Regija</label>
          <select v-model="newService.county" id="county" class="form-select" required @change="handleCountyChange">
            <option value="">Odaberi županiju / regiju</option>
            <option v-for="(cities, countyName) in countiesAndCities" :key="countyName" :value="countyName">
              {{ countyName }}
            </option>
          </select>
        </div>

        <div class="col-md-6 mb-3" v-if="newService.county">
          <label for="city" class="form-label form-label-custom required">Grad</label>
          <select v-model="newService.city" id="city" class="form-select" required>
            <option value="">Odaberi grad</option>
            <option v-for="cityName in cityOptions" :key="cityName" :value="cityName">
              {{ cityName }}
            </option>
            <option value="custom">Drugi (unesi ručno)</option>
          </select>
        </div>

        <div class="col-md-6 mb-3" v-if="newService.city === 'custom'">
          <label for="customCity" class="form-label form-label-custom required">Unesite grad</label>
          <input v-model="customCity" type="text" id="customCity" class="form-control" placeholder="Unesite grad" required />
        </div>

        <div class="col-md-6 mb-3">
          <label for="priceType" class="form-label form-label-custom required">Tip cijene</label>
          <select v-model="newService.priceType" id="priceType" class="form-select" required @change="handlePriceTypeChange">
            <option value="">Odaberi tip cijene</option>
            <option value="dogovor">Po dogovoru</option>
            <option value="sat">Na sat</option>
            <option value="dnevno">Na dan</option>
          </select>
        </div>

        <div class="col-md-6 mb-3" v-if="showPriceInput">
          <label for="price" class="form-label form-label-custom required">
            Cijena ({{ newService.priceType === 'sat' ? 'KM/sat' : 'KM/dan' }})
          </label>
          <input 
            v-model.number="newService.price" 
            type="number" 
            id="price" 
            class="form-control" 
            min="0" 
            step="0.01" 
            placeholder="Unesite cijenu"
            required 
          />
        </div>

        <div class="col-md-6 mb-3">
          <label for="mode" class="form-label form-label-custom required">Vrsta Oglasa</label>
          <select v-model="newService.mode" id="mode" class="form-select" required :class="{'select-offer': newService.mode === 'offer', 'select-demand': newService.mode === 'demand'}">
            <option value="">Odaberi</option>
            <option value="offer">Nudim Uslugu (Ponuda)</option>
            <option value="demand">Tražim uslugu (Potražnja)</option>
          </select>
        </div>
        
        <div class="col-12 mb-3">
          <label for="description" class="form-label form-label-custom">Opis usluge</label>
          <textarea 
            v-model="newService.description" 
            id="description" 
            class="form-control" 
            rows="5" 
            maxlength="1000" 
            placeholder="Detaljno opišite uslugu, vještine, i uvjete..."
          ></textarea>
          <div class="form-text text-muted description-word-count">{{ wordCount }}/200 riječi</div>
        </div>

        <div class="col-12 mb-4">
          <label for="images" class="form-label form-label-custom">Galerija slika</label>
          <input 
            type="file" 
            id="images" 
            multiple 
            @change="handleFilesChange" 
            accept="image/*" 
            class="form-control custom-file-input" 
          />
          <div class="form-text text-muted">Maksimalno 5 slika. Preporučena veličina 600x600px.</div>
        </div>

        <div class="col-12 mb-4" v-if="previewImages.length">
          <label class="form-label form-label-custom">Pregled slika (klikom odaberi glavnu)</label>
          <div class="d-flex flex-wrap gap-3 image-preview-container">
            <div v-for="(img, index) in previewImages" :key="index" class="image-preview-item">
              <img 
                :src="img" 
                @click="setMainImg(index)" 
                class="preview-image"
                :class="{'main-img-active': mainImgIndex===index}" 
              />
              <span v-if="mainImgIndex===index" class="main-badge">Glavna</span>
            </div>
          </div>
        </div>
      </div>

      <button type="submit" class="btn btn-primary" :disabled="!isFormValid || submitting">
        <span v-if="submitting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
        <i v-else class="bi bi-plus-circle-fill me-2"></i>
        {{ submitting ? 'Spremanje...' : 'Spremi Oglas' }}
      </button>
      <div v-if="!isFormValid" class="text-danger mt-2">
          Molimo popunite sva obavezna polja (*).
      </div>
    </form>
    
    <div v-if="showSuccessToast" class="toast-notification show">
        <div class="toast-body">
            <i class="bi bi-check-circle-fill me-2"></i>
            Usluga je **uspješno dodana** i objavljena!
        </div>
    </div>

    <div v-if="showErrorToast" class="toast-notification show toast-error">
        <div class="toast-body">
            <i class="bi bi-x-circle-fill me-2"></i>
            {{ errorToastMessage }}
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, getCurrentInstance } from 'vue'
import api from '../../../services/api'
import serviceCategories from '../../../data/services.json'
import countiesAndCities from '../../../data/city.json'
import imageCompression from 'browser-image-compression'

const { emit } = getCurrentInstance()

// --- NOVO STANJE ZA OBAVIJESTI ---
const showSuccessToast = ref(false)
const showErrorToast = ref(false)
const errorToastMessage = ref("Došlo je do greške prilikom spremanja. Molimo pokušajte ponovo.")
const submitting = ref(false) // Za disable gumba prilikom slanja

// --- OSTALO STANJE (Kao prije) ---
const newService = ref({
  category: '',
  subcategory: '',
  customService: '',
  priceType: '',
  price: null,
  description: '',
  county: '',
  city: '',
  mode: '',
  rawFiles: []
})

const cityOptions = ref([])
const customCity = ref('')
const previewImages = ref([])
const mainImgIndex = ref(0)

// --- COMPUTED (Kao prije) ---
const selectedCategory = computed(() =>
  serviceCategories.find(cat => cat.category === newService.value.category)
)

const wordCount = computed(() =>
  newService.value.description
    ? newService.value.description.trim().split(/\s+/).filter(w => w.length > 0).length
    : 0
)

const showPriceInput = computed(() =>
  newService.value.priceType === 'sat' || newService.value.priceType === 'dnevno'
)

const isFormValid = computed(() => {
  const cityValid =
    newService.value.city !== 'custom'
      ? !!newService.value.city
      : !!customCity.value.trim()

  const priceValid = !showPriceInput.value || (newService.value.price !== null && newService.value.price > 0)

  return (
    newService.value.category &&
    newService.value.priceType &&
    newService.value.mode &&
    newService.value.county &&
    cityValid &&
    priceValid &&
    (newService.value.category !== 'ostalo' || newService.value.customService) &&
    wordCount.value <= 200
  )
})

// --- HANDLERS (Kao prije) ---
const handleCountyChange = () => {
  newService.value.city = ''
  customCity.value = ''
  const cities = countiesAndCities[newService.value.county]
  cityOptions.value = Array.isArray(cities) ? cities : []
}

const handleCategoryChange = () => {
  newService.value.subcategory = ''
  newService.value.customService = ''
}

const handlePriceTypeChange = () => {
  if (newService.value.priceType === 'dogovor') {
      newService.value.price = null;
  } else {
      newService.value.price = 0; 
  }
}

const handleFilesChange = async e => {
  const files = Array.from(e.target.files).slice(0, 5) 
  newService.value.rawFiles = []
  previewImages.value = []
  mainImgIndex.value = 0 

  for (const file of files) {
    try {
      const compressedFile = await imageCompression(file, {
        maxWidthOrHeight: 800, 
        maxSizeMB: 0.15, 
        initialQuality: 0.8,
        useWebWorker: true
      })
      newService.value.rawFiles.push(compressedFile)
      
      const reader = new FileReader()
      reader.onload = event => previewImages.value.push(event.target.result)
      reader.readAsDataURL(compressedFile)
    } catch (error) {
        console.error("Greška pri kompresiji slike:", error);
    }
  }
}

const setMainImg = index => (mainImgIndex.value = index)


// --- FUNKCIJA ZA PRIKAZ TOAST-A ---
const showToast = (success, message) => {
    if (success) {
        showSuccessToast.value = true;
        setTimeout(() => {
            showSuccessToast.value = false;
        }, 3500); // Prikaz traje 3.5 sekunde
    } else {
        errorToastMessage.value = message;
        showErrorToast.value = true;
        setTimeout(() => {
            showErrorToast.value = false;
        }, 5000); // Prikaz greške traje 5 sekundi
    }
}


// --- GLAVNA FUNKCIJA ZA DODAVANJE USLUGE ---
const addService = async () => {
  if (!isFormValid.value) {
      showToast(false, 'Molimo provjerite sva obavezna polja (*).')
      return;
  }
  
  submitting.value = true; // Zabrani ponovno slanje
  showErrorToast.value = false;
  showSuccessToast.value = false;
  
  try {
    const formData = new FormData()
    formData.append('category', newService.value.category)
    formData.append('subcategory', newService.value.subcategory || '')
    formData.append('customService', newService.value.customService || '')
    formData.append('priceType', newService.value.priceType)
    formData.append('price', newService.value.price || 0) 
    formData.append('description', newService.value.description)
    formData.append('county', newService.value.county)
    formData.append(
      'city',
      newService.value.city === 'custom' ? customCity.value : newService.value.city
    )
    formData.append('mode', newService.value.mode)
    formData.append('mainImg', mainImgIndex.value)

    newService.value.rawFiles.forEach(file => formData.append('images', file))

    await api.post('/services', formData, { 
        headers: { 
            'Content-Type': 'multipart/form-data', 
            Authorization: `Bearer ${localStorage.getItem("token")}`
        } 
    })

    // 1. Prikaz uspjeha (Toast)
    showToast(true)

    // 2. Obavijesti roditeljsku komponentu i resetiraj formu
    emit('serviceAdded')
    
    // Reset forme
    newService.value = { category: '', subcategory: '', customService: '', priceType: '', price: null, description: '', county: '', city: '', mode: '', rawFiles: [] }
    cityOptions.value = []
    customCity.value = ''
    previewImages.value = []
    mainImgIndex.value = 0
    document.getElementById('images').value = ''; 

  } catch (err) {
    console.error('❌ Greška kod dodavanja usluge:', err.response?.data || err)
    // Prikaz greške (Toast)
    const errorMessage = err.response?.data?.message || 'Greška prilikom spremanja usluge. Provjerite podatke.'
    showToast(false, errorMessage)
  } finally {
      submitting.value = false;
  }
}
</script>

<style scoped>
/* ======================================= */
/* DIZAJN FORME I BOJE (Kao prije) */
/* ======================================= */
:root {
  --color-blue: rgba(22, 58, 94);
  --color-blue-dark: #15304e;
  --color-orange: rgba(234, 126, 61);
  --color-orange-dark: #c86f33;
  --color-green: #198754;
  --color-red: #dc3545;
  --color-gray-light: #f5f5f5;
  --color-white: #ffffff;
}

.add-service-tab {
    background-color: var(--color-white);
    position: relative; /* Bitno za pozicioniranje toast-a */
}

.tab-title {
    color: var(--color-blue-dark);
    border-bottom: 2px solid var(--color-gray-light);
    padding-bottom: 15px;
}

.form-label-custom {
    font-weight: 600;
    color: var(--color-blue);
    font-size: 0.95rem;
    margin-bottom: 5px;
}

.form-label-custom.required::after {
    content: ' *';
    color: var(--color-red);
    font-size: 1.1em;
}

.form-control, .form-select {
    border-radius: 6px;
    border: 1px solid #ced4da;
    padding: 0.6rem 0.75rem;
    transition: border-color 0.2s, box-shadow 0.2s;
}

.form-control:focus, .form-select:focus {
    border-color: var(--color-orange);
    box-shadow: 0 0 0 0.25rem rgba(234, 126, 61, 0.25);
}

.select-offer {
    background-color: #e6f7ef !important; 
    border-color: var(--color-green) !important;
}
.select-demand {
    background-color: #fff4e6 !important; 
    border-color: var(--color-orange) !important;
}



.btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

/* ======================================= */
/* TOAST/MODAL DIZAJN (NOVO) */
/* ======================================= */
.toast-notification {
    position: fixed; /* Ili absolute unutar .add-service-tab ako želite da bude samo tu */
    top: 20px;
    right: 20px;
    z-index: 1050; /* Iznad svih elemenata */
    min-width: 300px;
    padding: 15px;
    border-radius: 8px;
    color: var(--color-white);
    background-color: var(--color-green); /* Uspjeh */
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    opacity: 0;
    transition: opacity 0.5s, transform 0.5s;
    transform: translateX(100%);
}

.toast-notification.show {
    opacity: 1;
    transform: translateX(0);
}

.toast-error {
    background-color: var(--color-red);
}

.toast-body {
    font-size: 1rem;
    font-weight: 500;
}
</style>
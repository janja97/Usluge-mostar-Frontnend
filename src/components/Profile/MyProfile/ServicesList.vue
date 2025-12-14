<template>
  <div class="services-list-container">
    <div class="services-tab-content p-0">
      
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-orange" role="status">
          <span class="visually-hidden">Učitavanje...</span>
        </div>
        <p class="mt-2 text-muted">Učitavanje aktivnih oglasa...</p>
      </div>

      <div v-else class="service-cards-wrapper">
        <div v-if="filteredServices.length > 0">
          <div
            v-for="(s, index) in filteredServices"
            :key="s._id"
            class="service-card d-flex flex-column flex-sm-row justify-content-between align-items-start"
            :class="{ 'border-bottom-0': index === filteredServices.length - 1 }"
          >
            <div class="d-flex align-items-start gap-3 w-100 service-main-info" @click="goToService(s._id)">
              
              <div class="service-img-wrapper flex-shrink-0">
                <img
                  :src="getServiceImage(s)"
                  alt="Slika usluge"
                  class="service-image"
                />
              </div>

              <div class="service-text-info">
                <h5 class="service-title">{{ getServiceName(s) }}</h5>
                
                <div class="d-flex flex-wrap gap-3 info-row">
                    <p class="mb-0 text-muted"><i class="bi bi-geo-alt-fill me-1"></i> {{ s.city }}</p>
                    
                    <p class="mb-0 text-muted">
                        <i :class="s.mode === 'offer' ? 'bi bi-hand-thumbs-up-fill text-green' : 'bi bi-lightning-fill text-orange-dark'" class="me-1"></i>
                        {{ s.mode.charAt(0).toUpperCase() + s.mode.slice(1) }}
                    </p>
                </div>

                <p class="service-price mt-2 mb-0">
                    <span class="fw-bold text-blue-dark me-1">
                        {{ s.price ? s.price + ' KM' : 'Po dogovoru' }}
                    </span>
                    <span v-if="s.priceType && s.priceType !== 'dogovor'" class="text-muted price-type-text">
                        / {{ formatPriceType(s.priceType) }}
                    </span>
                </p>

                <p class="description-snippet mt-2 mb-0 text-gray d-none d-md-block">
                    {{ s.description ? s.description.substring(0, 100) + (s.description.length > 100 ? '...' : '') : 'Nema opisa.' }}
                </p>
              </div>
            </div>

            <div class="d-flex gap-3 align-self-end mt-2 mt-sm-0 flex-shrink-0" v-if="isOwnProfile">
              <button class="btn-icon-action edit-btn" title="Uredi" @click="openEditModal(s)">
                <i class="bi bi-pencil-square"></i>
              </button>
              <button class="btn-icon-action delete-btn" title="Obriši" @click="openDeleteModal(s)">
                <i class="bi bi-trash-fill"></i>
              </button>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-5">
            <i class="bi bi-exclamation-triangle-fill text-muted" style="font-size: 2rem;"></i>
            <p class="mt-3 text-muted">Korisnik još nema aktivnih oglasa.</p>
        </div>
      </div>
    </div>

    <div class="modal fade" id="editModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header modal-header-custom">
            <h5 class="modal-title text-white">Uredi uslugu</h5>
            <button type="button" class="btn-close btn-close-white" @click="closeEditModal"></button>
          </div>
          <form @submit.prevent="saveEdit" class="modal-body p-4" enctype="multipart/form-data">
            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label form-label-custom">Kategorija *</label>
                <select
                  v-model="editService.category"
                  class="form-select"
                  required
                  @change="onEditCategoryChange"
                >
                  <option value="">Odaberi kategoriju</option>
                  <option
                    v-for="cat in serviceCategories"
                    :key="cat.category"
                    :value="cat.category"
                  >
                    {{ cat.category}}
                  </option>
                </select>
              </div>

              <div
                class="col-md-6 mb-3"
                v-if="editSelectedCategory && editSelectedCategory.subcategories.length"
              >
                <label class="form-label form-label-custom">Podkategorija</label>
                <select v-model="editService.subcategory" class="form-select">
                  <option value="">Odaberi podkategoriju</option>
                  <option
                    v-for="sub in editSelectedCategory.subcategories"
                    :key="sub"
                    :value="sub"
                  >
                    {{ sub }}
                  </option>
                </select>
              </div>

              <div
                class="col-12 mb-3"
                v-if="editService.category === 'ostalo' && !editService.subcategory"
              >
                <label class="form-label form-label-custom">Opis usluge *</label>
                <input
                  v-model="editService.customService"
                  type="text"
                  class="form-control"
                  placeholder="Unesite naziv usluge"
                  required
                />
              </div>

              <div class="col-md-6 mb-3">
                <label class="form-label form-label-custom">Županija / Regija *</label>
                <select
                  v-model="editService.county"
                  class="form-select"
                  required
                  @change="onEditCountyChange"
                >
                  <option value="">Odaberi županiju / regiju</option>
                  <option
                    v-for="(cities, countyName) in countiesAndCities"
                    :key="countyName"
                    :value="countyName"
                  >
                    {{ countyName }}
                  </option>
                </select>
              </div>

              <div class="col-md-6 mb-3" v-if="editService.county">
                <label class="form-label form-label-custom">Grad *</label>
                <select v-model="editService.city" class="form-select" required>
                  <option value="">Odaberi grad</option>
                  <option v-for="cityName in editCityOptions" :key="cityName" :value="cityName">
                    {{ cityName }}
                  </option>
                  <option value="custom">Drugi (unesi ručno)</option>
                </select>
              </div>

              <div class="col-md-6 mb-3" v-if="editService.city === 'custom'">
                <label class="form-label form-label-custom">Unesite grad *</label>
                <input
                  v-model="editCustomCity"
                  type="text"
                  class="form-control"
                  placeholder="Unesite grad"
                  required
                />
              </div>

              <div class="col-md-6 mb-3">
                <label class="form-label form-label-custom">Tip cijene *</label>
                <select
                  v-model="editService.priceType"
                  class="form-select"
                  required
                  @change="onEditPriceTypeChange"
                >
                  <option value="">Odaberi tip cijene</option>
                  <option value="dogovor">Po dogovoru</option>
                  <option value="sat">Na sat</option>
                  <option value="dnevno">Na dan</option>
                </select>
              </div>

              <div class="col-md-6 mb-3" v-if="editShowPriceInput">
                <label class="form-label form-label-custom">
                  Cijena ({{ editService.priceType === 'sat' ? 'KM/sat' : 'KM/dan' }}) *
                </label>
                <input
                  v-model.number="editService.price"
                  type="number"
                  class="form-control"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div class="col-md-6 mb-3">
                <label class="form-label form-label-custom">Mode *</label>
                <select v-model="editService.mode" class="form-select" required>
                  <option value="">Odaberi</option>
                  <option value="offer">Offer</option>
                  <option value="demand">Demand</option>
                </select>
              </div>

              <div class="col-12 mb-3">
                <label class="form-label form-label-custom">Opis usluge</label>
                <textarea
                  v-model="editService.description"
                  class="form-control"
                  rows="4"
                  maxlength="1000"
                ></textarea>
                <div class="form-text">{{ editWordCount }}/200 riječi</div>
              </div>

              <div class="col-12 mb-3">
                <label class="form-label form-label-custom">Galerija slika</label>
                <input type="file" multiple @change="handleFileChange" class="form-control" />
                <div class="d-flex gap-2 mt-3 flex-wrap image-preview-list">
                  <div
                    v-for="(img, idx) in editService.images"
                    :key="idx"
                    class="image-preview-item"
                    :class="{'main-img-border': editService.mainImg === idx}"
                  >
                    <img
                      :src="'data:image/jpeg;base64,' + img"
                      class="preview-img-thumbnail"
                      @click="setMainImage(idx)"
                    />
                    <button
                      type="button"
                      class="btn-remove-image"
                      @click="removeImage(idx)"
                    >×</button>
                  </div>
                </div>
              </div>
            </div>

            <div class="modal-footer modal-footer-custom px-0 mt-3">
              <button type="button" class="btn btn-secondary-custom" @click="closeEditModal">Odustani</button>
              <button type="submit" class="btn btn-primary-custom" :disabled="!isEditFormValid">Spremi promjene</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <div class="modal fade" id="deleteModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header modal-header-custom">
            <h5 class="modal-title text-white">Potvrda brisanja</h5>
            <button type="button" class="btn-close btn-close-white" @click="closeDeleteModal"></button>
          </div>
          <div class="modal-body">Jeste li sigurni da želite obrisati ovu uslugu? Ova akcija se ne može poništiti.</div>
          <div class="modal-footer modal-footer-custom">
            <button class="btn btn-secondary-custom" @click="closeDeleteModal">Odustani</button>
            <button class="btn btn-delete-custom" @click="confirmDelete">Obriši</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../../services/api'
// ⚠️ VAŽNO: Provjerite putanje do JSON datoteka
import serviceCategories from '../../../data/services.json'
import countiesAndCities from '../../../data/city.json'
// Globalni Bootstrap Modal se koristi (potrebno je osigurati da je Bootstrap.js učitan)
import { Modal } from 'bootstrap' 

// --- PROPS ---
const props = defineProps({
  userId: { type: String, required: false },
  isOwnProfile: { type: Boolean, required: true }
})

// --- STATE ---
const router = useRouter()
const services = ref([])
const filteredServices = ref([])
const editService = ref({})
const newFiles = ref([])
const deleteServiceId = ref(null)
const loading = ref(true)

const loggedInUserId = localStorage.getItem('userId') || null
const effectiveUserId = computed(() => props.userId || loggedInUserId)
const editCityOptions = ref([])
const editCustomCity = ref('')
const goToService = (id) => router.push(`/service/${id}`)

// --- COMPUTED / HELPERS ---
const editSelectedCategory = computed(() =>
  serviceCategories.find(cat => cat.category === editService.value?.category)
)
const editWordCount = computed(() =>
  editService.value.description
    ? editService.value.description.trim().split(/\s+/).filter(w => w.length > 0).length
    : 0
)
const editShowPriceInput = computed(() =>
  editService.value.priceType === 'sat' || editService.value.priceType === 'dnevno'
)
const isEditFormValid = computed(() =>
  editService.value.category &&
  editService.value.city &&
  editService.value.priceType &&
  editService.value.mode &&
  (editService.value.category !== 'ostalo' || editService.value.customService) &&
  (!editShowPriceInput.value || (editService.value.price !== null && editService.value.price >= 0))
)
const onEditCountyChange = () => {
  editService.value.city = ''
  const cities = countiesAndCities[editService.value.county]
  editCityOptions.value = Array.isArray(cities) ? cities : []
}
const getServiceName = s => s.customService || s.subcategory || s.category || 'Nepoznato'

const formatPriceType = type => {
    switch (type) {
        case 'dogovor': return 'dogovoru';
        case 'sat': return 'sat';
        case 'dnevno': return 'dan';
        default: return '';
    }
}

// Ispravljen prikaz slike
const getServiceImage = (s) => {
  if (s.images && Array.isArray(s.images) && s.images.length > 0) {
    const mainIndex = typeof s.mainImg === 'number' && s.mainImg < s.images.length ? s.mainImg : 0
    return 'data:image/jpeg;base64,' + s.images[mainIndex]
  }
  // Alternativna slika ako nema slika
  const cat = serviceCategories.find(c => c.category === s.category)
  // Vraća putanju do default.png ako ni kategorija nema sliku
  return cat?.image || '/img/default.png' 
}

// --- FETCH SERVICES ---
const fetchServices = async () => {
  if (!effectiveUserId.value) return
  loading.value = true
  try {
    const res = await api.get(`/services/user/${effectiveUserId.value}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    services.value = res.data
    filteredServices.value = [...res.data]
  } catch (err) {
    console.error('❌ Greška kod dohvata usluga:', err.response?.data || err)
    filteredServices.value = []
  } finally {
    loading.value = false
  }
}
watch(effectiveUserId, async () => await fetchServices())

// --- MODALS (INIT) ---
let editModalInstance = null
let deleteModalInstance = null
onMounted(() => {
  // Postavljamo ID-je jer se koristi Modal.js
  const editModalEl = document.getElementById('editModal');
  const deleteModalEl = document.getElementById('deleteModal');
  
  if (editModalEl) editModalInstance = new Modal(editModalEl)
  if (deleteModalEl) deleteModalInstance = new Modal(deleteModalEl)

  fetchServices()
})

// --- MODAL HANDLERS ---
const openEditModal = service => {
  // Duboko kopiranje objekta i inicijalizacija polja
  editService.value = { 
    ...service, 
    images: [...(service.images || [])],
    price: service.price !== undefined && service.price !== null ? service.price : null,
    county: service.county || '',
    city: service.city || '',
    customService: service.customService || '',
    // Potrebno je ručno postaviti opcije za grad, u slučaju da je user promijenio regiju/županiju
    
  }
  // Inicijaliziraj gradske opcije na temelju županije
  onEditCountyChange(); 

  // Ako grad korisnika nije na listi, ali je postavljen, to znači da je bio 'custom'
  if (editService.value.city && !editCityOptions.value.includes(editService.value.city)) {
      editCustomCity.value = editService.value.city;
      editService.value.city = 'custom';
  } else {
      editCustomCity.value = '';
  }


  newFiles.value = []
  editModalInstance?.show()
}
const closeEditModal = () => editModalInstance?.hide()
const openDeleteModal = service => {
  deleteServiceId.value = service._id
  deleteModalInstance?.show()
}
const closeDeleteModal = () => deleteModalInstance?.hide()

// --- ACTIONS ---
const confirmDelete = async () => {
  if (!deleteServiceId.value) return
  try {
    await api.delete(`/services/${deleteServiceId.value}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    // Ukloni uslugu iz lokalnog statea
    services.value = services.value.filter(s => s._id !== deleteServiceId.value)
    filteredServices.value = [...services.value]
    closeDeleteModal()
  } catch (err) {
    console.error('❌ Greška kod brisanja:', err.response?.data || err)
    alert('Došlo je do greške prilikom brisanja usluge.')
  }
}
const onEditCategoryChange = () => {
  editService.value.subcategory = ''
  editService.value.customService = ''
}
const onEditPriceTypeChange = () => {
  if (editService.value.priceType === 'dogovor') editService.value.price = null
}
const handleFileChange = (event) => {
  const files = Array.from(event.target.files)
  newFiles.value.push(...files)
}
const removeImage = async (idx) => {
  if (editService.value.images.length <= 1) {
    alert('Morate imati barem jednu sliku.');
    return;
  }
  
  try {
    await api.put(`/services/${editService.value._id}`, {
      removeImages: [idx]
    }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    
    // Ažuriranje lokalnog statea
    editService.value.images.splice(idx, 1)
    if (editService.value.mainImg === idx) {
        editService.value.mainImg = 0; // Postavi prvu preostalu sliku kao glavnu
    } else if (editService.value.mainImg > idx) {
        editService.value.mainImg -= 1; // Podesi indeks glavne slike
    }

    // Ponovno učitaj listu da se update primijeni i na glavnom prikazu
    await fetchServices(); 
  } catch (err) {
    console.error('❌ Greška kod brisanja slike:', err.response?.data || err)
    alert('Greška pri brisanju slike.')
  }
}
const setMainImage = (idx) => editService.value.mainImg = idx
const saveEdit = async () => {
  if (!isEditFormValid.value) {
    alert('Molimo popunite sva obavezna polja ispravno.')
    return
  }
  
  try {
    const formData = new FormData()
    
    // Obavezna polja + Opis
    for (const key of ['category', 'subcategory', 'priceType', 'price', 'description', 'mode', 'county']) {
        if (editService.value[key] !== undefined && editService.value[key] !== null)
            formData.append(key, editService.value[key])
    }

    // Custom Service (ako je relevantno)
    if (editService.value.category === 'ostalo' && editService.value.customService) {
        formData.append('customService', editService.value.customService)
    }

    // City: custom ili odabrani grad
    formData.append(
      'city',
      editService.value.city === 'custom' ? editCustomCity.value : editService.value.city
    )

    // Glavna slika
    formData.append('mainImg', editService.value.mainImg ?? 0)

    // Nove slike
    if (newFiles.value.length > 0) {
      newFiles.value.forEach(file => formData.append('images', file))
    }

    const res = await api.put(`/services/${editService.value._id}`, formData, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'multipart/form-data' }
    })
    
    // Ažuriranje lokalnog statea i zatvaranje
    const index = services.value.findIndex(s => s._id === editService.value._id)
    if (index !== -1) {
      services.value[index] = res.data // Ažuriranje s novim podacima
      filteredServices.value = [...services.value]
    }

    closeEditModal()
    newFiles.value = []
    alert('Usluga uspješno ažurirana!')
  } catch (err) {
    console.error('❌ Greška kod spremanja:', err.response?.data || err)
    alert('Greška pri spremanju promjena.')
  }
}

// Expose funkciju za roditeljsku komponentu (Profile.vue)
defineExpose({ fetchServices })
</script>


<style scoped>
/* ======================================= */
/* DIZAJN LISTE OGLASA */
/* ======================================= */
:root {
  --color-blue: rgba(22, 58, 94);
  --color-blue-dark: #15304e;
  --color-orange: rgba(234, 126, 61);
  --color-orange-dark: #c86f33;
  --color-gray: #334155;
  --color-gray-light: #f5f5f5;
  --color-green: #198754;
}

.services-list-container {
    padding: 0;
}

.service-cards-wrapper {
    padding: 10px 0; /* Unutarnji padding da lista nije preblizu rubovima taba */
}

.service-card {
    padding: 15px 0;
    border-bottom: 1px solid var(--color-gray-light);
    transition: background-color 0.2s;
}

.service-main-info {
    cursor: pointer;
}

.service-main-info:hover .service-title {
    color: var(--color-orange);
}

/* Image */
.service-img-wrapper {
    width: 100px;
    height: 100px;
    background-color: var(--color-gray-light);
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.service-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s;
}

.service-main-info:hover .service-image {
    transform: scale(1.05);
}

/* Text Info */
.service-title {
    font-size: 1.2rem;
    font-weight: 700;
    color: var(--color-blue);
    margin-bottom: 5px;
    transition: color 0.2s;
}

.info-row p {
    font-size: 0.9rem;
}

.text-gray {
    color: #6c757d !important;
}

.text-green {
    color: var(--color-green) !important;
}

.service-price {
    font-size: 1.1rem;
    color: var(--color-blue-dark);
}

.price-type-text {
    font-size: 0.9rem;
}

.description-snippet {
    font-size: 0.85rem;
}

/* Actions */
.btn-icon-action {
    background: transparent;
    border: none;
    padding: 5px 8px;
    border-radius: 5px;
    font-size: 1.3rem;
    cursor: pointer;
    transition: background-color 0.2s;
}

.edit-btn {
    color: var(--color-blue-lighter);
}
.edit-btn:hover {
    color: var(--color-blue);
    background-color: rgba(22, 58, 94, 0.1);
}

.delete-btn {
    color: #dc3545; /* Bootstrap Red */
}
.delete-btn:hover {
    color: #c82333;
    background-color: rgba(220, 53, 69, 0.1);
}


/* ======================================= */
/* MODAL CUSTOM STYLES */
/* ======================================= */
.modal-header-custom {
    background-color: var(--color-blue);
    border-bottom: none;
}
.btn-close-white {
    filter: brightness(0) invert(1); 
}
.modal-footer-custom {
    background-color: var(--color-gray-light);
    border-top: 1px solid #dee2e6;
    display: flex;
    justify-content: flex-end; /* Poravnanje na desnu stranu */
}
.form-label-custom {
    font-weight: 600;
    color: var(--color-blue-dark);
    font-size: 0.95rem;
}
.btn-primary-custom {
    background-color: var(--color-blue);
    border-color: var(--color-blue);
}
.btn-primary-custom:hover {
    background-color: var(--color-blue-dark);
    border-color: var(--color-blue-dark);
}
.btn-secondary-custom {
    color: var(--color-gray);
    background-color: var(--color-gray-light);
    border-color: var(--color-gray-light);
}
.btn-delete-custom {
    background-color: #dc3545;
    border-color: #dc3545;
    color: var(--color-white);
}

/* Image Preview in Edit Modal */
.image-preview-item {
    width: 80px;
    height: 80px;
    position: relative;
    border-radius: 6px;
    overflow: hidden;
    cursor: pointer;
    border: 3px solid transparent;
}
.preview-img-thumbnail {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}
.main-img-border {
    border-color: var(--color-orange); /* Ističe glavnu sliku */
}
.btn-remove-image {
    position: absolute;
    top: -5px;
    right: -5px;
    background: #dc3545;
    color: var(--color-white);
    border: 2px solid var(--color-white);
    border-radius: 50%;
    width: 20px;
    height: 20px;
    font-size: 0.8rem;
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    z-index: 10;
}

/* ======================================= */
/* RESPONSIVE */
/* ======================================= */
@media (max-width: 576px) {
    .service-card {
        flex-direction: column;
        align-items: stretch !important;
        padding-top: 10px;
        padding-bottom: 10px;
    }
    .service-img-wrapper {
        width: 80px;
        height: 80px;
        flex-shrink: 0;
    }
    .service-main-info {
        gap: 10px !important;
        margin-bottom: 10px;
    }
    .service-title {
        font-size: 1.1rem;
    }
    .info-row {
        gap: 10px !important;
    }
    .service-price {
        font-size: 1rem;
    }
    .d-flex.align-self-end {
        align-self: flex-start !important; /* Na mobitelu idu na lijevu stranu */
    }
}
</style>
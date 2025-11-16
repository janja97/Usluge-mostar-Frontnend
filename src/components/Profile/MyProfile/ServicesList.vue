<template>
  <div>
    <div class="services p-5 mt-4">
      <!-- LOADING INDICATOR -->
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Učitavanje...</span>
        </div>
        <p>Učitavanje usluga...</p>
      </div>

      <!-- SERVICES LIST -->
      <div v-else>
        <div v-if="filteredServices.length > 0">
          <div
            v-for="(s, index) in filteredServices"
            :key="s._id"
            class="service py-3 d-flex justify-content-between align-items-center border-bottom"
          >
            <div
              @click="goToService(s._id)"
              style="cursor:pointer; display:flex; align-items:center; gap:1rem;"
            >
              <!-- MAIN IMAGE -->
              <div
                class="main-img-wrapper"
                style="width:100px; height:100px; background:#eee; display:flex; align-items:center; justify-content:center;"
              >
                <img
                  :src="getServiceImage(s)"
                  alt="Slika usluge"
                  style="width:100%; height:100%; object-fit:cover; border-radius:5px;"
                />
              </div>

              <div>
                <strong>{{ getServiceName(s) }}</strong><br />
                Tip cijene: {{ formatPriceType(s.priceType) }}<br />
                Cijena: {{ s.price || 'po dogovoru' }}<br />
                <span v-if="s.description"><em>{{ s.description }}</em></span>
                <p>Grad: {{ s.city }}</p>
                <p>Mode: {{ s.mode }}</p>
              </div>
            </div>

            <div class="d-flex gap-2" v-if="isOwnProfile">
              <i
                class="bi bi-pencil-square"
                role="button"
                style="color: rgb(91, 119, 168);"
                @click="openEditModal(s)"
              ></i>
              <i
                class="bi bi-trash"
                role="button"
                style="color: rgb(192, 108, 108);"
                @click="openDeleteModal(s)"
              ></i>
            </div>
          </div>
        </div>
        <p v-else>Nema aktivnih oglasa.</p>
      </div>
    </div>

    <!-- EDIT MODAL -->
    <div class="modal fade" id="editModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Uredi uslugu</h5>
            <button type="button" class="btn-close" @click="closeEditModal"></button>
          </div>
          <form @submit.prevent="saveEdit" class="modal-body" enctype="multipart/form-data">
            <div class="row">
              <!-- Category -->
              <div class="col-md-6 mb-3">
                <label class="form-label">Kategorija *</label>
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
                    {{ cat.category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) }}
                  </option>
                </select>
              </div>

              <!-- Subcategory -->
              <div
                class="col-md-6 mb-3"
                v-if="editSelectedCategory && editSelectedCategory.subcategories.length"
              >
                <label class="form-label">Podkategorija</label>
                <select v-model="editService.subcategory" class="form-select">
                  <option value="">Odaberi podkategoriju</option>
                  <option
                    v-for="sub in editSelectedCategory.subcategories"
                    :key="sub"
                    :value="sub"
                  >
                    {{ sub.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) }}
                  </option>
                </select>
              </div>

              <!-- Custom Service -->
              <div
                class="col-12 mb-3"
                v-if="editService.category === 'ostalo' && !editService.subcategory"
              >
                <label class="form-label">Opis usluge *</label>
                <input
                  v-model="editService.customService"
                  type="text"
                  class="form-control"
                  placeholder="Unesite naziv usluge"
                  required
                />
              </div>

              <!-- ŽUPANIJA / REGIJA -->
              <div class="col-md-6 mb-3">
                <label class="form-label">Županija / Regija *</label>
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

              <!-- GRAD -->
              <div class="col-md-6 mb-3" v-if="editService.county">
                <label class="form-label">Grad *</label>
                <select v-model="editService.city" class="form-select" required>
                  <option value="">Odaberi grad</option>
                  <option v-for="cityName in editCityOptions" :key="cityName" :value="cityName">
                    {{ cityName }}
                  </option>
                  <option value="custom">Drugi (unesi ručno)</option>
                </select>
              </div>

              <!-- CUSTOM GRAD -->
              <div class="col-md-6 mb-3" v-if="editService.city === 'custom'">
                <label class="form-label">Unesite grad *</label>
                <input
                  v-model="editCustomCity"
                  type="text"
                  class="form-control"
                  placeholder="Unesite grad"
                  required
                />
              </div>

              <!-- Price Type -->
              <div class="col-md-6 mb-3">
                <label class="form-label">Tip cijene *</label>
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

              <!-- Price Input -->
              <div class="col-md-6 mb-3" v-if="editShowPriceInput">
                <label class="form-label">
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

              <!-- Mode -->
              <div class="col-md-6 mb-3">
                <label class="form-label">Mode *</label>
                <select v-model="editService.mode" class="form-select" required>
                  <option value="">Odaberi</option>
                  <option value="offer">Offer</option>
                  <option value="demand">Demand</option>
                </select>
              </div>

              <!-- Description -->
              <div class="col-12 mb-3">
                <label class="form-label">Opis usluge</label>
                <textarea
                  v-model="editService.description"
                  class="form-control"
                  rows="4"
                  maxlength="1000"
                ></textarea>
                <div class="form-text">{{ editWordCount }}/200 riječi</div>
              </div>

              <!-- Images -->
              <div class="col-12 mb-3">
                <label class="form-label">Galerija slika</label>
                <input type="file" multiple @change="handleFileChange" class="form-control" />
                <div class="d-flex gap-2 mt-2 flex-wrap">
                  <div
                    v-for="(img, idx) in editService.images"
                    :key="idx"
                    style="width:80px; height:80px; background:#eee; display:flex; align-items:center; justify-content:center; position:relative; border: solid 2px"
                    :class="{'border-primary':editService.mainImg===idx}"
                  >
                    <img
                      :src="'data:image/jpeg;base64,' + img"
                      style="width:100%; height:100%; object-fit:cover; border-radius:5px;"
                      @click="setMainImage(idx)"
                    />
                    <button
                      type="button"
                      @click="removeImage(idx)"
                      style="position:absolute; top:0; right:0; background:red; color:white; border:none; border-radius:50%;"
                    >×</button>
                  </div>
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="closeEditModal">Odustani</button>
              <button type="submit" class="btn btn-primary" :disabled="!isEditFormValid">Spremi</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- DELETE MODAL -->
    <div class="modal fade" id="deleteModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Potvrda brisanja</h5>
            <button type="button" class="btn-close" @click="closeDeleteModal"></button>
          </div>
          <div class="modal-body">Jeste li sigurni da želite obrisati ovu uslugu?</div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="closeDeleteModal">Odustani</button>
            <button class="btn btn-danger" @click="confirmDelete">Obriši</button>
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
import serviceCategories from '../../../data/services.json'
import countiesAndCities from '../../../data/city.json'
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

// --- COMPUTED ---
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
const getServiceName = s => s.subcategory || s.customService || s.category || 'Nepoznato'
const formatPriceType = type => type === 'dogovor' ? 'Po dogovoru' : type === 'sat' ? 'Na sat' : 'Na dan'

// --- POPRAVLJEN PRIKAZ SLIKE ---
const getServiceImage = (s) => {
  if (s.images && Array.isArray(s.images) && s.images.length > 0) {
    const mainIndex = typeof s.mainImg === 'number' && s.mainImg < s.images.length ? s.mainImg : 0
    return 'data:image/jpeg;base64,' + s.images[mainIndex]
  }
  const cat = serviceCategories.find(c => c.category === s.category)
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
  } finally {
    loading.value = false
  }
}
watch(effectiveUserId, async () => await fetchServices())

// --- MODALS ---
let editModalInstance = null
let deleteModalInstance = null
onMounted(() => {
  editModalInstance = new Modal(document.getElementById('editModal'))
  deleteModalInstance = new Modal(document.getElementById('deleteModal'))
  fetchServices()
})

// --- OSTALO ---
const openEditModal = service => {
  editService.value = { ...service, images: [...(service.images || [])] }
  newFiles.value = []
  editModalInstance?.show()
}
const closeEditModal = () => editModalInstance?.hide()
const openDeleteModal = service => {
  deleteServiceId.value = service._id
  deleteModalInstance?.show()
}
const closeDeleteModal = () => deleteModalInstance?.hide()
const confirmDelete = async () => {
  if (!deleteServiceId.value) return
  try {
    await api.delete(`/services/${deleteServiceId.value}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    services.value = services.value.filter(s => s._id !== deleteServiceId.value)
    filteredServices.value = [...services.value]
    closeDeleteModal()
  } catch (err) {
    console.error('❌ Greška kod brisanja:', err.response?.data || err)
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
  try {
    await api.put(`/services/${editService.value._id}`, {
      removeImages: [idx]
    }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    editService.value.images.splice(idx, 1)
    if (editService.value.mainImg === idx)
      editService.value.mainImg = editService.value.images.length ? 0 : null
  } catch (err) {
    console.error('❌ Greška kod brisanja slike:', err.response?.data || err)
  }
}
const setMainImage = (idx) => editService.value.mainImg = idx
const saveEdit = async () => {
  try {
    const formData = new FormData()
    for (const key of ['category','subcategory','customService','priceType','price','description','mode','county']) {
      if(editService.value[key] !== undefined && editService.value[key] !== null)
        formData.append(key, editService.value[key])
    }
    formData.append(
      'city',
      editService.value.city === 'custom' ? editCustomCity.value : editService.value.city
    )
    formData.append('mainImg', editService.value.mainImg ?? 0)
    if (newFiles.value.length > 0) {
      newFiles.value.forEach(file => formData.append('images', file))
    }
    const res = await api.put(`/services/${editService.value._id}`, formData, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    const index = services.value.findIndex(s => s._id === editService.value._id)
    if (index !== -1) {
      services.value[index] = res.data
      filteredServices.value = [...services.value]
    }
    closeEditModal()
    newFiles.value = []
  } catch (err) {
    console.error('❌ Greška kod spremanja:', err.response?.data || err)
  }
}
defineExpose({ fetchServices })
</script>



<style scoped>
.service i { font-size: 1.2rem; cursor: pointer; }
.service i:hover { opacity: 0.7; }
.modal-lg { max-width: 800px; }
.form-label { font-weight: 500; }
.btn:disabled { opacity: 0.6; cursor: not-allowed; }
.main-img-wrapper { border-radius:5px; overflow:hidden; }
.main-img-wrapper img { cursor:pointer; }
.border-primary { border-color: #0d6efd !important; }
@media (max-width: 576px) { .services { padding: 1rem; } .modal-dialog { margin: 0.5rem; } }
</style>

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
            <div @click="goToService(s._id)" style="cursor:pointer;">
              <strong>{{ getServiceName(s) }}</strong><br />
              Tip cijene: {{ formatPriceType(s.priceType) }}<br />
              Cijena: {{ s.price || "po dogovoru" }}<br />
              <span v-if="s.description"><em>{{ s.description }}</em></span>
              <p>Grad: {{ s.city }}</p>
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
          <form @submit.prevent="saveEdit" class="modal-body">
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

              <!-- City -->
              <div class="col-md-6 mb-3">
                <label class="form-label">Grad *</label>
                <input
                  v-model="editService.city"
                  type="text"
                  class="form-control"
                  placeholder="Npr. Mostar"
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
const deleteServiceId = ref(null)
const loggedInUserId = computed(() => localStorage.getItem('userId'))


const goToService = (id) => {
  router.push(`/service/${id}`)
}


// LOADING STATE
const loading = ref(true)


// --- COMPUTED ---
const effectiveUserId = computed(() => props.userId || loggedInUserId)

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
  (editService.value.category !== 'ostalo' || editService.value.customService) &&
  (!editShowPriceInput.value || (editService.value.price !== null && editService.value.price >= 0))
)

const getServiceName = s => s.subcategory || s.customService || s.category || 'Nepoznato'
const formatPriceType = type => type === 'dogovor' ? 'Po dogovoru' : type === 'sat' ? 'Na sat' : 'Na dan'

// --- FETCH SERVICES ---
const fetchServices = async () => {
    loading.value = true

  if (!effectiveUserId.value) return
  try {
    const res = await api.get(`/services/user/${effectiveUserId.value}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    services.value = res.data
    filteredServices.value = [...res.data]
    console.log("Fetched services:", services.value)
  } catch (err) {
    console.error('❌ Greška kod dohvata usluga:', err.response?.data || err)
  }
  finally {
    loading.value = false
  }
}

// --- WATCH EFFECTIVE USER ID ---
watch(effectiveUserId, async () => {
  await fetchServices()
})

// --- MODALS ---
let editModalInstance = null
let deleteModalInstance = null

onMounted(async () => {
  await fetchServices()
  editModalInstance = new Modal(document.getElementById('editModal'))
  deleteModalInstance = new Modal(document.getElementById('deleteModal'))
})

// --- EDIT & DELETE HANDLERS ---
const openEditModal = service => {
  editService.value = { ...service }
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

// --- EVENT HANDLERS ---
const onEditCategoryChange = () => {
  editService.value.subcategory = ''
  editService.value.customService = ''
}
const onEditPriceTypeChange = () => {
  if (editService.value.priceType === 'dogovor') editService.value.price = null
}

// --- SAVE EDIT ---
const saveEdit = async () => {
  try {
    const res = await api.put(`/services/${editService.value._id}`, editService.value, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    const index = services.value.findIndex(s => s._id === editService.value._id)
    if (index !== -1) {
      services.value[index] = res.data
      filteredServices.value = [...services.value]
    }
    closeEditModal()
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
.add-service { background: rgb(91, 119, 168); color: white; border: 1px solid rgb(91, 119, 168); border-radius: 10px; padding: 5px 10px; }
@media (max-width: 576px) { .services { padding: 1rem; } .modal-dialog { margin: 0.5rem; } }
</style>

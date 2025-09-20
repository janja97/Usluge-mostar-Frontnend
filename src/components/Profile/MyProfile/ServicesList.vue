<template>
  <div>
    <!-- Broj oglasa -->
    <div class="d-flex flex-wrap gap-2">
      <div v-if="services" class="px-3 py-2 active-services">
        Aktivni Oglasi: {{ services.length }}
      </div>
      <div class="px-3 py-2 finish-services">Završenih Usluga: 18</div>
    </div>

    <!-- FILTER -->
    <ServiceFilters
      :services="services"
      @update:filtered="filteredServices = $event"
    />

    <!-- Aktivni oglasi -->
    <div class="services p-5 mt-4">
      <button class="btn add-service" @click="openAddModal">
          Dodaj oglas
        </button>
      <div v-if="filteredServices.length > 0">
        <div class="d-flex justify-content-between align-items-center">
          <h3>Aktivni Oglasi</h3>
        </div>

        <div
          v-for="(s, index) in filteredServices"
          :key="s._id"
          class="service py-3 d-flex justify-content-between align-items-center border-bottom"
        >
          <div>
            <strong>{{ getServiceName(s) }}</strong><br />
            Tip cijene: {{ formatPriceType(s.priceType) }}<br />
            Cijena: {{ s.price || "po dogovoru" }}<br />
            <span v-if="s.description"><em>{{ s.description }}</em></span>
          </div>
          <div class="d-flex gap-2">
            <i
              class="bi bi-pencil-square"
              role="button"
              style="color: rgb(91, 119, 168);"
              @click="openEditModal(s, index)"
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
      <p v-else>Nemate aktivnih oglasa.</p>
    </div>

    <!-- ADD MODAL -->
    <div
      class="modal fade"
      id="addModal"
      tabindex="-1"
      aria-labelledby="addModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="addModalLabel">Dodaj novu uslugu</h5>
            <button type="button" class="btn-close" @click="closeAddModal"></button>
          </div>
          <form @submit.prevent="addService" class="modal-body">
            <div class="row">
              <!-- Category Selection -->
              <div class="col-md-6 mb-3">
                <label for="category" class="form-label">Kategorija *</label>
                <select 
                  v-model="newService.category" 
                  id="category" 
                  class="form-select" 
                  required 
                  @change="handleCategoryChange"
                >
                  <option value="">Odaberi kategoriju</option>
                  <option v-for="cat in serviceCategories" :key="cat.category" :value="cat.category">
                    {{ cat.category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) }}
                  </option>
                </select>
              </div>

              <!-- Subcategory Selection -->
              <div class="col-md-6 mb-3" v-if="selectedCategory && selectedCategory.subcategories.length > 0">
                <label for="subcategory" class="form-label">Podkategorija</label>
                <select 
                  v-model="newService.subcategory" 
                  id="subcategory" 
                  class="form-select"
                >
                  <option value="">Odaberi podkategoriju</option>
                  <option v-for="sub in selectedCategory.subcategories" :key="sub" :value="sub">
                    {{ sub.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) }}
                  </option>
                </select>
              </div>

              <!-- Custom Service -->
              <div class="col-12 mb-3" v-if="newService.category === 'ostalo' && !newService.subcategory">
                <label for="customService" class="form-label">Opis usluge *</label>
                <input 
                  v-model="newService.customService" 
                  type="text" 
                  id="customService" 
                  class="form-control" 
                  placeholder="Unesite naziv usluge"
                  required
                >
              </div>

              <!-- City -->
              <div class="col-md-6 mb-3">
                <label for="city" class="form-label">Grad *</label>
                <input 
                  v-model="newService.city" 
                  type="text" 
                  id="city" 
                  class="form-control" 
                  placeholder="Npr. Mostar"
                  required
                >
              </div>

              <!-- Price Type -->
              <div class="col-md-6 mb-3">
                <label for="priceType" class="form-label">Tip cijene *</label>
                <select 
                  v-model="newService.priceType" 
                  id="priceType" 
                  class="form-select" 
                  required
                  @change="handlePriceTypeChange"
                >
                  <option value="">Odaberi tip cijene</option>
                  <option value="dogovor">Po dogovoru</option>
                  <option value="sat">Na sat</option>
                  <option value="dnevno">Na dan</option>
                </select>
              </div>

              <!-- Price Input -->
              <div class="col-md-6 mb-3" v-if="showPriceInput">
                <label for="price" class="form-label">Cijena ({{ newService.priceType === 'sat' ? 'KM/sat' : 'KM/dan' }}) *</label>
                <input 
                  v-model.number="newService.price" 
                  type="number" 
                  id="price" 
                  class="form-control" 
                  :placeholder="`Unesite cijenu u KM/${newService.priceType === 'sat' ? 'sat' : 'dan'}`"
                  min="0"
                  step="0.01"
                  required
                >
              </div>

              <!-- Description -->
              <div class="col-12 mb-3">
                <label for="description" class="form-label">Opis usluge</label>
                <textarea 
                  v-model="newService.description" 
                  id="description" 
                  class="form-control" 
                  rows="4" 
                  placeholder="Opisite detaljno vašu uslugu (maksimalno 200 riječi)"
                  maxlength="1000"
                ></textarea>
                <div class="form-text">{{ wordCount }}/200 riječi</div>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="closeAddModal">Odustani</button>
              <button type="submit" class="btn btn-success" :disabled="!isFormValid">Dodaj</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- EDIT MODAL -->
    <div
      class="modal fade"
      id="editModal"
      tabindex="-1"
      aria-labelledby="editModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="editModalLabel">Uredi uslugu</h5>
            <button type="button" class="btn-close" @click="closeEditModal"></button>
          </div>
          <form @submit.prevent="saveEdit" class="modal-body">
            <div class="row">
              <!-- Category Selection -->
              <div class="col-md-6 mb-3">
                <label for="editCategory" class="form-label">Kategorija *</label>
                <select 
                  v-model="editService.category" 
                  id="editCategory" 
                  class="form-select" 
                  required 
                  @change="onEditCategoryChange"
                >
                  <option value="">Odaberi kategoriju</option>
                  <option v-for="cat in serviceCategories" :key="cat.category" :value="cat.category">
                    {{ cat.category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) }}
                  </option>
                </select>
              </div>

              <!-- Subcategory Selection -->
              <div class="col-md-6 mb-3" v-if="editSelectedCategory && editSelectedCategory.subcategories.length > 0">
                <label for="editSubcategory" class="form-label">Podkategorija</label>
                <select 
                  v-model="editService.subcategory" 
                  id="editSubcategory" 
                  class="form-select"
                >
                  <option value="">Odaberi podkategoriju</option>
                  <option v-for="sub in editSelectedCategory.subcategories" :key="sub" :value="sub">
                    {{ sub.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) }}
                  </option>
                </select>
              </div>

              <!-- Custom Service -->
              <div class="col-12 mb-3" v-if="editService.category === 'ostalo' && !editService.subcategory">
                <label for="editCustomService" class="form-label">Opis usluge *</label>
                <input 
                  v-model="editService.customService" 
                  type="text" 
                  id="editCustomService" 
                  class="form-control" 
                  placeholder="Unesite naziv usluge"
                  required
                >
              </div>

              <!-- City -->
              <div class="col-md-6 mb-3">
                <label for="editCity" class="form-label">Grad *</label>
                <input 
                  v-model="editService.city" 
                  type="text" 
                  id="editCity" 
                  class="form-control" 
                  placeholder="Npr. Mostar"
                  required
                >
              </div>

              <!-- Price Type -->
              <div class="col-md-6 mb-3">
                <label for="editPriceType" class="form-label">Tip cijene *</label>
                <select 
                  v-model="editService.priceType" 
                  id="editPriceType" 
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
                <label for="editPrice" class="form-label">Cijena ({{ editService.priceType === 'sat' ? 'KM/sat' : 'KM/dan' }}) *</label>
                <input 
                  v-model.number="editService.price" 
                  type="number" 
                  id="editPrice" 
                  class="form-control" 
                  :placeholder="`Unesite cijenu u KM/${editService.priceType === 'sat' ? 'sat' : 'dan'}`"
                  min="0"
                  step="0.01"
                  required
                >
              </div>

              <!-- Description -->
              <div class="col-12 mb-3">
                <label for="editDescription" class="form-label">Opis usluge</label>
                <textarea 
                  v-model="editService.description" 
                  id="editDescription" 
                  class="form-control" 
                  rows="4" 
                  placeholder="Opisite detaljno vašu uslugu (maksimalno 200 riječi)"
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
    <div
      class="modal fade"
      id="deleteModal"
      tabindex="-1"
      aria-labelledby="deleteModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="deleteModalLabel">Potvrda brisanja</h5>
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
import { ref, onMounted, computed } from 'vue';
import api from '../../../services/api';
import serviceCategories from '../../../data/services.json';
import { Modal } from 'bootstrap';
import ServiceFilters from '../../ServiceFilters.vue';

// --- STATE ---
const services = ref([]);
const filteredServices = ref([]);
const newService = ref({
  category: '',
  subcategory: '',
  customService: '',
  priceType: '',
  price: null,
  description: '',
  city: ''
});
const editService = ref({});
const deleteServiceId = ref(null);

let addModalInstance = null;
let editModalInstance = null;
let deleteModalInstance = null;

// --- COMPUTED ---
const selectedCategory = computed(() => serviceCategories.find(cat => cat.category === newService.value.category));
const editSelectedCategory = computed(() => serviceCategories.find(cat => cat.category === editService.value.category));
const wordCount = computed(() => {
  return newService.value.description ? newService.value.description.trim().split(/\s+/).filter(word => word.length > 0).length : 0;
});
const editWordCount = computed(() => {
  return editService.value.description ? editService.value.description.trim().split(/\s+/).filter(word => word.length > 0).length : 0;
});
const showPriceInput = computed(() => {
  return newService.value.priceType === 'sat' || newService.value.priceType === 'dnevno';
});
const editShowPriceInput = computed(() => {
  return editService.value.priceType === 'sat' || editService.value.priceType === 'dnevno';
});
const isFormValid = computed(() => {
  return newService.value.category &&
         newService.value.city &&
         newService.value.priceType &&
         (newService.value.category !== 'ostalo' || newService.value.customService) &&
         (!showPriceInput.value || (newService.value.price !== null && newService.value.price >= 0));
});
const isEditFormValid = computed(() => {
  return editService.value.category &&
         editService.value.city &&
         editService.value.priceType &&
         (editService.value.category !== 'ostalo' || editService.value.customService) &&
         (!editShowPriceInput.value || (editService.value.price !== null && editService.value.price >= 0));
});
const getServiceName = (s) => s.subcategory || s.customService || s.category || 'Nepoznato';
const formatPriceType = (priceType) => {
  switch (priceType) {
    case 'dogovor': return 'Po dogovoru';
    case 'sat': return 'Na sat';
    case 'dnevno': return 'Na dan';
    default: return priceType;
  }
};

// --- ON MOUNTED ---
onMounted(async () => {
  try {
    const res = await api.get('/services/my', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    services.value = res.data;
    filteredServices.value = res.data; // Inicijalno postavi filteredServices
  } catch (err) {
    console.error('❌ Greška kod dohvaćanja usluga:', err.response?.data || err);
  }

  addModalInstance = new Modal(document.getElementById('addModal'));
  editModalInstance = new Modal(document.getElementById('editModal'));
  deleteModalInstance = new Modal(document.getElementById('deleteModal'));
});

// --- MODAL FUNCTIONS ---
const openAddModal = () => {
  newService.value = { category: '', subcategory: '', customService: '', priceType: '', price: null, description: '', city: '' };
  addModalInstance.show();
};
const closeAddModal = () => {
  addModalInstance.hide();
  document.activeElement?.blur();
};

const openEditModal = (service) => {
  editService.value = { ...service, city: service.city || '' }; // Dodaj city ako nedostaje
  editModalInstance.show();
};
const closeEditModal = () => {
  editModalInstance.hide();
  document.activeElement?.blur();
};

const openDeleteModal = (service) => {
  if (!service?._id) {
    console.error('Service ID nije definiran!', service);
    return;
  }
  deleteServiceId.value = service._id;
  deleteModalInstance.show();
};
const closeDeleteModal = () => {
  deleteModalInstance.hide();
  document.activeElement?.blur();
};

// --- EVENT HANDLERS ---
const handleCategoryChange = () => {
  newService.value.subcategory = '';
  newService.value.customService = '';
};

const handlePriceTypeChange = () => {
  if (newService.value.priceType === 'dogovor') {
    newService.value.price = null;
  }
};

const onEditCategoryChange = () => {
  editService.value.subcategory = '';
  editService.value.customService = '';
};

const onEditPriceTypeChange = () => {
  if (editService.value.priceType === 'dogovor') {
    editService.value.price = null;
  }
};

// --- CRUD ---
const addService = async () => {
  try {
    // Validacija opisa (maksimalno 200 riječi)
    if (wordCount.value > 200) {
      alert('Opis ne smije prelaziti 200 riječi!');
      return;
    }

    const payload = {
      category: newService.value.category,
      subcategory: newService.value.category !== 'ostalo' ? newService.value.subcategory || null : null,
      customService: newService.value.category === 'ostalo' ? newService.value.customService || '' : '',
      priceType: newService.value.priceType,
      price: newService.value.price,
      description: newService.value.description,
      city: newService.value.city
    };

    const res = await api.post('/services', payload, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });

    services.value.push(res.data);
    filteredServices.value = [...services.value]; // Ažuriraj filteredServices

    newService.value = { category: '', subcategory: '', customService: '', priceType: '', price: null, description: '', city: '' };
    closeAddModal();
  } catch (err) {
    console.error('❌ Greška kod dodavanja:', err.response?.data || err);
    alert('Greška: ' + (err.response?.data?.message || err.message));
  }
};

const saveEdit = async () => {
  if (!editService.value || !editService.value._id) return;

  try {
    // Validacija opisa (maksimalno 200 riječi)
    if (editWordCount.value > 200) {
      alert('Opis ne smije prelaziti 200 riječi!');
      return;
    }

    const payload = {
      category: editService.value.category,
      subcategory: editService.value.category !== 'ostalo' ? editService.value.subcategory || null : null,
      customService: editService.value.category === 'ostalo' ? editService.value.customService || '' : '',
      priceType: editService.value.priceType,
      price: editService.value.price,
      description: editService.value.description,
      city: editService.value.city
    };

    const res = await api.put(`/services/${editService.value._id}`, payload, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });

    const idx = services.value.findIndex(s => s._id === res.data._id);
    if (idx !== -1) {
      services.value[idx] = res.data;
      filteredServices.value = [...services.value]; // Ažuriraj filteredServices
    }

    closeEditModal();
  } catch (err) {
    console.error('❌ Greška kod update-a:', err.response?.data || err);
    alert('Greška: ' + (err.response?.data?.message || err.message));
  }
};

const confirmDelete = async () => {
  if (!deleteServiceId.value) {
    console.error('Ne postoji ID za brisanje!');
    return;
  }

  try {
    await api.delete(`/services/${deleteServiceId.value}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });

    services.value = services.value.filter(s => s._id !== deleteServiceId.value);
    filteredServices.value = [...services.value]; // Ažuriraj filteredServices
    deleteServiceId.value = null;
    closeDeleteModal();
  } catch (err) {
    console.error('❌ Greška kod brisanja:', err.response?.data || err);
    alert('Greška: ' + (err.response?.data?.message || err.message));
  }
};
</script>

<style scoped>
.service i {
  font-size: 1.2rem;
  cursor: pointer;
}
.service i:hover {
  opacity: 0.7;
}
.modal-lg {
  max-width: 800px;
}
.form-label {
  font-weight: 500;
}
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.add-service{
  background: rgb(91, 119, 168);
  color: white;
  border: 1px solid rgb(91, 119, 168);
  border-radius: 10px;
  padding: 5px 10px;
}
@media (max-width: 576px) {
  .services {
    padding: 1rem;
  }
  .modal-dialog {
    margin: 0.5rem;
  }
}
</style>
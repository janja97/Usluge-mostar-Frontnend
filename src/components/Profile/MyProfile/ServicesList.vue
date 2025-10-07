<template>
  <div>
    <div class="services p-5 mt-4">
      <div v-if="filteredServices.length > 0">
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
            <p>grad: {{ s.city }}</p>
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
import { ref, onMounted, computed, nextTick } from 'vue';
import api from '../../../services/api';
import serviceCategories from '../../../data/services.json';
import { Modal } from 'bootstrap';

const services = ref([]);
const filteredServices = ref([]);
const editService = ref({});
const deleteServiceId = ref(null);

let editModalInstance = null;
let deleteModalInstance = null;

// --- COMPUTED ---
const editSelectedCategory = computed(() => {
  return serviceCategories.find(cat => cat.category === editService.value?.category);
});

const editWordCount = computed(() => {
  return editService.value.description
    ? editService.value.description.trim().split(/\s+/).filter(word => word.length > 0).length
    : 0;
});

const editShowPriceInput = computed(() => {
  return editService.value.priceType === 'sat' || editService.value.priceType === 'dnevno';
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
    filteredServices.value = res.data;
  } catch (err) {
    console.error('❌ Greška kod dohvaćanja usluga:', err.response?.data || err);
  }

  await nextTick();
  editModalInstance = new Modal(document.getElementById('editModal'));
  deleteModalInstance = new Modal(document.getElementById('deleteModal'));
});

// --- MODAL FUNCTIONS ---
const openEditModal = (service) => {
  editService.value = {
    _id: service._id,
    category: service.category || '',
    subcategory: service.subcategory || '',
    customService: service.customService || '',
    priceType: service.priceType || '',
    price: service.price ?? null,
    description: service.description || '',
    city: service.city || ''
  };

  if (editModalInstance) {
    editModalInstance.show();
  } else {
    console.error('Edit modal nije inicijaliziran!');
  }
};

const closeEditModal = () => {
  if (editModalInstance) editModalInstance.hide();
  document.activeElement?.blur();
};

const openDeleteModal = (service) => {
  if (!service?._id) return;
  deleteServiceId.value = service._id;
  if (deleteModalInstance) deleteModalInstance.show();
};
const closeDeleteModal = () => {
  if (deleteModalInstance) deleteModalInstance.hide();
  document.activeElement?.blur();
};

// --- EVENT HANDLERS ---
const onEditCategoryChange = () => {
  editService.value.subcategory = '';
  editService.value.customService = '';
};
const onEditPriceTypeChange = () => {
  if (editService.value.priceType === 'dogovor') editService.value.price = null;
};

// --- CRUD ---
const saveEdit = async () => {
  if (!editService.value?._id) return;

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

  try {
    const res = await api.put(`/services/${editService.value._id}`, payload, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });

    const idx = services.value.findIndex(s => s._id === res.data._id);
    if (idx !== -1) {
      services.value[idx] = res.data;
      filteredServices.value = [...services.value];
    }

    closeEditModal();
  } catch (err) {
    console.error('❌ Greška kod update-a:', err.response?.data || err);
    alert('Greška: ' + (err.response?.data?.message || err.message));
  }
};

const confirmDelete = async () => {
  if (!deleteServiceId.value) return;

  try {
    await api.delete(`/services/${deleteServiceId.value}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });

    services.value = services.value.filter(s => s._id !== deleteServiceId.value);
    filteredServices.value = [...services.value];
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
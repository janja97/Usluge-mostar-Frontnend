za obrisat
<template>
  <form @submit.prevent="submitForm">
    <div class="mb-3">
      <label class="form-label">Kategorija</label>
      <select v-model="service.category" class="form-select" required>
        <option value="">Odaberi kategoriju</option>
        <option v-for="cat in categories" :key="cat.category" :value="cat.category">{{ cat.category }}</option>
      </select>
    </div>

    <div class="mb-3">
      <label class="form-label">Grad</label>
      <input v-model="service.city" type="text" class="form-control" required />
    </div>

    <div class="mb-3">
      <label class="form-label">Cijena</label>
      <input v-model.number="service.price" type="number" class="form-control" />
    </div>

    <div class="mb-3">
      <label class="form-label">Opis</label>
      <textarea v-model="service.description" class="form-control"></textarea>
    </div>

    <button type="submit" class="btn btn-success">Spremi</button>
  </form>
</template>

<script setup>
import { ref } from "vue";
import api from "../../../services/api";
import categories from "../../../data/services.json";

const props = defineProps({
  initialService: { type: Object, default: () => ({}) }
});
const emit = defineEmits(["saved"]);

const service = ref({ ...props.initialService });
const categoriesRef = ref(categories);

const submitForm = async () => {
  try {
    await api.post("/services", service.value, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    emit("saved");
    service.value = {};
  } catch (err) {
    console.error(err);
    alert("Greška kod dodavanja usluge!");
  }
};
</script>

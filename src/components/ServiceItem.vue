<template>
  <div class="card mb-2 p-2">
    <select v-model="local.service" class="form-select mb-2">
      <option value="">-- Odaberi uslugu --</option>
      <option value="ciscenje">Čišćenje</option>
      <option value="cuvanje_djece">Čuvanje djece</option>
      <option value="fizicki_poslovi">Fizički poslovi</option>
      <option value="vozac">Vozač</option>
      <option value="dostava">Dostava</option>
      <option value="setanje_pasa">Šetanje pasa</option>
      <option value="kuhanje">Kuhanje</option>
      <option value="ostalo">Ostalo</option>
    </select>

    <div v-if="local.service === 'ostalo'" class="mb-2">
      <input v-model="local.customService" type="text" class="form-control" placeholder="Naziv usluge" />
    </div>

    <select v-model="local.priceType" class="form-select mb-2">
      <option value="sat">Po satu</option>
      <option value="dnevno">Dnevno</option>
      <option value="dogovor">Po dogovoru</option>
    </select>

    <div v-if="local.priceType !== 'dogovor'" class="mb-2">
      <input v-model.number="local.price" type="number" class="form-control" placeholder="Iznos" />
    </div>

    <div class="d-flex justify-content-end gap-2">
      <button type="button" class="btn btn-success btn-sm" @click="emitUpdate">Spremi</button>
      <button type="button" class="btn btn-danger btn-sm" @click="$emit('remove')">Ukloni</button>
    </div>
  </div>
</template>

<script setup>
import { reactive, toRefs, watch } from 'vue'
import { watchEffect } from 'vue'

const props = defineProps({
  initialData: {
    type: Object,
    default: () => ({ service: '', customService: '', priceType: 'dogovor', price: null })
  }
})

const emit = defineEmits(['update', 'remove'])

const local = reactive({ ...props.initialData })

const emitUpdate = () => {
  emit('update', { ...local })
}
</script>

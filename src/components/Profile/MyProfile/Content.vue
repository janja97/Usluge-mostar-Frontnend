<template>
  <div>
    <ul class="nav nav-tabs" id="myTab" role="tablist">
      <li class="nav-item" role="presentation">
        <button class="nav-link active" id="services-tab" data-bs-toggle="tab" data-bs-target="#services-tab-pane" type="button" role="tab" aria-controls="services-tab-pane" aria-selected="true">Oglasi</button>
      </li>
      <li class="nav-item" role="presentation">
        <button class="nav-link" id="favorites-tab" data-bs-toggle="tab" data-bs-target="#favorites-tab-pane" type="button" role="tab" aria-controls="favorites-tab-pane" aria-selected="false">Omiljeni Oglasi</button>
      </li>
      <li class="nav-item" role="presentation">
        <button class="nav-link" id="add-tab" data-bs-toggle="tab" data-bs-target="#add-tab-pane" type="button" role="tab" aria-controls="add-tab-pane" aria-selected="false">Dodaj oglas</button>
      </li>
    </ul>

    <div class="tab-content" id="myTabContent">
      <div class="tab-pane fade show active" id="services-tab-pane" role="tabpanel" aria-labelledby="services-tab" tabindex="0">
        <ServicesList />
      </div>

      <div class="tab-pane fade" id="favorites-tab-pane" role="tabpanel" aria-labelledby="favorites-tab" tabindex="0">
        <FavoritesList />
      </div>

      <div class="tab-pane fade" id="add-tab-pane" role="tabpanel" aria-labelledby="add-tab" tabindex="0">
        <AddService />
      </div>
    </div>
  </div>
</template>

<script setup>
import ServicesList from "./ServicesList.vue";
import FavoritesList from "./FavoritesList.vue";
import AddService from "./AddService.vue";
</script>

<template>
  <div class="container pt-5">
    <div class="d-flex flex-wrap">
      <Header :user="user" class="col-md-4 col-12" @updateUser="updateUser" @deleteUser="removeUser" />
      
      <div class="col-md-8 col-12 p-3">
        <ul class="nav nav-tabs">
          <li class="nav-item">
            <button class="nav-link" :class="{ active: activeTab === 'details' }" @click="activeTab='details'">
              Detalji
            </button>
          </li>
          <li class="nav-item">
            <button class="nav-link" :class="{ active: activeTab === 'services' }" @click="activeTab='services'">
              Aktivni oglasi
            </button>
          </li>
          <li class="nav-item">
            <button class="nav-link" :class="{ active: activeTab === 'favorites' }" @click="activeTab='favorites'">
              Omiljeni
            </button>
          </li>
          <li class="nav-item">
            <button class="nav-link" :class="{ active: activeTab === 'add' }" @click="activeTab='add'">
              Dodaj novu uslugu
            </button>
          </li>
        </ul>
        <div class="tab-content mt-3">
          <div v-if="activeTab==='details'" >
            janja
        
          </div>
        </div>
        <div class="tab-content mt-3">
          <ServicesList 
            v-if="activeTab==='services'" 
            ref="servicesListRef" 
          />
          <FavoritesList v-if="activeTab==='favorites'" />
          <AddService 
            v-if="activeTab==='add'" 
            @serviceAdded="refreshServices"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useUserStore } from "../store/user";
import Header from "../components/Profile/Header.vue";
import ServicesList from "../components/Profile/MyProfile/ServicesList.vue";
import FavoritesList from "../components/Profile/MyProfile/FavoritesList.vue";
import AddService from "../components/Profile/MyProfile/AddService.vue";

const userStore = useUserStore();
const user = ref(null);
const activeTab = ref('services');
const servicesListRef = ref(null);

const updateUser = (updated) => {
  user.value = updated;
};

const removeUser = () => {
  user.value = null;
};

const refreshServices = () => {
  activeTab.value = 'services';
  servicesListRef.value.fetchServices(); // poziva funkciju za refresh liste
};

onMounted(async () => {
  await userStore.fetchUser();
  user.value = userStore.$state.user;
});
</script>

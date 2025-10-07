<template>
  <div class="container pt-5">
    <div class="d-flex flex-wrap">
      <Header
        :user="user"
        class="col-md-4 col-12"
        @updateUser="updateUser"
        @deleteUser="removeUser"
        :loggedInUserId="loggedInUserId"
      />

      <div class="col-md-8 col-12 p-3">
        <ul class="nav nav-tabs">
          <li class="nav-item">
            <button class="nav-link" :class="{ active: activeTab === 'details' }" @click="activeTab = 'details'">
              Detalji
            </button>
          </li>
          <li class="nav-item">
            <button class="nav-link" :class="{ active: activeTab === 'services' }" @click="activeTab = 'services'">
              Aktivni oglasi
            </button>
          </li>
          <li class="nav-item" v-if="!route.params.id || route.params.id === loggedInUserId">
            <button class="nav-link" :class="{ active: activeTab === 'favorites' }" @click="activeTab = 'favorites'">
              Omiljeni
            </button>
          </li>
          <li class="nav-item" v-if="!route.params.id || route.params.id === loggedInUserId">
            <button class="nav-link" :class="{ active: activeTab === 'add' }" @click="activeTab = 'add'">
              Dodaj novu uslugu
            </button>
          </li>
        </ul>

        <div class="tab-content mt-3">
          <div v-if="activeTab === 'details'">
            <h4>{{ user?.fullName }}</h4>
            <p><strong>Email:</strong> {{ user?.email }}</p>
          </div>

          <ServicesList
            v-if="activeTab === 'services'"
            ref="servicesListRef"
          />

          <FavoritesList v-if="activeTab === 'favorites' && (!route.params.id || route.params.id === loggedInUserId)" />

          <AddService
            v-if="activeTab === 'add' && (!route.params.id || route.params.id === loggedInUserId)"
            @serviceAdded="refreshServices"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useUserStore } from "../store/user";
import { useRoute } from "vue-router";
import api from "../services/api";
import Header from "../components/Profile/Header.vue";
import ServicesList from "../components/Profile/MyProfile/ServicesList.vue";
import FavoritesList from "../components/Profile/MyProfile/FavoritesList.vue";
import AddService from "../components/Profile/MyProfile/AddService.vue";

const userStore = useUserStore();
const user = ref(null);
const activeTab = ref("services");
const servicesListRef = ref(null);
const route = useRoute();
const loggedInUserId = ref(null);

const updateUser = (updated) => {
  user.value = updated;
};

const removeUser = () => {
  user.value = null;
};

const refreshServices = () => {
  activeTab.value = "services";
  servicesListRef.value?.fetchServices();
};

const fetchUser = async () => {
  if (route.params.id) {
   
    try {
      const res = await api.get(`/users/${route.params.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      user.value = res.data;
    } catch (err) {
      console.error("❌ Greška pri dohvaćanju korisnika:", err);
    }
  } else {
    await userStore.fetchUser();
    user.value = userStore.$state.user;
  }
  loggedInUserId.value = userStore.$state.user?._id;
};

onMounted(fetchUser);


watch(
  () => route.params.id,
  () => fetchUser()
);
</script>

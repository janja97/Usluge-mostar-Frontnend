<template>
  <div class="container pt-5">
    <div class="d-flex flex-wrap">
      <ProfileHeader :user="user" :services="services" class="col-md-4 col-12" />

      <ServicesList class="col-md-8 col-12 p-3" />
      
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useUserStore } from "../store/user";
import ProfileHeader from "../components/Profile/Header.vue";
import ServicesList from "../components/Profile/MyProfile/ServicesList.vue";

const userStore = useUserStore();
const user = ref(null);
const services = ref([]);

onMounted(async () => {
  await userStore.fetchUser();
  user.value = userStore.$state.user;
});
</script>

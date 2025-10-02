<template>
  <div class="container pt-5">
    <div class="d-flex flex-wrap">
      <Header :user="user" class="col-md-4 col-12" @updateUser="updateUser" @deleteUser="removeUser" />
      <ServicesList class="col-md-8 col-12 p-3" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useUserStore } from "../store/user";
import Header from "../components/Profile/Header.vue";
import ServicesList from "../components/Profile/MyProfile/ServicesList.vue";

const userStore = useUserStore();
const user = ref(null);

const updateUser = (updated) => {
  user.value = updated;
};

const removeUser = () => {
  user.value = null;
};

onMounted(async () => {
  await userStore.fetchUser();
  user.value = userStore.$state.user;
});
</script>

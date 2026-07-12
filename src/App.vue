<template>
  <v-app theme="dark" style="background: #303742;">
    <nav-bar />
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup>
import NavBar from "./components/NavBar.vue";
</script>

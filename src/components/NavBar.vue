<template>
  <div>
    <v-toolbar color="#363e49" v-if="small">
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-spacer></v-spacer>
      <v-toolbar-title @click="$router.push('/')">
        <img src="/img/logo.png" style="max-height: 5em" alt="live torrent logo" />
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon @click="$router.go(-1)">
        <i class="fas fa-chevron-left"></i>
      </v-btn>
      <v-btn icon @click="$router.go(1)">
        <i class="fas fa-chevron-right"></i>
      </v-btn>
    </v-toolbar>

    <v-navigation-drawer
      v-model="drawer"
      :temporary="small"
      :mini-variant="!small && mini"
      app
      style="background: #414758;"
    >
      <v-toolbar flat class="transparent">
        <v-list>
          <v-list-item
            :prepend-avatar="logoSrc"
            :title="mini ? '' : 'Live Torrent'"
            @click="mini = !mini"
          >
            <template v-if="small" v-slot:append>
              <v-btn icon @click="drawer = false">
                <v-icon>close</v-icon>
              </v-btn>
            </template>
          </v-list-item>
        </v-list>
      </v-toolbar>

      <v-divider></v-divider>

      <v-list density="compact">
        <v-list-item
          v-for="item in items"
          :key="item.title"
          :to="item.path"
          :prepend-icon="item.icon"
          @click="small && (drawer = false)"
        >
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item>

        <v-list-item
          v-if="!small"
          @click="$router.go(-1)"
          prepend-icon="fas fa-chevron-left"
        >
          <v-list-item-title>Go Back</v-list-item-title>
        </v-list-item>

        <v-list-item
          v-if="!small"
          @click="$router.go(1)"
          prepend-icon="fas fa-chevron-right"
        >
          <v-list-item-title>Go Forward</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useDisplay } from "vuetify";

const display = useDisplay();

const drawer = ref(true);
const mini = ref(false);
const logoSrc = "/img/logo.png";

const items = [
  { title: "Home", icon: "fas fa-home", path: "/" },
  { title: "Movies", icon: "fas fa-film", path: "/movies" },
  { title: "Bookmarks", icon: "fas fa-bookmark", path: "/bookmarks" },
  { title: "About", icon: "info", path: "/about" }
];

const small = computed(() => display.smAndDown.value);

// Watch for mini changes
watch(mini, (newValue) => {
  localStorage.setItem("sidemenu.mini", newValue ? "true" : "false");
});

onMounted(() => {
  if (small.value) {
    drawer.value = false;
    mini.value = false;
  } else {
    mini.value = (localStorage.getItem("sidemenu.mini") || "true") === "true";
    drawer.value = true;
  }
});
</script>
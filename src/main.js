import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { createPinia } from "pinia";

import "./plugins/vuetify";
import "./utils/sweetalert2";
import "./utils/axios";
import "./utils/clipboard";

// Load external scripts dynamically
const loadExternalScript = (src) => {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

// Load external scripts
Promise.all([
  loadExternalScript("/js/plyr.js"),
  loadExternalScript("/js/jschardet.js"),
  loadExternalScript("https://unpkg.com/movie-trailer@2.0.3/index.js")
]).catch(err => console.warn("Failed to load external scripts:", err));

const app = createApp(App);

app.use(router);
app.use(createPinia());

// Global properties
app.config.globalProperties.hostURL = window.location.protocol + "//" + window.location.host;
app.config.globalProperties.window = window;

// Import and use social sharing (if available)
try {
  import("vue3-social-sharing").then(({ default: SocialSharing }) => {
    app.use(SocialSharing);
  }).catch(() => {
    console.warn("vue3-social-sharing not available");
  });
} catch (err) {
  console.warn("vue3-social-sharing import failed:", err);
}

// Import share buttons component
import ShareButtons from "./components/ShareButtons.vue";
app.component("share-buttons", ShareButtons);

// Register service worker (handled by Vite PWA plugin in production)
if (import.meta.env.PROD) {
  import('./pwa-register').then(({ registerSW }) => {
    registerSW();
  }).catch(err => {
    console.warn('PWA registration failed:', err);
  });
}

app.mount("#app");

import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import "@fortawesome/fontawesome-free/css/all.css";
import "vuetify/styles";

export default createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: "dark",
    themes: {
      dark: {
        colors: {
          primary: "#445064",
          secondary: "#303742",
          accent: "#82B1FF",
          error: "#FF5252",
          info: "#2196F3",
          success: "#4CAF50",
          warning: "#FFC107"
        }
      }
    }
  },
  defaults: {
    VBtn: {
      style: "text-transform: none;"
    }
  }
});

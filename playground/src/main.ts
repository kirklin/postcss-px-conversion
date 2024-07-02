import { createApp } from "vue";

import App from "~/App.vue";

// reset css
import "@kirklin/reset-css/kirklin.css";
import "~/styles/main.scss";

const app = createApp(App);
app.mount("#app");

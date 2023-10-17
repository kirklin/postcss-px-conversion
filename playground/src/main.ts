import { createApp } from "vue";

import { router } from "./router";

import App from "~/App.vue";

// reset css
import "@kirklin/reset-css/kirklin.css";
import "vant/lib/index.css";
import "~/styles/main.scss";

const app = createApp(App);
app.use(router);
app.mount("#app");

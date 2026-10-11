import { ref, watch } from "vue";

export type Theme = "light" | "dark";

// index.html sets the first theme before the page paints, from the saved choice or the system setting
export const theme = ref<Theme>(document.documentElement.dataset.theme === "dark" ? "dark" : "light");

watch(theme, (value) => {
  document.documentElement.dataset.theme = value;
  localStorage.setItem("theme", value);
});

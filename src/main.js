import "./styles/styles.css";
import theme from "./themeStore.js";

Object.entries(theme.spacing).forEach(([key, value]) => {
  document.documentElement.style.setProperty(`--space-${key}`, value);
});
Object.entries(theme.sizing).forEach(([key, value]) => {
  document.documentElement.style.setProperty(`--size-${key}`, value);
});

import "./app.js";

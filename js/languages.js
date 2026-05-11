const DEFAULT_LANG = "es";
let translations = {};
let currentLang = DEFAULT_LANG;

async function loadTranslations() {
  try {
    const res = await fetch("/data/translations.json");
    if (!res.ok) {
      console.error("No se pudo cargar translations.json", res.status);
      return;
    }
    translations = await res.json();
    applyTranslations(currentLang);
  } catch (err) {
    console.error("Error cargando translations.json", err);
  }
}

function applyTranslations(lang) {
  const dict = translations[lang];
  if (!dict) {
    console.warn("No hay traducciones para", lang);
    return;
  }

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (dict[key]) {
      el.textContent = dict[key];
    }
  });
}

function initLanguageSelector() {
  const select = document.getElementById("langSelect");
  if (!select) {
    console.warn("No se encontró #langSelect");
    return;
  }

  select.value = currentLang;

  select.addEventListener("change", (e) => {
    const lang = e.target.value;
    if (translations[lang]) {
      currentLang = lang;
      applyTranslations(lang);
    } else {
      console.warn("Idioma sin traducciones:", lang);
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  loadTranslations();
  initLanguageSelector();
});
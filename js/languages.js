const DEFAULT_LANG = "es";
let translations = {};
let currentLang = DEFAULT_LANG;
let cachedElements = null;

// Clave para localStorage
const STORAGE_KEY = "eos-selected-lang";

/**
 * Obtiene el idioma guardado o el predeterminado
 */
function getStoredLang() {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored && stored.match(/^(es|en|de|pt|it)$/) ? stored : DEFAULT_LANG;
}

/**
 * Guarda el idioma en localStorage
 */
function storeLang(lang) {
  localStorage.setItem(STORAGE_KEY, lang);
}

/**
 * Obtiene los elementos traducibles con caché
 */
function getTranslatableElements() {
  if (!cachedElements) {
    cachedElements = Array.from(document.querySelectorAll("[data-i18n]"));
  }
  return cachedElements;
}

/**
 * Actualiza la caché de elementos traducibles.
 * Útil si se agregan elementos dinámicamente después de la carga inicial.
 */
function refreshTranslatableCache() {
  cachedElements = Array.from(document.querySelectorAll("[data-i18n]"));
  console.log("Caché de traducciones actualizada:", cachedElements.length, "elementos");
}

async function loadTranslations() {
  try {
    const res = await fetch("/data/translations.json");
    if (!res.ok) {
      console.error("No se pudo cargar translations.json", res.status);
      return;
    }
    translations = await res.json();
    
    // Cargar idioma guardado antes de aplicar
    currentLang = getStoredLang();
    applyTranslations(currentLang);
    
    // Sincronizar selector después de aplicar
    syncLanguageSelector();
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

  const elements = getTranslatableElements();
  
  requestAnimationFrame(() => {
    for (const el of elements) {
      const key = el.getAttribute("data-i18n");
      const newText = dict[key];
      if (newText && el.textContent !== newText) {
        el.textContent = newText;
      }
    }
  });
}

/**
 * Sincroniza el valor del selector con el idioma actual
 */
function syncLanguageSelector() {
  const select = document.getElementById("langSelect");
  if (select && select.value !== currentLang) {
    select.value = currentLang;
  }
}

function initLanguageSelector() {
  const select = document.getElementById("langSelect");
  if (!select) {
    console.warn("No se encontró #langSelect");
    return;
  }

  // Asegurar que el selector muestre el idioma actual
  select.value = currentLang;

  select.addEventListener("change", (e) => {
    const lang = e.target.value;
    if (translations[lang]) {
      currentLang = lang;
      storeLang(lang);        // Guardar en localStorage
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
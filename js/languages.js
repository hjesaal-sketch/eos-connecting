const DEFAULT_LANG = "es";
let translations = {};
let currentLang = DEFAULT_LANG;
let cachedElements = null;

/**
 * Obtiene los elementos traducibles con caché.
 * La primera vez recorre el DOM, las siguientes usa la caché.
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
 * 
 * @example
 * // Después de agregar un modal o popup dinámico:
 * refreshTranslatableCache();
 * applyTranslations(currentLang);
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

  const elements = getTranslatableElements();
  
  // requestAnimationFrame evita bloquear el hilo principal
  requestAnimationFrame(() => {
    for (const el of elements) {
      const key = el.getAttribute("data-i18n");
      const newText = dict[key];
      // Solo actualizar si el texto cambió (evita reflows innecesarios)
      if (newText && el.textContent !== newText) {
        el.textContent = newText;
      }
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
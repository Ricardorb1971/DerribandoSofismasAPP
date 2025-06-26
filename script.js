const EXCEL_URL = 'https://d292edf8-aa74-4482-87f2-71818180c952.usrfiles.com/ugd/d292ed_faed9bda42964f41a89406704792c248.xlsx';

let currentView = "home";
let temaFiltrado = [];
let temaIndex = 0;
let entradaActual = null;

function safeText(value, fallback = "Título") {
  return value == null || value === "" ? fallback : value;
}

async function loadExcelSheetByName(sheetName) {
  const response = await fetch(EXCEL_URL);
  const arrayBuffer = await response.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const sheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(sheet);
}

function goHome() {
  document.getElementById("main-screen").style.display = "block";
  document.getElementById("content").innerHTML = "";
  currentView = "home";
  updateNavBar();
}

function updateNavBar() {
  const nav = document.getElementById("navigation-bar");
  const backBtn = document.getElementById("back-button");
  const icon = document.getElementById("nav-icon");

  nav.classList.toggle("hidden", currentView === "home");

  if (["temas", "estudios", "favoritos", "biblioteca"].includes(currentView)) {
    icon.src = "https://static.wixstatic.com/media/d292ed_01a86087e2e444ccbb0ae4967e1b8c89~mv2.png";
    backBtn.onclick = goHome;
  } else {
    icon.src = "https://static.wixstatic.com/media/d292ed_91e2ebf544b7485791232120a8f8d0b9~mv2.png";
    backBtn.onclick = () => loadView(currentView === "estudioDetalle" ? 2 : 1);
  }
}

function showStudyDetails(entry, index, list, source) {
  temaFiltrado = list;
  temaIndex = index;
  const favKey = generateEntryKey(entry);
  const favSet = JSON.parse(localStorage.getItem("favoritos") || "[]");
  const isFav = favSet.includes(favKey);
  const symbol = isFav ? "✟" : "♡";

  const container = document.getElementById("content");
  container.innerHTML = `
    <div class="card">
      <div class="title-with-arrows">
  <button class="arrow-button" onclick="navigateTema(-1)">
    <img src="https://static.wixstatic.com/media/d292ed_408012e124fc4f9ba6ae39b6873b9454~mv2.png" alt="Anterior" />
  </button>
  <h2 class="tema-central">${safeText(entry.Tema || entry.Titulo)}</h2>
  <button class="arrow-button" onclick="navigateTema(1)">
    <img src="https://static.wixstatic.com/media/d292ed_9a93fe36e0414dd687820f5429964c47~mv2.png" alt="Siguiente" />
  </button>
</div>
      <hr class="divider">
      ${entry["Sub-Tema"] ? `<p><strong>Subtema:</strong> ${safeText(entry["Sub-Tema"])}</p>` : ""}
      ${entry.Libro ? `<p><strong>Libro:</strong> ${safeText(entry.Libro)}</p>` : ""}
      ${entry.Capítulo ? `<p><strong>Capítulo:</strong> ${safeText(entry.Capítulo)}</p>` : ""}
      ${entry.Versículos ? `<p><strong>Versículos:</strong> ${safeText(entry.Versículos)}</p>` : ""}
      ${entry.Contenido ? `<div><strong>Contenido:</strong><p>${safeText(entry.Contenido).replace(/\n/g, '<br>')}</p></div>` : ""}
      ${entry.Apologética ? `<div><strong>Apologética:</strong><p>${safeText(entry.Apologética).replace(/\n/g, '<br>')}</p></div>` : ""}
      ${entry["Lectura Bíblica"] ? `<div><strong>Lectura Bíblica:</strong><p>${safeText(entry["Lectura Bíblica"]).replace(/\n/g, '<br>')}</p></div>` : ""}
      ${entry.Estudios ? `<div><strong>Estudio:</strong><p>${safeText(entry.Estudios).replace(/\n/g, '<br>')}</p></div>` : ""}
      ${entry.Enlace ? `<p><a href="${entry.Enlace}" target="_blank">🔗 Ver en Facebook</a></p>` : ""}
      ${entry["Enlace del Libro"] ? `<p><a href="${entry["Enlace del Libro"]}" target="_blank">🔗 Leer libro</a></p>` : ""}
      ${entry["Imágenes"] ? `<div><img src="${entry["Imágenes"]}" style="width:100%; margin-top:20px; border-radius:12px;"></div>` : ""}
      <button class="favorite-btn" id="fav-${temaIndex}" onclick="toggleFavorite(${JSON.stringify(entry).replace(/"/g, '&quot;')}, this)">${symbol}</button>

      <div class="share-section">
        <p><strong>📤 Compartir:</strong></p>
        <div class="share-buttons">
          <button class="share-button" onclick="copiarTextoCompleto()">
            <img src="https://static.wixstatic.com/media/d292ed_12d771941592412283bc33051285feea~mv2.png" alt="Copiar" title="Copiar al portapapeles">
          </button>
          <a id="btn-whatsapp" class="share-button" target="_blank">
            <img src="https://static.wixstatic.com/media/d292ed_08b5b41aea0d4395add4f45a57fffe07~mv2.png" alt="WhatsApp" title="Compartir en WhatsApp">
          </a>
          <a id="btn-messenger" class="share-button" target="_blank">
            <img src="https://static.wixstatic.com/media/d292ed_45904dc1a0b44428bd01f1a118fc988c~mv2.png" alt="Messenger" title="Compartir en Messenger">
          </a>
        </div>
      </div>  
  `;

  const texto = `
📖 ${safeText(entry.Tema || entry.Titulo)}
${entry["Sub-Tema"] ? `📘 Subtema: ${entry["Sub-Tema"]}` : ""}
📚 Libro: ${safeText(entry.Libro)} ${safeText(entry.Capítulo)}${entry.Versículos ? `, versículos: ${entry.Versículos}` : ""}

📝 Contenido:
${entry.Contenido || "No disponible"}

🗣️ Apologética:
${entry.Apologética || "No disponible"}

📖 Lectura Bíblica:
${entry["Lectura Bíblica"] || "No disponible"}

${entry.Estudios ? `📚 Estudio: ${entry.Estudios}` : ""}
${entry.Enlace ? `🔗 Enlace: ${entry.Enlace}` : ""}
👉 Más en www.derribandosofismas.com
  `;

  document.getElementById("btn-whatsapp")?.setAttribute("href", `https://wa.me/?text=${encodeURIComponent(texto)}`);
  document.getElementById("btn-messenger")?.setAttribute("href", `fb-messenger://share?link=${encodeURIComponent("https://www.derribandosofismas.com")}`);

  currentView = source === "estudios" ? "estudioDetalle" : "temaDetalle";
  updateNavBar();
}

function copiarTextoCompleto() {
  const card = document.querySelector(".card");
  if (card) {
    navigator.clipboard.writeText(card.innerText.trim())
      .then(() => alert("Texto copiado al portapapeles ✅"))
      .catch(() => alert("No se pudo copiar el texto ❌"));
  }
}

function generateEntryKey(entry) {
  return (entry.Tema || entry.Titulo || "") + (entry["Sub-Tema"] || "") + (entry.Libro || "");
}

function toggleFavorite(entry, btn) {
  const key = generateEntryKey(entry);
  let favSet = JSON.parse(localStorage.getItem("favoritos") || "[]");
  let libraries = JSON.parse(localStorage.getItem("bibliotecas") || "{}");

  if (favSet.includes(key)) {
    favSet = favSet.filter(e => e !== key);
    Object.keys(libraries).forEach(cat => {
      libraries[cat] = libraries[cat].filter(e => generateEntryKey(e) !== key);
      if (libraries[cat].length === 0) delete libraries[cat];
    });
    btn.textContent = "♡";
  } else {
    entradaActual = entry;
    mostrarModalFavoritos(btn);
    return;
  }

  localStorage.setItem("favoritos", JSON.stringify(favSet));
  localStorage.setItem("bibliotecas", JSON.stringify(libraries));

  if (currentView === "favoritos") loadFavorites();
}

function mostrarModalFavoritos(btn) {
  const modal = document.getElementById("libraryModal");
  modal.dataset.btnref = btn ? btn.id : "";
  const select = document.getElementById("librarySelect");
  const libraries = JSON.parse(localStorage.getItem("bibliotecas") || "{}");

  select.innerHTML = '<option value="">-- Selecciona biblioteca --</option>';
  Object.keys(libraries).forEach(lib => {
    const opt = document.createElement("option");
    opt.value = lib;
    opt.textContent = lib;
    select.appendChild(opt);
  });

  modal.classList.remove("hidden");
}

function cerrarModal() {
  document.getElementById("libraryModal").classList.add("hidden");
  entradaActual = null;
}

function guardarEnBiblioteca() {
  const select = document.getElementById("librarySelect");
  const input = document.getElementById("newLibraryInput");
  const color = document.getElementById("colorPicker").value;
  const nombre = input.value.trim() || select.value;
  if (!nombre) return alert("Debes seleccionar o crear una biblioteca");

  const libraries = JSON.parse(localStorage.getItem("bibliotecas") || "{}");
  if (!libraries[nombre]) libraries[nombre] = [];
  libraries[nombre].push({ ...entradaActual, color });

  let favSet = JSON.parse(localStorage.getItem("favoritos") || "[]");
  const key = generateEntryKey(entradaActual);
  if (!favSet.includes(key)) favSet.push(key);

  localStorage.setItem("bibliotecas", JSON.stringify(libraries));
  localStorage.setItem("favoritos", JSON.stringify(favSet));

  const modal = document.getElementById("libraryModal");
  const btnId = modal.dataset.btnref;
  if (btnId) {
    const boton = document.getElementById(btnId);
    if (boton) boton.textContent = "✟";
  }

  cerrarModal();
  alert(`Guardado en biblioteca "${nombre}"`);
}

function loadFavorites() {
  document.getElementById("main-screen").style.display = "none";
  const container = document.getElementById("content");
  container.innerHTML = `<h2 class='tema-title'>📘 Mis Lecturas Favoritas</h2>`;
  currentView = "favoritos";
  updateNavBar();

  const libraries = JSON.parse(localStorage.getItem("bibliotecas") || "{}");
  if (Object.keys(libraries).length === 0) {
    container.innerHTML += "<p style='text-align:center'>No tienes lecturas favoritas aún.</p>";
    return;
  }

  Object.entries(libraries).forEach(([nombre, lecturas]) => {
    const section = document.createElement("div");
    section.innerHTML = `<h3>${safeText(nombre)}</h3>`;
    const grid = document.createElement("div");
    grid.className = "tema-grid";
    lecturas.forEach((entry, i) => {
      const btn = document.createElement("button");
      btn.className = "study-button";
      btn.innerHTML = `<strong>${safeText(entry.Tema)}</strong><br>${safeText(entry["Sub-Tema"] || entry.Titulo)}`;
      if (entry.color) btn.style.backgroundColor = entry.color;
      btn.onclick = () => showStudyDetails(entry, i, lecturas, "favoritos");
      grid.appendChild(btn);
    });
    section.appendChild(grid);
    container.appendChild(section);
  });
}

function navigateTema(direction) {
  temaIndex += direction;
  if (temaIndex < 0) temaIndex = 0;
  if (temaIndex >= temaFiltrado.length) temaIndex = temaFiltrado.length - 1;
  showStudyDetails(temaFiltrado[temaIndex], temaIndex, temaFiltrado, currentView === "estudioDetalle" ? "estudios" : "temas");
}

async function loadView(index) {
  document.getElementById("main-screen").style.display = "none";
  const container = document.getElementById("content");
  container.innerHTML = '<p>Cargando...</p>';
  const data = await loadExcelSheetByName(index === 1 ? "LecturasBiblicas" : "EstudiosFacebook");
  container.innerHTML = '';
  currentView = index === 1 ? "temas" : "estudios";
  if (index === 1) data.sort(() => Math.random() - 0.5);

  const uniqueTemas = [...new Set(data.map(e => e.Tema).filter(Boolean))].sort();
  const title = document.createElement("h2");
  title.className = index === 1 ? "tema-title" : "estudio-title";
  title.textContent = index === 1 ? "Apologética" : "Estudios";
  container.appendChild(title);
  const hr = document.createElement("hr");
  hr.className = "divider";
  container.appendChild(hr);

  if (index === 1) {
    const dropdown = document.createElement("select");
    dropdown.className = "topic-filter";
    dropdown.innerHTML = `<option value="">-- Filtrar por Tema --</option>` + uniqueTemas.map(t => `<option value="${t}">${t}</option>`).join("");
    dropdown.onchange = () => {
      const value = dropdown.value;
      const filtered = value ? data.filter(e => e.Tema === value) : data;
      displayTemas(filtered, container, index);
    };
    container.appendChild(dropdown);
  }

  displayTemas(data, container, index);
  updateNavBar();
}

function displayTemas(data, container, index) {
  const oldGrid = container.querySelector(".tema-grid, .grid-container");
  if (oldGrid) oldGrid.remove();
  const grid = document.createElement("div");
  grid.className = index === 1 ? "tema-grid" : "grid-container";

  data.forEach((entry, i) => {
    const el = document.createElement("div");
    if (index === 1) {
      el.className = "study-button";
      el.innerHTML = `<strong>${safeText(entry.Tema)}</strong><br>${safeText(entry["Sub-Tema"])}`;
    } else {
      el.className = "grid-item";
      const img = entry["Imágenes"]?.trim() || "https://static.vecteezy.com/system/resources/previews/025/000/473/original/holy-bible-religious-clipart-design-free-png.png";
      el.innerHTML = `<img src="${img}"><h3>${safeText(entry.Titulo)}</h3>`;
    }
    el.onclick = () => showStudyDetails(entry, i, data, index === 1 ? "temas" : "estudios");
    grid.appendChild(el);
  });

  container.appendChild(grid);
}

window.addEventListener("load", () => {
  const welcome = document.getElementById("welcome-screen");
  const mainWrapper = document.getElementById("main-wrapper");

  setTimeout(() => {
    welcome.style.opacity = "0";
    setTimeout(() => {
      welcome.style.display = "none";
      mainWrapper.classList.remove("hidden");
    }, 2000);
  }, 5000);
});

document.getElementById("darkModeToggle").addEventListener("change", (e) => {
  document.body.classList.toggle("light", !e.target.checked);
});

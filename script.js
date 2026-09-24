/* =========================================================
   TIRIBON — portada
   Depende de catalogo.js y comun.js.
   ========================================================= */

/* ---------------------------------------------------------
   Nav activa según sección visible
--------------------------------------------------------- */
const navLinks = $$('.nav a');
const spied = navLinks.map((a) => $(a.getAttribute('href'))).filter(Boolean);

if ('IntersectionObserver' in window && spied.length) {
  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        navLinks.forEach((a) =>
          a.classList.toggle('is-active', a.getAttribute('href') === `#${e.target.id}`)
        );
      });
    },
    { rootMargin: '-45% 0px -50% 0px' }
  );
  spied.forEach((s) => spy.observe(s));
}

/* ---------------------------------------------------------
   Camisetas — la foto va sobre un fondo del color de la prenda
--------------------------------------------------------- */
const TONO = { rockcat: '#FBD3E6', 'devil-inside': '#E4E1EC', 'crazy-penguin': '#FCEFB4', 'save-the-planet': '#FFFFFF' };

$('#shop-grid').innerHTML = PRODUCTS.map(
  (p) => `
  <article class="prod" data-id="${p.id}" style="--tono:${TONO[p.id] || '#F3E3CC'}">
    <a class="prod-img" href="producto.html?id=${p.id}" aria-label="Ver ${p.full}" style="--w:${p.cw};--x:${p.cx};--t:${p.cy};--pos:${p.pos}">
      <img src="${imgGrande(p)}" srcset="${srcsetDe(p)}"
           sizes="(max-width:620px) 46vw, (max-width:1100px) 30vw, 22vw"
           alt="${p.full} ${p.color.toLowerCase()}, diseño ${p.name}" loading="lazy">
      <span class="prod-zoom" aria-hidden="true"><img src="${imgGrande(p)}" alt="" loading="lazy"></span>
    </a>
    <a class="prod-name" href="producto.html?id=${p.id}">${p.name}</a>
    <p class="prod-meta"><span class="prod-color">${p.color}</span></p>
    <p class="prod-soon">Próximamente</p>
  </article>`
).join('');

/* ---------------------------------------------------------
   Toallas
--------------------------------------------------------- */
$('#tow-grid').innerHTML = TOWELS.map(
  (t) => `
  <article class="twl">
    <a class="twl-art" href="producto.html?id=${t.id}" aria-label="Ver ${t.full}">
      <img src="${imgChico(t)}" srcset="${srcsetDe(t)}"
           sizes="(max-width:760px) 44vw, 16vw"
           alt="${t.full} extendida, vista de frente" width="1000" height="1000" loading="lazy">
    </a>
    <a class="twl-name" href="producto.html?id=${t.id}">${t.name}</a>
    <p class="twl-price">${precio(t.price)}</p>
    <button class="twl-add" data-add="${t.id}">Añadir al pedido</button>
  </article>`
).join('');

/* ---------------------------------------------------------
   Buscador — filtra la rejilla de verdad
--------------------------------------------------------- */
const searchBar = $('#search-bar');
const searchToggle = $('#search-toggle');
const searchInput = $('#search-input');
const searchMsg = $('#search-msg');

const norm = (v) =>
  v.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

function setSearch(open) {
  searchBar.hidden = !open;
  searchToggle.setAttribute('aria-expanded', String(open));
  if (open) searchInput.focus();
  else {
    searchInput.value = '';
    filterProducts('');
  }
}

function filterProducts(q) {
  const term = norm(q.trim());
  let shown = 0;
  $$('.prod').forEach((card) => {
    const p = PRODUCTS.find((x) => x.id === card.dataset.id);
    const hay = norm(`${p.name} ${p.color} ${p.desc}`);
    const match = !term || hay.includes(term);
    card.hidden = !match;
    if (match) shown += 1;
  });
  if (!term) searchMsg.textContent = '';
  else if (shown === 0) searchMsg.textContent = `No hay diseños que coincidan con "${q.trim()}".`;
  else searchMsg.textContent = shown === 1 ? '1 diseño' : `${shown} diseños`;
}

searchToggle.addEventListener('click', () => setSearch(searchBar.hidden));
$('#search-clear').addEventListener('click', () => setSearch(false));
searchInput.addEventListener('input', (e) => filterProducts(e.target.value));
searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') setSearch(false);
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !searchBar.hidden) setSearch(false);
});

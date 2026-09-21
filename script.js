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
   Grilla de colección
--------------------------------------------------------- */
$('#shop-grid').innerHTML = PRODUCTS.map(
  (p) => `
  <article class="prod pan-${p.ct}" style="--c:${p.c}">
    <a class="prod-img" href="producto.html?id=${p.id}" aria-label="Ver ${p.full}" style="--w:${p.cw};--x:${p.cx};--t:${p.cy};--pos:${p.pos}">
      <img src="${imgGrande(p)}" srcset="${srcsetDe(p)}"
           sizes="(max-width:620px) 46vw, (max-width:980px) 45vw, 44vw"
           alt="Niño con la ${p.full.toLowerCase()} ${p.color.toLowerCase()}, diseño ${p.name}"
           loading="lazy">
      <span class="prod-zoom" aria-hidden="true"><img src="${imgGrande(p)}" alt="" loading="lazy"></span>
    </a>
    <div class="prod-info">
      <a class="prod-name" href="producto.html?id=${p.id}">${p.name}</a>
      <p class="prod-tags"><span>${p.color}</span><span>Algodón orgánico</span></p>
      <div class="prod-buy">
        <span class="prod-price">Precio por WhatsApp</span>
        <button class="prod-add" data-add="${p.id}">Añadir</button>
      </div>
    </div>
  </article>`
).join('');

/* ---------------------------------------------------------
   Rejilla de toallas
--------------------------------------------------------- */
$('#tow-grid').innerHTML = TOWELS.map(
  (t) => `
  <article class="twl">
    <a class="twl-art" href="producto.html?id=${t.id}" aria-label="Ver ${t.full}">
      <img src="${imgChico(t)}" srcset="${srcsetDe(t)}"
           sizes="(max-width:900px) 46vw, 23vw"
           alt="${t.full} extendida, vista de frente" width="1000" height="1000" loading="lazy">
    </a>
    <div class="twl-info">
      <a class="twl-name" href="producto.html?id=${t.id}">${t.name}</a>
      <p class="twl-sub">Edición Lucas Baró</p>
      <button class="twl-add" data-add="${t.id}">Añadir al pedido</button>
    </div>
  </article>`
).join('');

/* ---------------------------------------------------------
   Plancha de diseños
--------------------------------------------------------- */
$('#prints-strip').innerHTML = PRODUCTS.map(
  (p) => `
  <figure class="plate" style="--w:${p.cw};--x:${p.cx};--t:${p.cy}">
    <span class="plate-img"><img src="${imgGrande(p)}" srcset="${srcsetDe(p)}"
        sizes="(max-width:620px) 98vw, 50vw"
        alt="Detalle ampliado del diseño ${p.name}" loading="lazy"></span>
    <figcaption>${p.name}</figcaption>
  </figure>`
).join('');

/* ---------------------------------------------------------
   Dibujos de la marca sobre la banda de toallas
--------------------------------------------------------- */
$('#tow-art').innerHTML =
  '<img src="assets/icons/gato.svg" alt="" width="300" height="300">';

/* ---------------------------------------------------------
   FAQ
--------------------------------------------------------- */
$$('.faq-i').forEach((item) => {
  const q = item.querySelector('.faq-q');
  q.addEventListener('click', () => {
    const open = item.classList.toggle('is-open');
    q.setAttribute('aria-expanded', String(open));
  });
});


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
    const p = PRODUCTS.find((x) => x.id === card.querySelector('[data-add]').dataset.add);
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

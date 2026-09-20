/* =========================================================
   TIRIBON — interacciones
   ========================================================= */

/* TODO: cuando haya número de WhatsApp, ponerlo acá en formato
   internacional y sin el "+" (ej: "5491122334455").
   Mientras esté vacío, el botón abre WhatsApp con el mensaje ya
   escrito para que se elija el contacto a mano. */
const WHATSAPP_NUMBER = '';

const waLink = (msg) =>
  `${WHATSAPP_NUMBER ? `https://wa.me/${WHATSAPP_NUMBER}` : 'https://api.whatsapp.com/send'}?text=${encodeURIComponent(msg)}`;

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

/* ---------------------------------------------------------
   Catálogo
--------------------------------------------------------- */
const PRODUCTS = [
  {
    id: 'rockcat',
    type: 'camiseta',
    name: 'Rockcat',
    full: 'Camiseta Rockcat',
    color: 'Rosa',
    img: 'images/rockcat.jpg',
    cw: '214%', cx: '-59.4%', cy: '-111.3%',
    desc: 'Cuatro gatos con cazadora de cuero montando banda. Comodidad absoluta, suavidad natural y pura creatividad para llenar de color sus aventuras diarias.',
  },
  {
    id: 'devil-inside',
    type: 'camiseta',
    name: 'Devil Inside',
    full: 'Camiseta Devil Inside',
    color: 'Negra',
    img: 'images/devil-inside.jpg',
    cw: '218%', cx: '-65.5%', cy: '-124.7%',
    desc: 'Trazo rojo sobre negro, para quien ya tiene su propia actitud resuelta. Ilustración exclusiva de autor sobre algodón orgánico certificado.',
  },
  {
    id: 'crazy-penguin',
    type: 'camiseta',
    name: 'Crazy Penguin',
    full: 'Camiseta Crazy Penguin',
    color: 'Amarilla',
    img: 'images/crazy-penguin.jpg',
    cw: '279%', cx: '-97.6%', cy: '-162.8%',
    desc: 'Un pingüino con casco puesto y ninguna intención de quedarse quieto. Suave al tacto, transpirable y pensada para durar lavado tras lavado.',
  },
  {
    id: 'save-the-planet',
    type: 'camiseta',
    name: 'Save the Planet',
    full: 'Camiseta Save the Planet',
    color: 'Blanca',
    img: 'images/save-the-planet.jpg',
    cw: '179%', cx: '-40.9%', cy: '-82.8%',
    desc: 'Una ballena, unas focas y un mensaje claro, contado en idioma de niño. Tintas ecológicas a base de agua, seguras para la piel.',
  },
];

/* ---------------------------------------------------------
   Toallas — mismos disenos de Lucas Baro que las camisetas.
   PENDIENTE DE VALIDAR CON EL CLIENTE: si la linea de toallas
   lleva otros disenos, cambiar los nombres aqui. Las fotos de
   producto todavia no existen: cada tarjeta muestra el dibujo,
   no la toalla.
--------------------------------------------------------- */
const TOWELS = PRODUCTS.map((p) => ({
  id: 'toalla-' + p.id,
  type: 'toalla',
  name: p.name,
  full: 'Toalla de Microfibra ' + p.name,
  color: 'Edición Lucas Baró',
  img: p.img,
  cw: p.cw, cx: p.cx, cy: p.cy,
  desc:
    'Diseñada para combinar la máxima funcionalidad con el arte contemporáneo. Ultraligera y de secado rápido, destaca por la ilustración exclusiva ' +
    p.name + ', firmada por Lucas Baró. Ideal para viaje, playa, piscina y deporte.',
}));

const ALL = [...PRODUCTS, ...TOWELS];
const find = (id) => ALL.find((x) => x.id === id);

/* ---------------------------------------------------------
   Header
--------------------------------------------------------- */
const hdr = $('#hdr');
const syncHdr = () => hdr.classList.toggle('is-stuck', window.scrollY > 10);
syncHdr();
window.addEventListener('scroll', syncHdr, { passive: true });

/* ---------------------------------------------------------
   Menú móvil
--------------------------------------------------------- */
const sheet = $('#sheet');
const burger = $('#nav-toggle');

function setSheet(open) {
  sheet.classList.toggle('is-open', open);
  document.body.classList.toggle('sheet-open', open);
  sheet.setAttribute('aria-hidden', String(!open));
  burger.setAttribute('aria-expanded', String(open));
  burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  document.body.style.overflow = open ? 'hidden' : '';
}

burger.addEventListener('click', () => setSheet(!sheet.classList.contains('is-open')));
sheet.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setSheet(false)));

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
    <button class="prod-img" data-open="${p.id}" aria-label="Ver ficha de ${p.full}">
      <img src="${p.img}" alt="Niño con la ${p.full.toLowerCase()} ${p.color.toLowerCase()}, diseño ${p.name}">
    </button>
    <div class="prod-info">
      <button class="prod-name" data-open="${p.id}">${p.name}</button>
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
    <button class="twl-art" data-open="${t.id}" aria-label="Ver ficha de ${t.full}" style="--w:${t.cw};--x:${t.cx};--t:${t.cy}">
      <img src="${t.img}" alt="Diseño ${t.name} de Lucas Baró">
      <span class="twl-flag">Diseño · foto de producto pendiente</span>
    </button>
    <div class="twl-info">
      <button class="twl-name" data-open="${t.id}">${t.name}</button>
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
    <span class="plate-img"><img src="${p.img}" alt="Detalle ampliado del diseño ${p.name}"></span>
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
   Pedido (carrito)
--------------------------------------------------------- */
const CART_KEY = 'tiribon-cart';
let cart = (() => {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch { return []; }
})();

const drawer = $('#cart-drawer');
const cartScrim = $('#cart-scrim');
const cartBtn = $('#cart-toggle');
const itemsEl = $('#cart-items');
const countEl = $('#cart-count');
const sumEl = $('#cart-summary-count');
const waBtn = $('#cart-wa');

const saveCart = () => localStorage.setItem(CART_KEY, JSON.stringify(cart));
const totalCount = () => cart.reduce((n, i) => n + i.qty, 0);

function openCart() {
  drawer.classList.add('is-open');
  cartScrim.classList.add('is-open');
  drawer.setAttribute('aria-hidden', 'false');
}
function closeCart() {
  drawer.classList.remove('is-open');
  cartScrim.classList.remove('is-open');
  drawer.setAttribute('aria-hidden', 'true');
}
cartBtn.addEventListener('click', openCart);
$('#cart-close').addEventListener('click', closeCart);
cartScrim.addEventListener('click', closeCart);

function addToCart(id, qty = 1) {
  const p = find(id);
  if (!p) return;
  const hit = cart.find((i) => i.id === id);
  if (hit) hit.qty += qty;
  else cart.push({ id, name: p.full, color: p.color, img: p.img, type: p.type, qty });
  saveCart();
  renderCart();
  cartBtn.classList.add('is-bump');
  setTimeout(() => cartBtn.classList.remove('is-bump'), 600);
}

function changeQty(id, delta) {
  const item = cart.find((i) => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter((i) => i.id !== id);
  saveCart();
  renderCart();
}

function buildMessage() {
  if (!cart.length) return '';
  let m = '¡Hola! Quiero hacer un pedido de TIRIBON:\n\n';
  cart.forEach((i) => { m += `• ${i.name} — x${i.qty}\n`; });
  m += '\n¿Me confirmáis tallas disponibles, stock y precio?';
  return m;
}

function renderCart() {
  if (!cart.length) {
    itemsEl.innerHTML = '<p class="c-empty">Todavía no has añadido ninguna prenda al pedido.</p>';
    waBtn.setAttribute('disabled', 'true');
  } else {
    itemsEl.innerHTML = cart.map((i) => `
      <div class="c-row" data-row="${i.id}">
        <img src="${i.img}" alt="">
        <div>
          <h4>${i.name}</h4>
          <p class="c-sub">${i.type === 'toalla' ? 'Microfibra · Lucas Baró' : i.color + ' · algodón orgánico'}</p>
          <div class="stepper">
            <button type="button" data-minus aria-label="Restar una unidad de ${i.name}">−</button>
            <span>${i.qty}</span>
            <button type="button" data-plus aria-label="Añadir una unidad de ${i.name}">+</button>
          </div>
        </div>
        <button type="button" class="c-del" aria-label="Quitar ${i.name} del pedido">Quitar</button>
      </div>`).join('');

    itemsEl.querySelectorAll('[data-row]').forEach((row) => {
      const id = row.dataset.row;
      row.querySelector('[data-minus]').addEventListener('click', () => changeQty(id, -1));
      row.querySelector('[data-plus]').addEventListener('click', () => changeQty(id, 1));
      row.querySelector('.c-del').addEventListener('click', () => {
        cart = cart.filter((i) => i.id !== id);
        saveCart();
        renderCart();
      });
    });
    waBtn.removeAttribute('disabled');
  }

  const n = totalCount();
  countEl.textContent = n;
  sumEl.textContent = n === 1 ? '1 prenda' : `${n} prendas`;
}

waBtn.addEventListener('click', () => {
  const msg = buildMessage();
  if (msg) window.open(waLink(msg), '_blank', 'noopener');
});

/* ---------------------------------------------------------
   Ficha de producto
--------------------------------------------------------- */
const qv = $('#qv');
const qvScrim = $('#qv-scrim');
const qvImg = $('#qv-img');
const qvQty = $('#qv-qty');
let current = null;
let qty = 1;

function openQV(id) {
  const p = find(id);
  if (!p) return;
  current = p;
  qty = 1;
  qvImg.src = p.img;
  qvImg.alt = `${p.full} ${p.color.toLowerCase()}, diseño ${p.name}`;
  $('#qv-name').textContent = p.full;
  $('#qv-desc').textContent = p.desc;
  const esToalla = p.type === 'toalla';
  $('#qv-kicker').textContent = esToalla
    ? 'Toalla de microfibra · Edición Lucas Baró'
    : 'Camiseta infantil de algodón orgánico';
  $('#qv-specs').innerHTML = (esToalla
    ? [
        'Tejido técnico ultra absorbente y de secado rápido',
        'Compacta y ligera: ocupa un espacio mínimo en tu bolsa',
        'Estampación digital de alta definición, colores vibrantes lavado tras lavado',
        'Diseño exclusivo ilustrado por <b>Lucas Baró</b>',
        'Medidas y precio se confirman por WhatsApp',
      ]
    : [
        '100% algodón orgánico certificado',
        'Suave al tacto, transpirable y resistente',
        'Tintas ecológicas a base de agua, seguras para la piel',
        'Ilustración exclusiva de autor por <b>Lucas Baró</b>, firmada sobre la prenda',
        'Tallas por rango de edad — se confirman por WhatsApp',
      ]
  ).map((li) => `<li>${li}</li>`).join('');
  $('#qv-care').hidden = esToalla;
  $('#qv-media').classList.toggle('is-art', esToalla);
  if (esToalla) {
    $('#qv-media').setAttribute('style', `--w:${p.cw};--x:${p.cx};--t:${p.cy}`);
  } else {
    $('#qv-media').removeAttribute('style');
  }
  qvQty.textContent = '1';
  qv.classList.add('is-open');
  qvScrim.classList.add('is-open');
  qv.setAttribute('aria-hidden', 'false');
  $('#qv-close').focus();
}

function closeQV() {
  qv.classList.remove('is-open');
  qvScrim.classList.remove('is-open');
  qv.setAttribute('aria-hidden', 'true');
}

$('#qv-close').addEventListener('click', closeQV);
qvScrim.addEventListener('click', closeQV);
$('#qv-minus').addEventListener('click', () => { qty = Math.max(1, qty - 1); qvQty.textContent = qty; });
$('#qv-plus').addEventListener('click', () => { qty += 1; qvQty.textContent = qty; });
$('#qv-add').addEventListener('click', () => {
  if (!current) return;
  addToCart(current.id, qty);
  closeQV();
  openCart();
});

/* ---------------------------------------------------------
   Disparadores de la grilla
--------------------------------------------------------- */
$$('[data-open]').forEach((el) =>
  el.addEventListener('click', () => openQV(el.dataset.open))
);

$$('[data-add]').forEach((btn) =>
  btn.addEventListener('click', () => {
    addToCart(btn.dataset.add, 1);
    const label = btn.textContent;
    btn.classList.add('done');
    btn.textContent = 'Añadido';
    setTimeout(() => { btn.classList.remove('done'); btn.textContent = label; }, 1300);
  })
);

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

/* ---------------------------------------------------------
   Escape cierra todo
--------------------------------------------------------- */
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  closeQV();
  closeCart();
  setSheet(false);
  if (!searchBar.hidden) setSearch(false);
});

/* ---------------------------------------------------------
   Links sueltos de WhatsApp
--------------------------------------------------------- */
$$('[data-wa]').forEach((el) => {
  el.setAttribute('href', waLink(el.dataset.wa));
  el.setAttribute('target', '_blank');
  el.setAttribute('rel', 'noopener');
});

renderCart();

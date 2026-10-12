/* =========================================================
   TIRIBON — interfaz compartida: header, menu y pedido
   Depende de catalogo.js. Lo cargan las dos paginas.
   ========================================================= */

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
   Pedido (carrito)
--------------------------------------------------------- */
const CART_KEY = 'tiribon-cart';
let cart = (() => {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch { return []; }
})().filter((i) => { const p = find(i.id); return p && !p.soon; }); // descarta camisetas guardadas antes de «próximamente»

const drawer = $('#cart-drawer');
const cartScrim = $('#cart-scrim');
const cartBtn = $('#cart-toggle');
const itemsEl = $('#cart-items');
const countEl = $('#cart-count');
const sumEl = $('#cart-summary-count');
const payBtn = $('#cart-pay');
const waBtn = $('#cart-wa');
const cartErr = $('#cart-err');
const totalEl = $('#cart-total');

const saveCart = () => localStorage.setItem(CART_KEY, JSON.stringify(cart));
const totalCount = () => cart.reduce((n, i) => n + i.qty, 0);
const totalPrice = () => cart.reduce((n, i) => n + (find(i.id)?.price || 0) * i.qty, 0);

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
  if (!p || p.soon) return;
  const hit = cart.find((i) => i.id === id);
  if (hit) hit.qty += qty;
  else cart.push({ id, name: p.full, color: p.color, img: p.img, thumb: imgChico(p), type: p.type, qty });
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

/* ---------------------------------------------------------
   Pedido por WhatsApp (alternativa al pago con tarjeta)
   Ya no pide nombre ni teléfono: WhatsApp muestra quién escribe.
--------------------------------------------------------- */
function buildMessage() {
  if (!cart.length) return '';

  const pad = (n) => String(n).padStart(2, '0');
  const hoy = new Date();
  const fecha = `${pad(hoy.getDate())}/${pad(hoy.getMonth() + 1)}/${hoy.getFullYear()}`;
  // corto y sin separadores: lo manda el cliente y no tiene que borrar nada.
  const linea = (i) => `${i.qty} × ${i.name} — ${precio(find(i.id).price * i.qty)}`;

  return [
    `*Pedido TIRIBON* · ${fecha}`,
    ...cart.map(linea),
    `*Total: ${precio(totalPrice())}*`,
    '',
    '¿Me confirmáis stock y cómo hago el pago?',
  ].join('\n');
}

function renderCart() {
  if (!cart.length) {
    itemsEl.innerHTML = '<p class="c-empty">Todavía no has añadido nada al pedido.</p>';
    payBtn.setAttribute('disabled', 'true');
    waBtn.setAttribute('disabled', 'true');
  } else {
    itemsEl.innerHTML = cart.map((i) => `
      <div class="c-row" data-row="${i.id}">
        <img src="${i.thumb || i.img}" alt="" loading="lazy">
        <div>
          <h4>${i.name}</h4>
          <p class="c-sub">Microfibra · ${precio(find(i.id).price)}</p>
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
    payBtn.removeAttribute('disabled');
    waBtn.removeAttribute('disabled');
  }
  cartErr.hidden = true;

  const n = totalCount();
  countEl.textContent = n;
  sumEl.textContent = n === 1 ? '1 artículo' : `${n} artículos`;
  totalEl.textContent = n ? `Total ${precio(totalPrice())}` : '';
}

waBtn.addEventListener('click', () => {
  const msg = buildMessage();
  if (msg) window.open(waLink(msg), '_blank', 'noopener');
});

/* ---------------------------------------------------------
   Pago con Stripe
   El servidor (api/checkout.js) pone los precios: acá solo viajan
   ids y cantidades. Si todo va bien, se sale a la página de Stripe.
--------------------------------------------------------- */
function showCartError(msg) {
  cartErr.textContent = msg;
  cartErr.hidden = false;
}

payBtn.addEventListener('click', async () => {
  if (!cart.length) return;
  const label = payBtn.textContent;
  payBtn.setAttribute('disabled', 'true');
  payBtn.textContent = 'Abriendo el pago…';
  cartErr.hidden = true;

  try {
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: cart.map(({ id, qty }) => ({ id, qty })) }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.url) throw new Error(data.error || 'No pudimos iniciar el pago. Inténtalo de nuevo.');
    window.location.href = data.url;
  } catch (err) {
    showCartError(err.message);
    payBtn.textContent = label;
    payBtn.removeAttribute('disabled');
  }
});

/* Con el botón "atrás" el navegador puede devolver la página tal cual
   se dejó, con el botón todavía en "Abriendo el pago…". */
window.addEventListener('pageshow', (e) => {
  if (!e.persisted) return;
  payBtn.textContent = 'Pagar ahora';
  renderCart();
});

/* Al volver de Stripe sin pagar, el pedido sigue en el carrito. */
if (new URLSearchParams(location.search).get('pago') === 'cancelado') {
  history.replaceState(null, '', location.pathname + location.hash);
  openCart();
  setTimeout(() => showCartError('El pago no se completó. Tu pedido sigue aquí por si quieres intentarlo de nuevo.'), 0);
}


/* Delegado en document: la grilla se dibuja despues de este archivo. */
document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-add]');
  if (!btn) return;
  addToCart(btn.dataset.add, 1);
  const label = btn.textContent;
  btn.classList.add('done');
  btn.textContent = 'Añadido';
  setTimeout(() => { btn.classList.remove('done'); btn.textContent = label; }, 1300);
});

document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  closeCart();
  setSheet(false);
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

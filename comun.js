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
   Datos del cliente (formulario del carrito)
--------------------------------------------------------- */
const cfNombre = $('#cf-nombre');
const cfTelefono = $('#cf-telefono');
const cfEntrega = $('#cf-entrega');
const cfPago = $('#cf-pago');
const cfNotas = $('#cf-notas');
const cfErr = $('#cf-err');

[cfNombre, cfTelefono].forEach((el) => el.addEventListener('input', () => { cfErr.hidden = true; }));

function buildMessage() {
  if (!cart.length) return '';

  const nombre = cfNombre.value.trim();
  const telefono = cfTelefono.value.trim();
  const entrega = cfEntrega.value;
  const pago = cfPago.value;
  const notas = cfNotas.value.trim();

  const pad = (n) => String(n).padStart(2, '0');
  const hoy = new Date();
  const fecha = `${pad(hoy.getDate())}/${pad(hoy.getMonth() + 1)}/${hoy.getFullYear()}`;
  const sep = '—'.repeat(20);

  let m = `*NUEVO PEDIDO - TIRIBON*\n${sep}\n`;
  m += `Cliente: ${nombre}\n`;
  m += `Teléfono: ${telefono}\n`;
  m += `Fecha: ${fecha}\n`;
  m += `Entrega: ${entrega}\n`;
  m += `Pago: ${pago}\n`;
  m += `${sep}\n*PEDIDO*\n`;
  cart.forEach((i) => { m += `* ${i.qty} ${i.name} — ${i.color}\n`; });
  m += sep;
  if (notas) m += `\nNotas: ${notas}`;
  m += '\n\nPrecio, talles y stock te los confirmamos por acá.';
  if (pago === 'Transferencia') m += '\nTe pasamos alias y titular apenas confirmemos el pedido.';

  return m;
}

function renderCart() {
  if (!cart.length) {
    itemsEl.innerHTML = '<p class="c-empty">Todavía no has añadido nada al pedido.</p>';
    waBtn.setAttribute('disabled', 'true');
  } else {
    itemsEl.innerHTML = cart.map((i) => `
      <div class="c-row" data-row="${i.id}">
        <img src="${i.thumb || i.img}" alt="" loading="lazy">
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
  sumEl.textContent = n === 1 ? '1 artículo' : `${n} artículos`;
}

waBtn.addEventListener('click', () => {
  if (!cfNombre.value.trim() || !cfTelefono.value.trim()) {
    cfErr.hidden = false;
    (!cfNombre.value.trim() ? cfNombre : cfTelefono).focus();
    return;
  }
  const msg = buildMessage();
  if (msg) window.open(waLink(msg), '_blank', 'noopener');
});


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

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
const PAIS_KEY = 'tiribon-pais';
let cart = (() => {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch { return []; }
})().filter((i) => { const p = find(i.id); return p && !p.soon; }); // descarta camisetas guardadas antes de «próximamente»
let pais = (() => { try { return localStorage.getItem(PAIS_KEY) || ''; } catch { return ''; } })();

/* Stock y envíos los manda el servidor (/api/tienda, que los lee de
   Stripe). Hasta que llegan se puede mirar y llenar el carrito, pero
   no pagar: son piezas exclusivas y no se vende a ciegas. */
let STOCK = null;   // { 'toalla-rockcat': 3, … }
let ENVIOS = [];    // [{ codigo: 'MX', nombre: 'México', precio: 15 }, …]
let tiendaCaida = false;

const quedan = (id) => (STOCK ? STOCK[id] ?? 0 : Infinity);
const envioElegido = () => ENVIOS.find((e) => e.codigo === pais);

const drawer = $('#cart-drawer');
const cartScrim = $('#cart-scrim');
const cartBtn = $('#cart-toggle');
const itemsEl = $('#cart-items');
const countEl = $('#cart-count');
const sumEl = $('#cart-summary-count');
const subEl = $('#cart-sub');
const shipEl = $('#cart-ship');
const paisEl = $('#cart-pais');
const payBtn = $('#cart-pay');
const cartErr = $('#cart-err');
const totalEl = $('#cart-total');

const saveCart = () => { try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch {} };
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

/* Devuelve false si no queda stock para sumar lo pedido. */
function addToCart(id, qty = 1) {
  const p = find(id);
  if (!p || p.soon) return false;
  const hit = cart.find((i) => i.id === id);
  const yaHay = hit ? hit.qty : 0;
  const suma = Math.min(qty, quedan(id) - yaHay);
  if (suma <= 0) return false;
  if (hit) hit.qty += suma;
  else cart.push({ id, name: p.full, color: p.color, img: p.img, thumb: imgChico(p), type: p.type, qty: suma });
  saveCart();
  renderCart();
  cartBtn.classList.add('is-bump');
  setTimeout(() => cartBtn.classList.remove('is-bump'), 600);
  return true;
}

function changeQty(id, delta) {
  const item = cart.find((i) => i.id === id);
  if (!item) return;
  item.qty = Math.min(item.qty + delta, quedan(id));
  if (item.qty <= 0) cart = cart.filter((i) => i.id !== id);
  saveCart();
  renderCart();
}

function renderCart() {
  const sinStock = cart.filter((i) => i.qty > quedan(i.id));

  if (!cart.length) {
    itemsEl.innerHTML = '<p class="c-empty">Todavía no has añadido nada al pedido.</p>';
  } else {
    itemsEl.innerHTML = cart.map((i) => {
      const max = quedan(i.id);
      const aviso = max <= 0
        ? '<p class="c-stock is-out">Agotada: quítala para poder pagar</p>'
        : i.qty > max ? `<p class="c-stock is-out">Solo quedan ${max}</p>`
        : max <= 3 ? `<p class="c-stock">${max === 1 ? 'Última unidad' : `Quedan ${max}`}</p>` : '';
      return `
      <div class="c-row" data-row="${i.id}">
        <img src="${i.thumb || i.img}" alt="" loading="lazy">
        <div>
          <h4>${i.name}</h4>
          <p class="c-sub">Microfibra · ${precio(find(i.id).price)}</p>
          <div class="stepper">
            <button type="button" data-minus aria-label="Restar una unidad de ${i.name}">−</button>
            <span>${i.qty}</span>
            <button type="button" data-plus aria-label="Añadir una unidad de ${i.name}"${i.qty >= max ? ' disabled' : ''}>+</button>
          </div>
          ${aviso}
        </div>
        <button type="button" class="c-del" aria-label="Quitar ${i.name} del pedido">Quitar</button>
      </div>`;
    }).join('');

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
  }

  const listo = cart.length && STOCK && !sinStock.length;
  payBtn.toggleAttribute('disabled', !listo);
  cartErr.hidden = true;
  if (tiendaCaida && cart.length) showCartError('No pudimos comprobar el stock. Recarga la página en un momento para poder pagar.');

  const n = totalCount();
  const envio = envioElegido();
  countEl.textContent = n;
  sumEl.textContent = n === 1 ? '1 artículo' : `${n} artículos`;
  subEl.textContent = n ? precio(totalPrice()) : '';
  shipEl.textContent = !n ? '' : envio ? precio(envio.precio) : 'Elige el país';
  totalEl.textContent = n ? precio(totalPrice() + (envio ? envio.precio : 0)) : '';
}

paisEl.addEventListener('change', () => {
  pais = paisEl.value;
  try { localStorage.setItem(PAIS_KEY, pais); } catch {}
  renderCart();
});

/* ---------------------------------------------------------
   Stock en la página: tarjetas y botones de "Añadir"
   Cualquier página puede marcar elementos con:
     data-stock-id="<id>"   botón que se apaga si está agotada
     data-stock-for="<id>"  texto con "Agotada" / "Quedan 2"
--------------------------------------------------------- */
function paintStock() {
  if (!STOCK) return;
  $$('[data-stock-id], [data-add]').forEach((btn) => {
    const id = btn.dataset.stockId || btn.dataset.add;
    const out = quedan(id) <= 0;
    btn.disabled = out;
    if (out) btn.textContent = 'Agotada';
  });
  $$('[data-stock-for]').forEach((el) => {
    const n = quedan(el.dataset.stockFor);
    el.textContent = n <= 0 ? 'Agotada' : n <= 3 ? (n === 1 ? '¡Última unidad!' : `¡Quedan ${n}!`) : '';
    el.classList.toggle('is-out', n <= 0);
  });
}

function aplicarTienda(datos) {
  STOCK = datos.stock;
  if (datos.envios) {
    ENVIOS = datos.envios;
    paisEl.innerHTML = '<option value="">Elige el país…</option>' +
      ENVIOS.map((e) => `<option value="${e.codigo}">${e.nombre}</option>`).join('');
    if (!envioElegido()) pais = '';
    paisEl.value = pais;
  }
  renderCart();
  paintStock();
}

fetch('/api/tienda')
  .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
  .then(aplicarTienda)
  .catch(() => { tiendaCaida = true; renderCart(); });

/* ---------------------------------------------------------
   Pago con Stripe
   El servidor (api/checkout.js) pone los precios y vuelve a comprobar
   el stock: acá solo viajan ids, cantidades y el país.
--------------------------------------------------------- */
function showCartError(msg) {
  cartErr.textContent = msg;
  cartErr.hidden = false;
}

payBtn.addEventListener('click', async () => {
  if (!cart.length) return;
  if (!envioElegido()) {
    showCartError('Elige a qué país te lo enviamos.');
    paisEl.focus();
    return;
  }
  const label = payBtn.textContent;
  payBtn.setAttribute('disabled', 'true');
  payBtn.textContent = 'Abriendo el pago…';
  cartErr.hidden = true;

  try {
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pais, items: cart.map(({ id, qty }) => ({ id, qty })) }),
    });
    const data = await res.json().catch(() => ({}));
    if (data.stock) aplicarTienda({ stock: data.stock });
    if (!res.ok || !data.url) throw new Error(data.error || 'No pudimos iniciar el pago. Inténtalo de nuevo.');
    window.location.href = data.url;
  } catch (err) {
    payBtn.textContent = label;
    renderCart();
    showCartError(err.message);
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
  if (!btn || btn.disabled) return;
  const ok = addToCart(btn.dataset.add, 1);
  const label = btn.textContent;
  btn.classList.toggle('done', ok);
  btn.textContent = ok ? 'Añadido' : 'No quedan más';
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

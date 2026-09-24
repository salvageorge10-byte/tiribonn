/* =========================================================
   TIRIBON — página de producto
   Depende de catalogo.js y comun.js.
   El producto se elige por querystring: producto.html?id=rockcat
   ========================================================= */

const prod = find(new URLSearchParams(location.search).get('id') || '');

/* Sin id válido no hay nada que mostrar: lo decimos y ofrecemos la salida. */
if (!prod) {
  $('#pdp').innerHTML = `
    <div class="pdp-404">
      <h1>No encontramos ese diseño</h1>
      <p>Puede que el enlace esté incompleto o que el diseño ya no esté en catálogo.</p>
      <a class="btn-solid" href="index.html#camisetas">Ver toda la colección</a>
    </div>`;
} else {
  const esToalla = prod.type === 'toalla';

  /* ---- cabecera del documento ---- */
  document.title = `${prod.full} — TIRIBON`;
  $('#meta-desc').setAttribute('content', prod.desc);

  /* ---- ruta ---- */
  const cat = $('#crumb-cat');
  cat.textContent = esToalla ? 'Toallas' : 'Camisetas';
  cat.setAttribute('href', esToalla ? 'index.html#toallas' : 'index.html#camisetas');
  $('#crumb-name').textContent = prod.name;

  /* ---- galería ---- */
  const shot = $('#pdp-shot');
  shot.style.setProperty('--w', prod.cw);
  shot.style.setProperty('--x', prod.cx);
  shot.style.setProperty('--t', prod.cy);

  const vistas = esToalla
    ? [{ k: 'worn', label: 'Completa' }, { k: 'art', label: 'Detalle' }]
    : [{ k: 'worn', label: 'Puesta' }, { k: 'art', label: 'El dibujo' }];

  const altDe = (art) =>
    art
      ? `Detalle del dibujo ${prod.name}, de Lucas Baró`
      : `${prod.full} ${prod.color.toLowerCase()}, diseño ${prod.name}`;

  $('#pdp-thumbs').innerHTML = vistas.map((v, i) => `
    <button type="button" class="pdp-thumb${v.k === 'art' ? ' is-art' : ''}${i === 0 ? ' is-on' : ''}"
            data-view="${v.k}" data-label="${v.label}" aria-label="Ver ${v.label.toLowerCase()}"
            style="--w:${prod.cw};--x:${prod.cx};--t:${prod.cy}">
      <span><img src="${imgChico(prod)}" alt="" loading="lazy"></span>
    </button>`).join('');

  /* La imagen la crea el JS: en una página de un solo producto no hay un
     src estático correcto, y dejarlo vacío en el HTML pinta imagen rota. */
  $('#pdp-frame').innerHTML =
    `<img id="pdp-img" src="${imgGrande(prod)}" srcset="${srcsetDe(prod)}"
          sizes="(max-width:980px) 92vw, 46vw"
          alt="${altDe(false)}" fetchpriority="high">`;
  const img = $('#pdp-img');

  function setView(btn) {
    const art = btn.dataset.view === 'art';
    shot.classList.toggle('show-art', art);
    $('#pdp-cap').textContent = btn.dataset.label;
    $$('.pdp-thumb').forEach((b) => b.classList.toggle('is-on', b === btn));
    img.alt = altDe(art);
  }
  $$('.pdp-thumb').forEach((b) => b.addEventListener('click', () => setView(b)));

  $('#pdp-cap').textContent = vistas[0].label;

  /* ---- ficha ---- */
  $('#pdp-kick').textContent = esToalla
    ? 'Toalla de microfibra · Edición Lucas Baró'
    : `Camiseta infantil de algodón orgánico · ${prod.color}`;
  $('#pdp-name').textContent = prod.full;
  $('#pdp-desc').textContent = prod.desc;

  $('#pdp-specs').innerHTML = (esToalla
    ? [
        'Tejido técnico ultra absorbente y de secado rápido',
        'Compacta y ligera: ocupa un espacio mínimo en tu bolsa',
        'Estampación digital de alta definición, colores vibrantes lavado tras lavado',
        'Diseño exclusivo ilustrado por <b>Lucas Baró</b>',
        'El pago y el envío se coordinan por WhatsApp',
      ]
    : [
        '100% algodón orgánico certificado',
        'Suave al tacto, transpirable y resistente',
        'Tintas ecológicas a base de agua, seguras para la piel',
        'Ilustración exclusiva de autor por <b>Lucas Baró</b>, firmada sobre la prenda',
        'Tallas por rango de edad — se confirman por WhatsApp',
      ]
  ).map((li) => `<li>${li}</li>`).join('');

  $('#pdp-care').hidden = esToalla;

  /* ---- precio: las toallas tienen precio fijo; las camisetas aún no se venden ---- */
  $('#pdp-price').textContent = prod.soon ? 'Próximamente' : precio(prod.price);
  $('#pdp-price').classList.toggle('is-price', !prod.soon);
  if (prod.soon) $('.pdp-buy').hidden = true;

  /* ---- cantidad y pedido ---- */
  let qty = 1;
  const qtyEl = $('#pdp-qty');
  $('#pdp-minus').addEventListener('click', () => {
    qty = Math.max(1, qty - 1);
    qtyEl.textContent = qty;
  });
  $('#pdp-plus').addEventListener('click', () => {
    qty = Math.min(20, qty + 1);
    qtyEl.textContent = qty;
  });

  const addBtn = $('#pdp-add');
  addBtn.addEventListener('click', () => {
    addToCart(prod.id, qty);
    addBtn.classList.add('done');
    addBtn.textContent = 'Añadido al pedido';
    setTimeout(() => {
      addBtn.classList.remove('done');
      addBtn.textContent = 'Añadir al pedido';
    }, 1400);
  });

  const wa = $('#pdp-wa');
  wa.setAttribute('href', waLink(prod.soon
    ? `¡Hola! Me interesa la ${prod.full} de TIRIBON. ¿Me avisáis cuando esté disponible?`
    : `¡Hola! Quiero consultar por la ${prod.full} de TIRIBON.`));
  wa.setAttribute('target', '_blank');
  wa.setAttribute('rel', 'noopener');
  if (prod.soon) wa.textContent = 'Avisadme por WhatsApp cuando llegue';

  /* ---- otros diseños de la misma línea ---- */
  const hermanos = ALL.filter((x) => x.type === prod.type && x.id !== prod.id);
  $('#pdp-more').innerHTML = hermanos.map((x) => `
    <a class="mini" href="producto.html?id=${x.id}">
      <span class="mini-img"><img src="${imgChico(x)}" srcset="${srcsetDe(x)}"
        sizes="(max-width:620px) 46vw, 30vw" alt="${x.full}" loading="lazy"></span>
      <span class="mini-name">${x.name}</span>
    </a>`).join('');
  $('#pdp-more-title').textContent = esToalla ? 'Las otras toallas' : 'Los otros diseños';
}

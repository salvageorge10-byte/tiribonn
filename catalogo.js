/* =========================================================
   TIRIBON — catalogo y helpers
   Lo cargan index.html y producto.html.
   ========================================================= */

/* Número de WhatsApp donde llegan los pedidos, en formato internacional
   y sin el "+" (España, +34 618 54 56 69). */
const WHATSAPP_NUMBER = '34618545669';

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
    pos: '50% 6%',
    type: 'camiseta',
    soon: true,
    name: 'Rockcat',
    full: 'Camiseta Rockcat',
    color: 'Rosa',
    img: 'images/rockcat.jpg',
    cw: '214%', cx: '-59.4%', cy: '-111.3%',
    desc: 'Cuatro gatos con cazadora de cuero montando banda. Comodidad absoluta, suavidad natural y pura creatividad para llenar de color sus aventuras diarias.',
  },
  {
    id: 'devil-inside',
    pos: '50% 14%',
    type: 'camiseta',
    soon: true,
    name: 'Devil Inside',
    full: 'Camiseta Devil Inside',
    color: 'Negra',
    img: 'images/devil-inside.jpg',
    cw: '218%', cx: '-65.5%', cy: '-124.7%',
    desc: 'Trazo rojo sobre negro, para quien ya tiene su propia actitud resuelta. Ilustración exclusiva de autor sobre algodón orgánico certificado.',
  },
  {
    id: 'crazy-penguin',
    pos: '50% 12%',
    type: 'camiseta',
    soon: true,
    name: 'Crazy Penguin',
    full: 'Camiseta Crazy Penguin',
    color: 'Amarilla',
    img: 'images/crazy-penguin.jpg',
    cw: '279%', cx: '-97.6%', cy: '-162.8%',
    desc: 'Un pingüino con casco puesto y ninguna intención de quedarse quieto. Suave al tacto, transpirable y pensada para durar lavado tras lavado.',
  },
  {
    id: 'save-the-planet',
    pos: '50% 8%',
    type: 'camiseta',
    soon: true,
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
/* La linea de toallas no calca a la de camisetas: tiene sus propios
   disenos y su propia foto de producto. Devil Inside no existe en toalla. */
const TOWELS = [
  {
    id: 'toalla-rockcat',
    type: 'toalla',
    price: 30,
    name: 'Rockcat',
    full: 'Toalla de Microfibra Rockcat',
    color: 'Edición Lucas Baró',
    cw: '170%', cx: '-35%', cy: '-35%',
    img: 'images/toallas/rockcat.webp',
    desc: 'Los cuatro gatos con cazadora de cuero, en negro sobre un azul de trazos superpuestos. Microfibra ultraligera y de secado rápido, para viaje, playa, piscina y deporte.',
  },
  {
    id: 'toalla-crazy-penguin',
    type: 'toalla',
    price: 30,
    name: 'Crazy Penguin',
    full: 'Toalla de Microfibra Crazy Penguin',
    color: 'Edición Lucas Baró',
    cw: '170%', cx: '-35%', cy: '-35%',
    img: 'images/toallas/crazy-penguin.webp',
    desc: 'El pingüino con casco ampliado hasta ocupar la tela entera, en verde sobre verde. Microfibra ultraligera y de secado rápido, para viaje, playa, piscina y deporte.',
  },
  {
    id: 'toalla-iconos',
    type: 'toalla',
    price: 30,
    name: 'Iconos',
    full: 'Toalla de Microfibra Iconos',
    color: 'Edición Lucas Baró',
    cw: '170%', cx: '-35%', cy: '-35%',
    img: 'images/toallas/iconos.webp',
    desc: 'La grilla de íconos de la marca — el donut, el gato, el vinilo, la banana, el 65 — en naranja y celeste. Microfibra ultraligera y de secado rápido, para viaje, playa, piscina y deporte.',
  },
  {
    id: 'toalla-save-the-planet',
    type: 'toalla',
    price: 30,
    name: 'Save the Planet',
    full: 'Toalla de Microfibra Save the Planet',
    color: 'Edición Lucas Baró',
    cw: '170%', cx: '-35%', cy: '-35%',
    img: 'images/toallas/save-the-planet.webp',
    desc: 'La ballena y las focas en trazo negro sobre blanco, con el lettering girado sobre el lado largo de la toalla. Microfibra ultraligera y de secado rápido, para viaje, playa, piscina y deporte.',
  },
];

/* ---------------------------------------------------------
   Variantes responsive
   Las camisetas viven en images/w/ con sufijo de ancho; las toallas,
   al lado del original. El telefono no tiene por que bajarse un archivo
   de 1000px para pintarlo a 171.
--------------------------------------------------------- */
/* Cada foto tiene al chico a distinta altura: con un encuadre unico
   unas quedan bien y a otras se les corta la cabeza. */
const imgChico = (p) =>
  p.type === 'toalla' ? p.img.replace('.webp', '-400.webp') : `images/w/${p.id}-400.webp`;

const imgGrande = (p) =>
  p.type === 'toalla' ? p.img : `images/w/${p.id}-1000.webp`;

/* Tres escalones. El del medio existe por las pantallas retina: un
   telefono de 390px a 3x pide ~540 reales, y sin 700w saltaba a la
   grande y pagaba el doble. */
const srcsetDe = (p) =>
  p.type === 'toalla'
    ? `${imgChico(p)} 400w, ${p.img.replace('.webp', '-700.webp')} 700w, ${p.img} 1000w`
    : `images/w/${p.id}-400.webp 400w, images/w/${p.id}-700.webp 700w, images/w/${p.id}-1000.webp 1000w`;

const ALL = [...PRODUCTS, ...TOWELS];

/* Toallas: US$30,00 (confirmado por la clienta el 24/09/2026).
   Camisetas: marcadas «soon», se ven pero todavía no se venden.
   El cobro sigue siendo por WhatsApp: no hay enlaces de pago. */
const precio = (n) => `US$${n.toFixed(2)}`;
const find = (id) => ALL.find((x) => x.id === id);


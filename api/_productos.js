/* =========================================================
   TIRIBON — catálogo del lado del servidor
   Es la única fuente de precios que vale para cobrar: el navegador
   solo manda ids y cantidades. Si cambia un precio o se suma un
   producto en catalogo.js, hay que cambiarlo también acá.
   (El "_" del nombre hace que Vercel no lo publique como ruta.)
   El stock no vive acá: está en los productos de Stripe (ver _stock.js).
   ========================================================= */

/* Moneda de cobro en Stripe, en minúsculas. Dólares: se vende en
   México, España y República Dominicana con un mismo precio. */
export const MONEDA = 'usd';

/* Envío según el país, lo paga el cliente. Precio en dólares.
   El orden es el del selector del carrito.
   PENDIENTE DE CONFIRMAR CON LA CLIENTA: los importes son provisorios. */
export const ENVIOS = {
  MX: { nombre: 'México',               precio: 15 },
  ES: { nombre: 'España',               precio: 10 },
  DO: { nombre: 'República Dominicana', precio: 15 },
};

/* Máximo de unidades por producto en un mismo pedido. */
export const MAX_UNIDADES = 20;

/* Precios en la unidad de la moneda (45 = 45,00). */
export const PRODUCTOS = {
  'toalla-rockcat':         { nombre: 'Toalla de Microfibra Rockcat',         precio: 45, img: 'images/toallas/rockcat-700.webp' },
  'toalla-crazy-penguin':   { nombre: 'Toalla de Microfibra Crazy Penguin',   precio: 45, img: 'images/toallas/crazy-penguin-700.webp' },
  'toalla-iconos':          { nombre: 'Toalla de Microfibra Iconos',          precio: 45, img: 'images/toallas/iconos-700.webp' },
  'toalla-save-the-planet': { nombre: 'Toalla de Microfibra Save the Planet', precio: 45, img: 'images/toallas/save-the-planet-700.webp' },
  'toalla-fondo-del-mar':   { nombre: 'Toalla de Microfibra Fondo del Mar',   precio: 49, img: 'images/toallas/fondo-del-mar-700.webp' },
  'toalla-pulpo':           { nombre: 'Toalla de Microfibra Pulpo',           precio: 49, img: 'images/toallas/pulpo-700.webp' },
};

/* =========================================================
   TIRIBON — llamadas a la API de Stripe
   Sin librería: la API de Stripe es HTTP con formularios, y así el
   proyecto sigue sin dependencias ni paso de build.
   La clave va en la variable de entorno STRIPE_SECRET_KEY (Vercel →
   Settings → Environment Variables). Nunca en el código.
   ========================================================= */

import { createHmac, timingSafeEqual } from 'node:crypto';

const API = 'https://api.stripe.com/v1';

/* Stripe recibe objetos anidados como claves con corchetes:
   { line_items: [{ quantity: 2 }] } → line_items[0][quantity]=2 */
function aFormulario(obj, prefijo = '', out = new URLSearchParams()) {
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    const clave = prefijo ? `${prefijo}[${k}]` : k;
    if (typeof v === 'object') aFormulario(v, clave, out);
    else out.append(clave, String(v));
  }
  return out;
}

export async function stripe(ruta, { metodo = 'GET', datos } = {}) {
  const clave = process.env.STRIPE_SECRET_KEY;
  if (!clave) throw new Error('Falta STRIPE_SECRET_KEY en las variables de entorno');

  const res = await fetch(`${API}${ruta}`, {
    method: metodo,
    headers: {
      Authorization: `Bearer ${clave}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: datos ? aFormulario(datos) : undefined,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`Stripe ${res.status}: ${json.error?.message || 'error desconocido'}`);
  return json;
}

/* Comprueba que un aviso (webhook) viene de verdad de Stripe y no de
   alguien que conoce la URL. Cabecera: t=<timestamp>,v1=<firma>,... */
export function firmaValida(cuerpo, cabecera, secreto, toleranciaSeg = 300) {
  if (!cabecera || !secreto) return false;
  let t = null;
  const firmas = [];
  for (const p of cabecera.split(',')) {
    const [k, v] = p.split('=');
    if (k === 't') t = v;
    if (k === 'v1') firmas.push(v);
  }
  if (!t || !firmas.length) return false;
  if (Math.abs(Date.now() / 1000 - Number(t)) > toleranciaSeg) return false;

  const esperada = createHmac('sha256', secreto).update(`${t}.${cuerpo}`).digest('hex');
  const a = Buffer.from(esperada);
  return firmas.some((f) => {
    const b = Buffer.from(f);
    return a.length === b.length && timingSafeEqual(a, b);
  });
}

/* Número de pedido corto y legible a partir del id de la sesión de
   Stripe: siempre el mismo para el mismo pago, sin base de datos. */
export const numeroPedido = (sessionId) =>
  `TRB-${sessionId.slice(-6).toUpperCase()}`;

export const formatoPrecio = (centavos, moneda) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: moneda.toUpperCase() })
    .format(centavos / 100);

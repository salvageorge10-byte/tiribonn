/* =========================================================
   TIRIBON — stock de las toallas
   Vive en los productos de Stripe, en dos "metadatos" de cada uno:
     tiribon_id  el id de catalogo.js (ej: toalla-rockcat)
     stock       unidades disponibles (ej: 5)
   Así la clienta lo ve y lo corrige desde su panel de Stripe
   (Catálogo de productos → la toalla → Metadatos), sin tocar la web.
   Un producto sin cargar en Stripe, o sin número, cuenta como agotado:
   son piezas exclusivas y es mejor no vender que vender de más.
   ========================================================= */

import { stripe } from './_stripe.js';

/* { 'toalla-rockcat': { producto: 'prod_…', stock: 5 }, … } */
export async function leerStock() {
  const out = {};
  let desde;
  do {
    const pagina = await stripe(
      `/products?active=true&limit=100${desde ? `&starting_after=${desde}` : ''}`
    );
    for (const p of pagina.data) {
      const id = p.metadata?.tiribon_id;
      if (!id) continue;
      const n = Number.parseInt(p.metadata.stock, 10);
      out[id] = { producto: p.id, stock: Number.isFinite(n) ? Math.max(0, n) : 0 };
    }
    desde = pagina.has_more ? pagina.data.at(-1).id : null;
  } while (desde);
  return out;
}

/* Resta unidades vendidas. Devuelve el stock que quedó; negativo
   significa que se vendió más de lo que había (dos compras casi a la
   vez por la última unidad) y la tienda tiene que avisar al cliente. */
export async function descontarStock(productoStripe, cantidad) {
  const p = await stripe(`/products/${encodeURIComponent(productoStripe)}`);
  // Nunca tocar productos que no son de TIRIBON (la cuenta es compartida).
  if (!p.metadata?.tiribon_id) return { tiribonId: null, nombre: p.name, quedan: 0 };
  const antes = Number.parseInt(p.metadata?.stock, 10) || 0;
  const despues = antes - cantidad;
  await stripe(`/products/${encodeURIComponent(productoStripe)}`, {
    metodo: 'POST',
    datos: { metadata: { stock: Math.max(0, despues) } },
  });
  return { tiribonId: p.metadata?.tiribon_id, nombre: p.name, quedan: despues };
}

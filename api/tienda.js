/* =========================================================
   GET /api/tienda
   Lo que la web necesita saber al cargar: qué toallas quedan y cuánto
   cuesta el envío a cada país. Se cachea unos segundos para no pedirle
   a Stripe la lista de productos en cada visita.
   ========================================================= */

import { ENVIOS, PRODUCTOS } from './_productos.js';
import { leerStock } from './_stock.js';

export async function GET() {
  try {
    const enStripe = await leerStock();
    const stock = Object.fromEntries(
      Object.keys(PRODUCTOS).map((id) => [id, enStripe[id]?.stock ?? 0])
    );
    const envios = Object.entries(ENVIOS).map(([codigo, e]) => ({ codigo, ...e }));
    return new Response(JSON.stringify({ stock, envios }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=20, stale-while-revalidate=60',
      },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'No se pudo leer el stock' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

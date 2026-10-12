/* =========================================================
   GET /api/pedido?id=<sesión de Stripe>
   Lo pide gracias.html para mostrar el resumen de la compra.
   El id de sesión es largo y aleatorio: solo lo conoce quien pagó.
   ========================================================= */

import { leerPedido } from './_pedido.js';

const responder = (estado, cuerpo) =>
  new Response(JSON.stringify(cuerpo), {
    status: estado,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

export async function GET(request) {
  const id = new URL(request.url).searchParams.get('id') || '';
  if (!/^cs_(test|live)_[A-Za-z0-9]+$/.test(id)) {
    return responder(400, { error: 'Número de pedido no válido' });
  }

  try {
    const pedido = await leerPedido(id);
    if (!pedido.pagado) return responder(402, { error: 'El pago todavía no se ha completado' });
    return responder(200, pedido);
  } catch (err) {
    console.error(err);
    return responder(404, { error: 'No encontramos ese pedido' });
  }
}

/* =========================================================
   POST /api/stripe-webhook
   Stripe llama acá cuando se completa un pago, aunque el cliente
   cierre la pestaña antes de volver a la web. Es lo que dispara los
   emails. Se configura en Stripe → Desarrolladores → Webhooks, con el
   evento checkout.session.completed; el "secreto de firma" que da
   Stripe va en la variable de entorno STRIPE_WEBHOOK_SECRET.
   ========================================================= */

import { firmaValida } from './_stripe.js';
import { leerPedido } from './_pedido.js';
import { avisarPedido } from './_email.js';

export async function POST(request) {
  // La firma se calcula sobre el texto exacto: leerlo antes de parsear.
  const cuerpo = await request.text();
  const firma = request.headers.get('stripe-signature');

  if (!firmaValida(cuerpo, firma, process.env.STRIPE_WEBHOOK_SECRET)) {
    return new Response('Firma no válida', { status: 400 });
  }

  const evento = JSON.parse(cuerpo);
  if (evento.type !== 'checkout.session.completed') {
    return new Response('Ignorado', { status: 200 });
  }

  try {
    const pedido = await leerPedido(evento.data.object.id);
    if (pedido.pagado) await avisarPedido(pedido);
  } catch (err) {
    // 500 hace que Stripe reintente más tarde.
    console.error(err);
    return new Response('Error procesando el pedido', { status: 500 });
  }
  return new Response('OK', { status: 200 });
}

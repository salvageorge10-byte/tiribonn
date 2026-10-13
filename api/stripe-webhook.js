/* =========================================================
   POST /api/stripe-webhook
   Stripe llama acá cuando se completa un pago, aunque el cliente
   cierre la pestaña antes de volver a la web. Descuenta el stock y
   manda los emails. Se configura en Stripe → Desarrolladores →
   Webhooks, con el evento checkout.session.completed; el "secreto de
   firma" que da Stripe va en la variable STRIPE_WEBHOOK_SECRET.
   Stripe puede mandar el mismo aviso más de una vez: cada paso deja
   una marca en el pedido y no se repite.
   ========================================================= */

import { firmaValida } from './_stripe.js';
import { leerPedido, marcarPedido } from './_pedido.js';
import { descontarStock } from './_stock.js';
import { avisarPedido } from './_email.js';

export async function POST(request) {
  // La firma se calcula sobre el texto exacto: leerlo antes de parsear.
  const cuerpo = await request.text();
  const firma = request.headers.get('stripe-signature');

  if (!firmaValida(cuerpo, firma, process.env.STRIPE_WEBHOOK_SECRET)) {
    return new Response('Firma no válida', { status: 400 });
  }

  const evento = JSON.parse(cuerpo);
  // La cuenta de Stripe es compartida con otras webs de la clienta:
  // solo interesan los pagos que creó api/checkout.js.
  if (evento.type !== 'checkout.session.completed' || evento.data.object.metadata?.tienda !== 'tiribon') {
    return new Response('Ignorado', { status: 200 });
  }

  try {
    const pedido = await leerPedido(evento.data.object.id);
    if (!pedido.pagado) return new Response('Sin pagar', { status: 200 });

    let sobreventa = [];
    if (!pedido.marcas.stock_descontado) {
      const resultados = await Promise.all(
        pedido.items.filter((i) => i.producto).map((i) => descontarStock(i.producto, i.cantidad))
      );
      sobreventa = resultados.filter((r) => r.quedan < 0);
      await marcarPedido(pedido.id, 'stock_descontado');
    }

    if (!pedido.marcas.emails_enviados) {
      if (await avisarPedido(pedido, sobreventa)) await marcarPedido(pedido.id, 'emails_enviados');
    }
  } catch (err) {
    // 500 hace que Stripe reintente más tarde.
    console.error(err);
    return new Response('Error procesando el pedido', { status: 500 });
  }
  return new Response('OK', { status: 200 });
}

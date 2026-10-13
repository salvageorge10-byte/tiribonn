/* =========================================================
   TIRIBON — resumen de un pedido a partir de la sesión de Stripe
   Los pedidos no se guardan en ninguna base: viven en Stripe y se
   leen de ahí cuando hacen falta (página de gracias, email, stock).
   ========================================================= */

import { stripe, numeroPedido, formatoPrecio } from './_stripe.js';

export async function leerPedido(sessionId) {
  const s = await stripe(
    `/checkout/sessions/${encodeURIComponent(sessionId)}?expand[]=line_items`
  );

  const cliente = s.customer_details || {};
  // Stripe movió la dirección de envío de sitio entre versiones de la API.
  const envio = s.collected_information?.shipping_details || s.shipping_details || {};
  const dir = envio.address || cliente.address || {};
  const costoEnvio = s.shipping_cost?.amount_total ?? 0;

  return {
    id: s.id,
    pagado: s.payment_status === 'paid',
    marcas: s.metadata || {},
    numero: numeroPedido(s.id),
    nombre: envio.name || cliente.name || '',
    email: cliente.email || '',
    telefono: cliente.phone || '',
    direccion: [dir.line1, dir.line2, [dir.postal_code, dir.city].filter(Boolean).join(' '), dir.state, dir.country]
      .filter(Boolean)
      .join(', '),
    items: (s.line_items?.data || []).map((l) => ({
      nombre: l.description,
      cantidad: l.quantity,
      importe: formatoPrecio(l.amount_total, s.currency),
      producto: l.price?.product,
    })),
    envio: costoEnvio ? formatoPrecio(costoEnvio, s.currency) : 'Gratis',
    total: formatoPrecio(s.amount_total, s.currency),
  };
}

/* Marca el pedido para no repetir un paso si Stripe reenvía el aviso. */
export const marcarPedido = (sessionId, marca) =>
  stripe(`/checkout/sessions/${encodeURIComponent(sessionId)}`, {
    metodo: 'POST',
    datos: { metadata: { [marca]: '1' } },
  });

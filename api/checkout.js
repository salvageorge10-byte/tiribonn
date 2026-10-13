/* =========================================================
   POST /api/checkout
   Recibe el carrito ({ items: [{ id, qty }], pais: 'MX' }), comprueba
   el stock, arma el cobro con los precios del servidor más el envío
   de ese país y devuelve la URL de la página de pago de Stripe.
   Stripe le pide al cliente email, nombre, teléfono y dirección.
   ========================================================= */

import { PRODUCTOS, MONEDA, ENVIOS, MAX_UNIDADES } from './_productos.js';
import { stripe } from './_stripe.js';
import { leerStock } from './_stock.js';

const responder = (estado, cuerpo) =>
  new Response(JSON.stringify(cuerpo), {
    status: estado,
    headers: { 'Content-Type': 'application/json' },
  });

const centavos = (n) => Math.round(n * 100);

export async function POST(request) {
  let items, pais;
  try {
    ({ items, pais } = await request.json());
  } catch {
    return responder(400, { error: 'Pedido mal formado' });
  }

  if (!Array.isArray(items) || !items.length) {
    return responder(400, { error: 'El pedido está vacío' });
  }
  const envio = ENVIOS[pais];
  if (!envio) {
    return responder(400, { error: 'Elige el país de envío' });
  }

  try {
    const stock = await leerStock();
    const origen = new URL(request.url).origin;
    const lineas = [];

    for (const { id, qty } of items) {
      const p = PRODUCTOS[id];
      const cantidad = Number(qty);
      if (!p || !Number.isInteger(cantidad) || cantidad < 1 || cantidad > MAX_UNIDADES) {
        return responder(400, { error: 'Hay un producto que ya no está disponible. Revisa tu pedido.' });
      }
      const hay = stock[id]?.stock ?? 0;
      if (cantidad > hay) {
        return responder(409, {
          error: hay
            ? `De ${p.nombre} solo quedan ${hay}. Ajusta la cantidad en tu pedido.`
            : `${p.nombre} se ha agotado. Quítala de tu pedido para continuar.`,
          stock: Object.fromEntries(Object.entries(stock).map(([k, v]) => [k, v.stock])),
        });
      }
      lineas.push({
        quantity: cantidad,
        price_data: {
          currency: MONEDA,
          unit_amount: centavos(p.precio),
          product: stock[id].producto,
        },
      });
    }

    const sesion = await stripe('/checkout/sessions', {
      metodo: 'POST',
      datos: {
        mode: 'payment',
        locale: 'es',
        line_items: lineas,
        shipping_address_collection: { allowed_countries: [pais] },
        shipping_options: [{
          shipping_rate_data: {
            type: 'fixed_amount',
            display_name: `Envío a ${envio.nombre}`,
            fixed_amount: { amount: centavos(envio.precio), currency: MONEDA },
          },
        }],
        phone_number_collection: { enabled: true },
        // Media hora para pagar: acota el tiempo en que dos personas
        // pueden estar pagando la misma última unidad.
        expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
        success_url: `${origen}/gracias.html?pedido={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origen}/?pago=cancelado`,
      },
    });
    return responder(200, { url: sesion.url });
  } catch (err) {
    console.error(err);
    // Solo en las versiones de prueba: el motivo real ayuda a configurar.
    const detalle = process.env.VERCEL_ENV === 'production' ? '' : ` (${err.message})`;
    return responder(502, { error: `No pudimos iniciar el pago. Inténtalo de nuevo en unos minutos.${detalle}` });
  }
}

/* =========================================================
   POST /api/checkout
   Recibe el carrito ({ items: [{ id, qty }] }), arma el cobro con los
   precios del servidor y devuelve la URL de la página de pago de Stripe.
   Stripe le pide al cliente email, nombre, teléfono y dirección.
   ========================================================= */

import { PRODUCTOS, MONEDA, PAISES_ENVIO, MAX_UNIDADES } from './_productos.js';
import { stripe } from './_stripe.js';

const responder = (estado, cuerpo) =>
  new Response(JSON.stringify(cuerpo), {
    status: estado,
    headers: { 'Content-Type': 'application/json' },
  });

export async function POST(request) {
  let items;
  try {
    ({ items } = await request.json());
  } catch {
    return responder(400, { error: 'Pedido mal formado' });
  }

  if (!Array.isArray(items) || !items.length) {
    return responder(400, { error: 'El pedido está vacío' });
  }

  const origen = new URL(request.url).origin;
  const lineas = [];
  for (const { id, qty } of items) {
    const p = PRODUCTOS[id];
    const cantidad = Number(qty);
    if (!p || !Number.isInteger(cantidad) || cantidad < 1 || cantidad > MAX_UNIDADES) {
      return responder(400, { error: 'Hay un producto que ya no está disponible. Revisa tu pedido.' });
    }
    lineas.push({
      quantity: cantidad,
      price_data: {
        currency: MONEDA,
        unit_amount: Math.round(p.precio * 100),
        product_data: { name: p.nombre, images: [`${origen}/${p.img}`], metadata: { id } },
      },
    });
  }

  try {
    const sesion = await stripe('/checkout/sessions', {
      metodo: 'POST',
      datos: {
        mode: 'payment',
        locale: 'es',
        line_items: lineas,
        shipping_address_collection: { allowed_countries: PAISES_ENVIO },
        phone_number_collection: { enabled: true },
        success_url: `${origen}/gracias.html?pedido={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origen}/?pago=cancelado`,
      },
    });
    return responder(200, { url: sesion.url });
  } catch (err) {
    console.error(err);
    return responder(502, { error: 'No pudimos iniciar el pago. Inténtalo de nuevo en unos minutos.' });
  }
}

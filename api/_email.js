/* =========================================================
   TIRIBON — emails de pedido (vía Resend, https://resend.com)
   Variables de entorno:
     RESEND_API_KEY  clave de Resend
     EMAIL_DESDE     remitente, ej: TIRIBON <pedidos@tiribon.online>
                     (el dominio tiene que estar verificado en Resend)
     EMAIL_TIENDA    a dónde llega el aviso de venta y las respuestas
   Sin RESEND_API_KEY no se manda nada y el resto sigue funcionando.
   ========================================================= */

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const tabla = (p) => `
  <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;font-size:15px">
    ${p.items.map((i) => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #eee">${i.cantidad} × ${esc(i.nombre)}</td>
        <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;white-space:nowrap">${esc(i.importe)}</td>
      </tr>`).join('')}
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #eee">Envío</td>
      <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;white-space:nowrap">${esc(p.envio)}</td>
    </tr>
    <tr>
      <td style="padding:12px 0 0;font-weight:700">Total</td>
      <td style="padding:12px 0 0;font-weight:700;text-align:right">${esc(p.total)}</td>
    </tr>
  </table>`;

const marco = (contenido) => `
  <div style="background:#FFF7EA;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;color:#14120F">
    <div style="max-width:520px;margin:0 auto;background:#fff;border:3px solid #14120F;border-radius:8px;padding:28px">
      <p style="margin:0 0 20px;font-size:22px;font-weight:800;letter-spacing:.04em">TIRIBON</p>
      ${contenido}
    </div>
  </div>`;

function emailCliente(p) {
  const nombre = p.nombre.split(' ')[0];
  return {
    asunto: `Tu pedido ${p.numero} está confirmado`,
    html: marco(`
      <h1 style="margin:0 0 12px;font-size:22px">¡Gracias${nombre ? `, ${esc(nombre)}` : ''}! Hemos recibido tu pedido.</h1>
      <p style="margin:0 0 20px;font-size:15px;line-height:1.5">
        Número de pedido: <b>${esc(p.numero)}</b><br>
        Ya estamos preparándolo. Te escribiremos cuando salga el paquete.
      </p>
      ${tabla(p)}
      <p style="margin:24px 0 0;font-size:15px;line-height:1.5">
        <b>Lo enviamos a:</b><br>${esc(p.nombre)}<br>${esc(p.direccion)}
      </p>
      <p style="margin:24px 0 0;font-size:13px;color:#666;line-height:1.5">
        ¿Alguna duda? Responde a este email o escríbenos por WhatsApp indicando tu número de pedido.
      </p>`),
  };
}

function emailTienda(p, sobreventa) {
  const alerta = sobreventa.length ? `
      <p style="margin:0 0 20px;padding:12px 14px;background:#FDE2EE;border-radius:6px;font-size:15px;line-height:1.5">
        <b>Atención: se vendió más de lo que había.</b> Dos personas compraron casi a la vez la última unidad de
        ${sobreventa.map((s) => `<b>${esc(s.nombre)}</b> (faltan ${-s.quedan})`).join(', ')}.
        Escríbele al cliente y, si no puedes reponerla, devuélvele el dinero desde Stripe (Pagos → este pago → Reembolsar).
      </p>` : '';
  return {
    asunto: `${sobreventa.length ? '⚠️ ' : ''}Nueva venta ${p.numero} — ${p.total}`,
    html: marco(`
      <h1 style="margin:0 0 16px;font-size:20px">Nueva venta: ${esc(p.numero)}</h1>
      ${alerta}
      ${tabla(p)}
      <p style="margin:24px 0 0;font-size:15px;line-height:1.6">
        <b>Cliente:</b> ${esc(p.nombre)}<br>
        <b>Email:</b> ${esc(p.email)}<br>
        <b>Teléfono:</b> ${esc(p.telefono)}<br>
        <b>Enviar a:</b> ${esc(p.direccion)}
      </p>`),
  };
}

async function enviar({ para, responderA, asunto, html }) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.EMAIL_DESDE || 'TIRIBON <onboarding@resend.dev>',
      to: [para],
      reply_to: responderA,
      subject: asunto,
      html,
    }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
}

/* Devuelve false si no se mandó nada porque Resend no está configurado. */
export async function avisarPedido(p, sobreventa = []) {
  if (!process.env.RESEND_API_KEY) {
    console.warn(`Sin RESEND_API_KEY: no se mandan emails del pedido ${p.numero}`);
    return false;
  }
  const tienda = process.env.EMAIL_TIENDA;
  const envios = [];
  if (p.email) envios.push(enviar({ para: p.email, responderA: tienda, ...emailCliente(p) }));
  if (tienda) envios.push(enviar({ para: tienda, responderA: p.email, ...emailTienda(p, sobreventa) }));
  await Promise.all(envios);
  return true;
}

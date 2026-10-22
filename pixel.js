/* =========================================================
   TIRIBON — Píxel de Meta (conjunto de datos «Datos Tiribon»)
   Mientras META_PIXEL_ID esté vacío no se carga nada.
   El ID está en el Administrador de eventos de Meta → Orígenes
   de datos → Datos Tiribon (un número de 15-16 cifras).
   ========================================================= */

const META_PIXEL_ID = '1469400411701086';

if (META_PIXEL_ID) {
  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
  n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
  document,'script','https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', META_PIXEL_ID);
  fbq('track', 'PageView');
}

/* Evento estándar de Meta; no hace nada si el píxel no está cargado. */
function px(evento, datos, opciones) {
  if (typeof fbq === 'function') fbq('track', evento, datos, opciones);
}

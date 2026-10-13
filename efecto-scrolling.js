// efecto-scrolling — efectos de El Muelle (elmuellee.vercel.app)
// Se carga al final del <body> (o con defer). No depende de ninguna librería.
document.documentElement.classList.add('js');

const esReducido = matchMedia('(prefers-reduced-motion: reduce)').matches;
const esMobile = matchMedia('(max-width: 767px)').matches;

// 1. Entradas al aparecer: cada elemento con data-anim entra una sola vez al llegar a pantalla.
//    data-anim-mobile permite otra entrada en celular (en El Muelle, todo entra desde abajo).
const esObservador = new IntersectionObserver((entradas) => {
  entradas.forEach(({ isIntersecting, target }) => {
    if (!isIntersecting) return;
    target.classList.remove('invisible');
    target.classList.add('animado', target.dataset.animActiva);
    esObservador.unobserve(target);
  });
});

// data-anim="auto": la dirección sale de dónde cae el bloque dentro de su contenedor
// (tercio izquierdo → izquierda, tercio derecho → derecha, centro → abajo).
// Sirve para grillas que cambian de cantidad de columnas según el ancho.
const esDireccionAuto = (el) => {
  const caja = el.getBoundingClientRect();
  const padre = el.parentElement.getBoundingClientRect();
  const centro = (caja.left + caja.width / 2 - padre.left) / padre.width;
  if (caja.width > padre.width * 0.8) return 'fadeInUp';
  return centro < 0.34 ? 'fadeInLeft' : centro > 0.66 ? 'fadeInRight' : 'fadeInUp';
};

document.querySelectorAll('[data-anim]').forEach((el) => {
  let nombre = esMobile ? (el.dataset.animMobile ?? el.dataset.anim) : el.dataset.anim;
  if (nombre === 'auto') nombre = esMobile ? 'fadeInUp' : esDireccionAuto(el);
  if (esReducido || nombre === 'none') return;
  el.dataset.animActiva = nombre;
  el.classList.add('invisible');
  esObservador.observe(el);
});

// 2. Tira de fotos continua: se duplican las fotos para que el recorrido no tenga corte.
document.querySelectorAll('.es-tira__pista').forEach((pista) => {
  const fotos = [...pista.children];
  pista.style.setProperty('--cantidad', fotos.length);
  fotos.forEach((foto) => {
    const copia = foto.cloneNode(true);
    if (copia.tagName === 'IMG') copia.alt = '';
    copia.setAttribute('aria-hidden', 'true');
    pista.append(copia);
  });
});

// 6. Botón "volver arriba": aparece después de bajar 300 px.
const esArriba = document.querySelector('.es-arriba');
if (esArriba) {
  const alScrollear = () => esArriba.classList.toggle('visible', scrollY > 300);
  addEventListener('scroll', alScrollear, { passive: true });
  alScrollear();
}

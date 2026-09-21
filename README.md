# TIRIBON

Sitio web de TIRIBON: toallas de microfibra de alto rendimiento y camisetas
infantiles de algodón orgánico, ilustradas en exclusiva por el artista
**Lucas Baró**.

Web estática, sin build ni dependencias.

## Cómo levantarlo

```bash
python -m http.server 5501
```

Y abrir http://localhost:5501

## Estructura

| Archivo | Qué es |
|---|---|
| `index.html` | Portada: hero, toallas, camisetas, el arte, nosotros, cómo comprar |
| `producto.html` | Página de producto. El producto se elige por querystring: `producto.html?id=rockcat` |
| `style.css` | Estilos de las dos páginas |
| `catalogo.js` | Datos y helpers (`PRODUCTS`, `TOWELS`, `ALL`, `find`, `waLink`). Lo cargan ambas |
| `comun.js` | Header, menú móvil y carrito. Lo cargan ambas |
| `script.js` | Solo portada: grillas, plancha de diseños, FAQ, buscador |
| `producto.js` | Solo página de producto: galería, ficha y otros diseños |
| `images/` | Fotos originales de las camisetas (JPG). Son los **masters**: no se sirven, se usan para regenerar variantes |
| `images/w/` | Variantes servidas de las camisetas: `<id>-400/700/1000.webp` |
| `images/toallas/` | Toallas en WebP: `<id>-400/-700.webp` y `<id>.webp` (1000) |
| `public/tiribon-logo.png` | Logo de marca del header |
| `assets/` | Dibujos de marca en SVG |

**El orden de los `<script>` importa**: `catalogo.js` → `comun.js` → la página.
`comun.js` engancha el botón «Añadir» por delegación en `document`, así que no
le molesta que la grilla se dibuje después.

## Funcionalidad

- Catálogo de 4 camisetas y 4 toallas
- Ficha de producto que cambia según el tipo (prenda o toalla)
- Cada producto tiene **su propia página con URL propia** (`producto.html?id=…`),
  no un modal encima de la grilla: el botón atrás funciona y el enlace se puede
  compartir. La portada enlaza con `<a>` de verdad, así que abrir en pestaña
  nueva también funciona
- Galería de producto con tira de miniaturas al costado (debajo de
  la foto en móvil). Dos vistas por producto: en camiseta «Puesta» / «El
  dibujo», en toalla «Completa» / «Detalle». Hay **una sola foto por producto**:
  la segunda vista es ese mismo archivo recortado sobre el estampado con las
  coordenadas `cw/cx/cy`, las mismas que usa la plancha de diseños
- En la grilla, la tarjeta de camiseta cambia al estampado al pasar el mouse o
  al recibir foco de teclado
- Carrito con persistencia en `localStorage`
- El pedido se cierra por WhatsApp: no hay cobro desde la web
- Buscador que filtra los diseños en vivo
- Responsive verificado a 1440px y 390px
- Contraste WCAG AA verificado en todo el texto

## Si algún día hay más fotos por producto

La galería ya está armada para eso: `viewsFor(p)` en `script.js` devuelve la
lista de vistas. Hoy devuelve dos (la foto y su recorte). Si el cliente entrega
fotos de espalda, detalle de costura o la prenda doblada, se agregan ahí con su
propio `img` y la tira de miniaturas las toma sola.

## Pendientes

1. **Número de WhatsApp.** Está vacío en `script.js`. Mientras no esté, los
   botones abren WhatsApp sin destinatario y hay que elegir el contacto a mano.

   ```js
   const WHATSAPP_NUMBER = ''; // formato internacional sin "+", ej: 34600111222
   ```

2. **Foto del hero.** El hero usa `images/rockcat.jpg` de forma provisional: es
   un retrato de camiseta, no la naturaleza muerta de producto que pide la
   composición, y su fondo gris de estudio pelea con el crema de la sección. El
   prompt de la definitiva está en `toallas-prompts.md` (apartado 5) y su
   destino es `images/hero.jpg`.

   **Ojo al cambiarla:** el encuadre actual está calibrado para una foto
   *vertical* sin aire sobre la cabeza. Por eso `.hero-vis` tiene
   `min-height:clamp(330px,50vw,720px)` y la imagen va con
   `object-position:50% 0%` (anclada arriba, el sobrante se recorta abajo).
   Cuando entre la definitiva, que es horizontal 4:3, ese alto se puede bajar y
   el `object-position` volver a centro.

3. **Nombre real del diseño de íconos.** La cuarta toalla entró como `Iconos`,
   que es descriptivo, no el nombre comercial. Si la marca lo llama de otra
   forma, se cambia en el bloque `TOWELS` de `script.js` (`name` y `full`).

4. **El buscador vive solo en la portada.** La página de producto no lleva el
   icono de lupa porque el buscador filtra la grilla, que está en `index.html`.
   Si se quiere search global, hay que hacer que el icono navegue a la portada
   con el término ya aplicado.

5. **`styles.css`** es un archivo muerto de una versión anterior. No lo usa
   nadie; se puede borrar.

## Imágenes responsive

Ninguna imagen se sirve a tamaño completo. `catalogo.js` expone `imgChico`,
`imgGrande` y `srcsetDe`, y cada plantilla pasa su propio `sizes`.

**Tres escalones: 400 / 700 / 1000.** El del medio no es decorativo: un teléfono
de 390px con densidad 3x necesita ~540px reales, y sin el 700w saltaba
directamente al grande y pagaba el doble. La calidad baja a medida que sube el
tamaño (80 / 74 / 70), porque a esa densidad la compresión no se ve.

Resultado en un teléfono retina: **~330 KB** contra los ~1,2 MB que bajaba antes.

Dos detalles que hay que respetar al tocar esto:

- **La plancha de diseños amplía al 214%**, así que su `sizes` pide casi el
  doble del ancho del contenedor (`98vw` en móvil). Si se le pone el `sizes`
  normal, se ve borrosa.
- **La capa `.prod-zoom`** (el estampado que asoma al pasar el mouse) está en
  `display:none` salvo en `@media (hover:hover)`. Combinado con `loading=lazy`,
  eso evita que un teléfono descargue cuatro imágenes que nunca va a mostrar.

## Decisiones de móvil

- **La grilla de camisetas va a dos columnas**, no a una. A una columna la
  sección medía 2575px —casi un tercio de la página— y el recorte cuadrado
  cortaba las cabezas. La página entera pasó de 9,8 a 8,1 pantallas.
- **`align-items:stretch` en móvil.** En escritorio la grilla usa
  `align-items:start` a propósito, para el escalonado de las tarjetas. En dos
  columnas sin escalonado eso las dejaba desparejas.
- **En la tarjeta chica queda solo el color.** «Algodón orgánico» se repite en
  las cuatro: no distingue nada en una grilla y además parte el chip en dos
  líneas. Sigue estando en la ficha y en la entradilla de la sección.
- **Cada foto tiene su propio encuadre** (`pos` en `PRODUCTS`). Con un
  `object-position` único unas quedaban bien y a otras se les cortaba la cabeza,
  porque cada chico está a distinta altura en su toma.

## Sobre la línea de toallas

Las toallas **no** son un espejo de las camisetas. Son cuatro productos con su
propio catálogo en el array `TOWELS` de `script.js` y su propia foto en
`images/toallas/*.webp`:

| Toalla | Foto |
|---|---|
| Rockcat | `images/toallas/rockcat.webp` |
| Crazy Penguin | `images/toallas/crazy-penguin.webp` |
| Iconos | `images/toallas/iconos.webp` |
| Save the Planet | `images/toallas/save-the-planet.webp` |

**No hay toalla de Devil Inside**: ese diseño existe solo en camiseta. Y la
grilla de íconos existe solo en toalla, no en camiseta.

Las fotos son cuadradas de 1000px sobre fondo crema, servidas en WebP (390 KB
las cuatro, contra 8,7 MB de los PNG originales). Si se reemplaza alguna,
mantener el formato cuadrado y el fondo crema para que el set siga leyéndose
como una misma producción.

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
| `index.html` | Toda la página (una sola vista con anclas) |
| `style.css` | Estilos completos |
| `script.js` | Catálogo, carrito, fichas, buscador y FAQ |
| `images/` | Fotos reales de producto (4 camisetas) |
| `public/tiribon-logo.png` | Logo de marca usado en el header |
| `assets/` | Dibujos de marca en SVG |

## Funcionalidad

- Catálogo de 4 camisetas y 4 toallas
- Ficha de producto que cambia según el tipo (prenda o toalla)
- Carrito con persistencia en `localStorage`
- El pedido se cierra por WhatsApp: no hay cobro desde la web
- Buscador que filtra los diseños en vivo
- Responsive verificado a 1440px y 390px
- Contraste WCAG AA verificado en todo el texto

## Pendientes

1. **Número de WhatsApp.** Está vacío en `script.js`. Mientras no esté, los
   botones abren WhatsApp sin destinatario y hay que elegir el contacto a mano.

   ```js
   const WHATSAPP_NUMBER = ''; // formato internacional sin "+", ej: 34600111222
   ```

2. **Fotos de producto de las toallas.** No existen todavía. Cada tarjeta de
   toalla muestra el *diseño*, no la toalla, y lo indica de forma explícita.

3. **Confirmar los diseños de la línea de toallas.** Hoy se asume que llevan los
   mismos cuatro de las camisetas. Si son otros, se cambian en `script.js`
   (bloque `TOWELS`, marcado con `PENDIENTE DE VALIDAR`).

4. **`styles.css`** es un archivo muerto de una versión anterior. No lo usa
   nadie; se puede borrar.

# Mockups de toallas — prompts de generación

Cuatro fotografías de producto, una por diseño. Pensadas para generarse con un
modelo **imagen-a-imagen**, adjuntando siempre los archivos de referencia: así
el diseño y el logo se copian, no se reinventan.

## Archivos de referencia a adjuntar en cada generación

Los cuatro diseños ya están recortados y limpios en `toallas-referencias/`.
Se adjuntan tal cual, sin volver a recortar:

| Rol | Archivo |
|---|---|
| Diseño a aplicar | `toallas-referencias/<diseño>.png` |
| Logo de marca | `public/tiribon-logo.png` |

**Logo TIRIBON** — wordmark en minúscula redondeada: `tiri` en azul `#3877BE`,
`bon` en turquesa `#51B7C3`, tiburón azul sonriente a la derecha. Fondo crema
`#FDFBF6`. No se redibuja ni se recolorea: se usa el archivo tal cual.

## Dirección de arte común a las cuatro

Para que las cuatro se lean como una misma producción:

- Luz natural de mediodía de verano, cálida, sombras suaves y definidas.
- Fondo: arena clara y hormigón encalado, siempre desenfocado. Nada de gente.
- Cámara a 45° sobre el producto, lente 50 mm, profundidad de campo media.
- Paleta de apoyo: crema, arena, azul mar. Ningún color que compita con el diseño.
- La toalla ocupa ~70% del encuadre. El producto es el protagonista.
- Textura de microfibra visible: trama fina, pelo corto, caída ligera.
- Formato 4:5 vertical, calidad de catálogo de tienda online.

Regla dura en los cuatro prompts: **el estampado se reproduce exactamente como
en la referencia** — mismo trazo, mismas proporciones, mismo lettering, misma
firma «Lucas Baró». No se recorta, no se reencuadra, no se combina con otro.

---

## 1 · Rockcat

> Fotografía de producto de una toalla de microfibra extendida sobre arena clara
> de playa, vista en ángulo de 45°. Sobre la toalla, impreso en alta definición,
> el diseño de referencia: cuatro gatos con cazadora de cuero de pie formando una
> banda de rock, trazo negro a mano alzada, con el lettering «ROCKCAT» y la firma
> «Lucas Baró». Toalla en rosa chicle, el mismo rosa de la camiseta de referencia.
> El logo tiribon aparece bordado en pequeño en una esquina inferior de la toalla,
> tal como está en el archivo de logo. Luz natural de verano, sombras suaves,
> fondo desenfocado. Calidad de catálogo, 4:5 vertical.

## 2 · Crazy Penguin

> Fotografía de producto de una toalla de microfibra doblada en un rectángulo
> limpio, apoyada sobre un banco de madera clara junto a una piscina. Sobre la
> cara visible, impreso en alta definición, el diseño de referencia: un pingüino
> con casco y antiparras volando en horizontal, trazo negro a mano alzada con
> textura moteada, con el lettering «CRAZY PENGUIN» debajo. Toalla en amarillo
> pastel, el mismo amarillo de la camiseta de referencia. El logo tiribon aparece
> en una etiqueta tejida cosida en el borde. Luz natural de verano, sombras
> suaves, fondo desenfocado. Calidad de catálogo, 4:5 vertical.

## 3 · Devil Inside

> Fotografía de producto de una toalla de microfibra colgada de una cuerda tensa,
> cayendo recta con una ondulación suave, vista de frente. Sobre la tela, impreso
> en alta definición, el diseño de referencia: una cabeza de diablo sonriente con
> cuernos en rojo intenso sobre negro, trazo grueso a mano alzada, con el
> lettering «DEVIL INSIDE» en rojo y la firma «Lucas Baró». Toalla en negro
> profundo. El logo tiribon aparece impreso en pequeño en el borde inferior.
> Luz natural de verano, cielo y mar desenfocados detrás. Calidad de catálogo,
> 4:5 vertical.

## 4 · Save the Planet

> Fotografía de producto de una toalla de microfibra extendida sobre una tumbona
> de playa, con una esquina cayendo por el borde, vista en ángulo de 45°. Sobre
> la toalla, impreso en alta definición, el diseño de referencia: una ballena
> tumbada rodeada de focas y aves marinas, trazo negro a mano alzada, con el
> lettering «SAVE THE PLANET» debajo. Toalla en blanco roto. El logo tiribon
> aparece bordado en tono azul en una esquina. Luz natural de verano, arena y
> vegetación costera desenfocadas. Calidad de catálogo, 4:5 vertical.

---

---

## 5 · Foto del hero

La cabecera nueva pide una naturaleza muerta de producto, no un retrato. Misma
dirección de arte que las cuatro anteriores, pero en **horizontal** y con aire
a la izquierda, porque sobre esa zona no va nada y el encuadre respira.

> Fotografía de producto en una cala mediterránea: un saliente de piedra caliza
> con el mar turquesa desenfocado al fondo. Sobre la piedra, una camiseta blanca
> de niño doblada en un cuadrado limpio con el diseño de referencia «Rockcat»
> impreso y visible en la cara de arriba. Detrás, apoyada sobre una silla de
> mimbre, una toalla de microfibra colgando con el diseño de referencia «Save
> the Planet» impreso en alta definición y el logo tiribon abajo. Ramas de olivo
> entrando por la esquina superior derecha y dos limones sobre la piedra a la
> derecha. Luz natural de mediodía de verano, sombras suaves. Formato horizontal
> 4:3, calidad de catálogo.

Si preferís otro par de diseños, se cambian los dos nombres del prompt y se
adjuntan los PNG que correspondan. El archivo final va a `images/hero.jpg`.

## Al recibir las imágenes

Dejarlas en `images/toallas/` con estos nombres exactos:

```
images/toallas/rockcat.jpg
images/toallas/crazy-penguin.jpg
images/toallas/devil-inside.jpg
images/toallas/save-the-planet.jpg
images/hero.jpg
```

Después se optimizan (WebP + JPG de respaldo, ~1200px de ancho) y se cambia el
bloque `TOWELS` de `script.js` para que cada toalla apunte a su foto propia en
vez de reusar `p.img`, y se quita el flag «Diseño · foto de producto pendiente».

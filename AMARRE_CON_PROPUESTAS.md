# Amarre entre la presentación comercial y la propuesta

Qué hay que cambiar en **presentaciones-comerciales-superleads** (`index.html`) para que los dos
sistemas sean uno solo. El lado de **propuesta.superleads.mx** ya está hecho y desplegado: aquí se
dice qué quedó listo, para que nadie lo vuelva a construir, y qué falta del otro lado.

> Escrito el 21 de septiembre de 2026 · propuesta.superleads.mx commit #48

---

## 1. El modelo, en una frase

**Un prospecto tiene varias presentaciones. Cada presentación tiene una propuesta. Cada propuesta
tiene sus variantes.**

```
Marisol de la Cerda  (una persona, un correo)
├── Presentación · Instituto Sandford Torreón      → Propuesta  → V1, V2…
├── Presentación · Instituto Sanford Aguascalientes → Propuesta  → V1…
└── Presentación · Colegio Ámsterdam                → Propuesta  → V1…
```

Tres reglas que no se rompen:

1. **Una presentación, una propuesta.** No dos propuestas colgando de la misma presentación, ni una
   propuesta colgando de dos presentaciones. Si hace falta proponer otra cosa al mismo colegio, eso
   es una **variante** de la propuesta (V2, V3), no una presentación nueva.
2. **Toda propuesta debe tener presentación.** Si nació a mano, se le amarra la suya.
3. **Toda presentación debe tener propuesta.** Aunque nunca se envíe o se termine descartando.

Lo que hace que esto funcione con varios campus es que **cada colegio es su propio expediente**:
Sandford Torreón y Sanford Aguascalientes son dos instituciones distintas, con su propia propuesta,
su propia liga y su propio avance. Lo único que comparten es a la persona que decide.

---

## 2. Lo que YA quedó hecho del lado de la propuesta

No hay que construir nada de esto:

| Qué | Cómo |
|---|---|
| El amarre vive en la propuesta | Columna `propuestas.presentacion_slug` (migración `0004`). Antes colgaba de la institución, y por eso solo cabía una presentación por colegio. |
| Cada presentación estrena su propuesta | El cron baja `historial/*.json` cada 10 minutos y, por **cada presentación sin propuesta**, nace un borrador amarrado a ella. Nunca se envía nada solo. |
| Si la propuesta ya existía | Una propuesta del mismo colegio que todavía no tenía presentación se **amarra** a la que llegó, en vez de duplicar el hilo. |
| Una URL estable para volver | `https://propuesta.superleads.mx/de/<presentacion_slug>` abre la propuesta de esa presentación **y la crea si todavía no existe**. |
| Amarrar a mano | En el creador, pestaña **Presentaciones**: cada tarjeta dice «Con propuesta» o «Sin propuesta», y hay un «Amarrar a esta». |
| Se ve lo que falta | El creador avisa en amarillo cuando una propuesta no tiene presentación. |
| La misma persona, varios colegios | Su liga de acceso vale para todas sus propuestas, y no recibe dos correos de seguimiento el mismo día. |

Estado al 21 de septiembre de 2026: **43 de 44 propuestas amarradas**; 48 presentaciones, 43 con
propuesta. Las 5 sin propuesta (Keystone, St Michael, Centro Escolar Mexiquense, C. E. Espíritu
Santo, IMEX) las levanta el cron por su cuenta.

---

## 3. Lo que falta del lado de la presentación

En orden de importancia. Los cuatro primeros son los que valen.

### 3.1 · Guardar el correo del prospecto ← **lo más importante**

**Hoy la presentación no guarda correo ni teléfono.** Esa es la razón número uno de que los
borradores nazcan incompletos: de 43 borradores, **32 no se podían enviar** solo porque les faltaba
el correo, y hubo que salir a buscarlo al brief de la cita, al Rayos X y a SuperLeads.

Hay que agregar al panel DATOS, junto a «Nombre del prospecto»:

| Campo en `DATA` | Qué es |
|---|---|
| `prospecto_correo` | Correo de quien decide. **Es el que recibe la propuesta.** |
| `prospecto_telefono` | Su celular (sirve para el botón de WhatsApp). |
| `prospecto_2_correo` | Correo del segundo contacto. |
| `prospecto_2_telefono` | Su celular. |

Con eso, el borrador nace **listo para enviar** y desaparece el paso de andar cazando datos.

> El contacto 2 suele ser el director de ese campus, y por eso va **en cada presentación**, no en el
> prospecto: Marisol es la misma en las tres, pero el director cambia en cada una.

### 3.2 · Varias presentaciones para el mismo prospecto

Hoy el archivo se llama `historial/<slug(colegio)>.json` (`index.html`, `guardarHistorial()`, ~línea
3839). Eso significa **una presentación por nombre de colegio**: la segunda pisa a la primera y la
propuesta amarrada se queda huérfana.

Qué hacer:

1. Agregar `DATA.presentacion_slug`. **Es el nombre de su archivo y es su identidad.** Se calcula una
   sola vez, en el primer guardado.
2. Al guardar por primera vez: si `historial/<slug(colegio)>.json` ya existe y **no** es esta misma
   presentación, el archivo se llama `<slug(colegio)>__2`, `__3`, y así.
3. **El slug se congela.** Una vez guardada, cambiar el nombre del colegio cambia el título en todos
   lados, pero **no mueve el archivo**. Hoy `ghEliminarArchivo()` (~línea 3828) borra el archivo
   viejo al renombrar: eso hay que quitarlo en cuanto la presentación ya tenga su slug, porque
   rompe el amarre y mata una URL que ya se compartió por WhatsApp.

Si de verdad hay que mover un archivo, se escribe `DATA.slug_anterior` con el nombre viejo y del otro
lado se sigue el rastro. Es la salida de emergencia, no el camino normal.

### 3.3 · El botón «Ver su propuesta»

En la barra de la presentación, junto a «Copiar enlace»:

```js
const urlPropuesta = 'https://propuesta.superleads.mx/de/' + DATA.presentacion_slug;
```

Eso es todo. **No hay que llamar a ninguna API, ni guardar ids, ni manejar llaves.** Esa URL:

- abre la propuesta de esta presentación si ya existe;
- la **crea** (como borrador) si todavía no existe y la abre;
- pide entrar con la cuenta de SuperLeads, porque es interna.

Es la misma idea de siempre: sentido único. La presentación **nunca** escribe en la propuesta.

### 3.4 · `link_propuesta` y `omitir_propuesta`

- `link_propuesta` se queda como está: es el campo manual donde viven los 6 enlaces viejos de
  PandaDoc (`link.superleads.mx/documents/…`). **No lo sobrescriban con la URL nueva**: el botón de
  3.3 no necesita ningún campo. Cuando ya no quede ninguno de los viejos, se retira el campo.
- `omitir_propuesta` se queda igual: es la salida para una presentación que de verdad no lleva
  propuesta (una demo, una prueba). El cron la respeta.

### 3.5 · Detalles menores

- **No cambiar** los nombres de los campos que ya existen en `data`: `segmento`, `paquete`,
  `soporte`, `moneda`, `descuento`, `precios_override`, `soporte_precios`, `colegio`, `ciudad`,
  `pais`, `comercial`, `prospecto_nombre`, `prospecto_cargo`, `prospecto_2_nombre`,
  `prospecto_2_cargo`, `origen_rayosx`. La propuesta los lee tal cual (`src/presentaciones.ts`,
  `configDesdePresentacion()`).
- La plantilla vacía («Nueva institución») sigue sin generar propuesta. Está bien así.
- Si se agrega un campo nuevo, avisar: hay que leerlo del otro lado o se pierde.

---

## 4. Cómo probar que quedó

1. Guardar una presentación nueva con correo del prospecto.
2. Esperar al cron (≤10 min) **o** abrir directo
   `https://propuesta.superleads.mx/de/<presentacion_slug>`.
3. Debe abrir un borrador con: colegio, ciudad, contacto 1 **con correo**, contacto 2, segmento,
   paquete, soporte, moneda y los precios que se hayan editado en la presentación.
4. En el panel de propuestas ese borrador debe decir **«Lista para enviar»**, no «Le falta…».
5. Guardar una **segunda** presentación con el mismo nombre de colegio: debe crear
   `<slug>__2.json` y **su propia** propuesta, sin tocar la primera.

---

## 5. Lo que no hay que hacer

- **No** borrar ni renombrar archivos de `historial/` que ya tengan propuesta.
- **No** escribir desde la presentación hacia la propuesta (ni API, ni base, ni GitHub). El sentido
  es uno solo: la propuesta lee la presentación.
- **No** meter dos colegios en una misma presentación. Tres campus son tres presentaciones.
- **No** reutilizar un `presentacion_slug` para otro prospecto: se llevaría la propuesta del anterior.

---

## 6. A quién preguntarle

Del lado de la propuesta todo esto vive en `~/propuesta`:

- `src/presentaciones.ts` — el espejo, `propuestaDePresentacion()`, `leerPresentacion()`.
- `src/propuestas.ts` — `ligarPresentacion()`, `deLaMismaPersona()`, `copiarAOtroColegio()`.
- `src/index.ts` — la ruta `/de/<presentacion_slug>`.
- `migrations/0004_presentacion_por_propuesta.sql` — la columna del amarre.

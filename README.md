# Presentaciones Comerciales SuperLeads

Presentaciones comerciales de SuperLeads en HTML autocontenido (sin build, sin dependencias externas para funcionar).

## Presentaciones

- **`index.html`** — Presentación del Sistema (Instituto Frontera AC / plantilla base). 33 láminas, panel de edición de datos del prospecto, precios por segmento (Academia, Maternal, K12, Grupo/Universidad), cálculos automáticos de breakeven y ROAS.

## Cómo funciona

- **Editar datos**: botón "✏️ DATOS" (o tecla `E`) abre el panel de edición. Los cambios se guardan automáticamente en el navegador (localStorage) para la próxima vez que se abra en el mismo equipo.
- **Descargar HTML**: botón "⬇ HTML" genera un archivo `.html` independiente con los datos actuales ya incrustados — se puede enviar o archivar sin perder la personalización.
- **Descargar PDF**: botón "⬇ PDF" abre el diálogo de impresión del navegador ya configurado en landscape 1280×720 con los colores de marca forzados (`print-color-adjust: exact`). Elegir "Guardar como PDF".
- **Notas del orador**: tecla `N`.
- **Pantalla completa**: tecla `F`.

## Publicar una nueva presentación

1. Duplicar `index.html` con un nombre descriptivo (ej. `nombre-colegio.html`).
2. Editar el objeto `DATA` al inicio del `<script>` con los datos del prospecto.
3. Subir el archivo a este repo — Cloudflare Pages lo publica automáticamente en `presentaciones-comerciales.superleads.mx/nombre-colegio.html`.

## Dominio

`presentaciones-comerciales.superleads.mx` (Cloudflare Pages)

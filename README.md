# Presentaciones Comerciales SuperLeads

Presentación comercial del **Sistema de Inscripciones SuperLeads** en HTML autocontenido — sin build, sin dependencias externas. Se abre en cualquier navegador, funciona sin conexión y se personaliza por prospecto en minutos.

## 🔗 Ver la presentación en vivo

| | Link |
|---|---|
| **Dominio oficial** | https://presentaciones-comerciales.superleads.mx/ |
| **GitHub Pages** | https://ricardolopezreyero.github.io/presentaciones-comerciales-superleads/ |

Cada commit a `main` se publica automáticamente en ambos links (~1 minuto).

## ⚡ Lo más importante

- **36 láminas** con la lógica de conversión completa: Rayos X → Sistema → Herramientas → Precios → Cierre.
- **Panel DATOS (tecla E)**: se personaliza todo por prospecto — colegio, contactos, métricas, segmento y paquete. Los cálculos (breakeven, ROAS, ingreso extra, valor del decimal) se recalculan en vivo. El panel es consciente del contexto: resalta los campos de la lámina actual.
- **Bimoneda MXN / USD**: todo se captura en pesos; al elegir dólares la presentación completa se convierte sola (TC $18, redondeo ligero hacia arriba). Formato mexicano: `3.95` · `12,345` · `1'234,567`.
- **Precios por segmento**: Academia (1 / todas), Maternal, K12, Grupo/Universidad — con paquetes Base, + Dirección Estratégica y + Atracción Inteligente. La lámina de inversión muestra solo lo cotizado, con ancla anual / mensual / diario.
- **Notas (tecla N)**: guía de lectura con formato por lámina + editor de notas de la llamada (negritas, listas) que se guarda solo y viaja dentro del HTML exportado.
- **Etiquetas ajustables** en Los Signos Vitales, caso de éxito auto-seleccionado por perfil, comercial que presenta seleccionable (Ricardo / Víctor).
- **Exportar**: botón **PDF** (36 páginas, logo clicable a superleads.mx en todas) y botón **HTML** (archivo autocontenido con los datos del prospecto incrustados, listo para enviar).
- **Logo SuperLeads en el 100% de las láminas**, con link a https://superleads.mx — también en el PDF.

## 📁 Estructura

```
index.html                        → la presentación (todo vive aquí)
assets_deck_instituto_frontera/   → imágenes de las láminas y variantes del logo
```

## 🔄 Cómo se actualiza

Editar `index.html` y hacer commit a `main`. Los datos capturados por cada comercial viven en su navegador (localStorage) y en los HTML que exporta — nunca en el repo.

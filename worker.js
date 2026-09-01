/* Worker del sitio de presentaciones comerciales SuperLeads.
   Los archivos estáticos (index.html, assets, og-preview.png) los sirve Workers Static Assets;
   este script solo corre para rutas que NO son un archivo — es decir, las URLs por presentación
   (/<slug-del-colegio>). Su único trabajo: servir el mismo index.html pero con og:title y og:url
   propios de esa presentación, para que al compartir el link por WhatsApp/iMessage la tarjeta de
   previsualización muestre el nombre del colegio (los rastreadores de esas apps no ejecutan JS,
   así que esto tiene que resolverse aquí, del lado del servidor). */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    /* La vuelta de la sincronización: la presentación escribe en el Rayos X.
       Va por aquí y no directo desde el navegador porque el secreto compartido
       vive en las variables del Worker — mandarlo al cliente lo dejaría a la
       vista de cualquiera que abra las herramientas del navegador, y este
       endpoint escribe en la base de producción del Rayos X. */
    if (url.pathname === '/api/rayosx-sync' && request.method === 'POST') {
      if (!env.RAYOSX_SYNC_SECRET) {
        return Response.json({ ok: false, mensaje: 'Sin RAYOSX_SYNC_SECRET configurado.' }, { status: 503 });
      }
      const r = await fetch('https://rayosx.superleads.mx/api/presentacion', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-presentacion-secreto': env.RAYOSX_SYNC_SECRET,
        },
        body: await request.text(),
      });
      return new Response(await r.text(), {
        status: r.status,
        headers: { 'content-type': 'application/json' },
      });
    }

    const res = await env.ASSETS.fetch(request);
    const ct = res.headers.get('content-type') || '';
    if (!ct.includes('text/html')) return res;

    const ruta = url.pathname.replace(/^\/+|\/+$/g, '');
    if (!ruta || ruta.includes('.')) return res;

    // El slug se vuelve título legible: centro_universitario_mesoamericano → Centro Universitario Mesoamericano
    const nombre = ruta.split('_').filter(Boolean)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const titulo = esc(nombre) + ' · Presentación SuperLeads';

    let html = await res.text();
    html = html
      .replace(/<meta property="og:title" content="[^"]*">/, '<meta property="og:title" content="' + titulo + '">')
      .replace(/<meta property="og:url" content="[^"]*">/, '<meta property="og:url" content="https://presentaciones-comerciales.superleads.mx/' + esc(ruta) + '">')
      .replace(/<title>[^<]*<\/title>/, '<title>' + titulo + '</title>');
    return new Response(html, { status: res.status, headers: res.headers });
  }
};

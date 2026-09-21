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

    /* RLR — El historial vive en GitHub, pero el token NO vive en el navegador.
       Antes el index.html (público, en un repo público) traía el token disfrazado: cualquiera que
       abriera el archivo podía escribir en el repo. Ahora el token vive en la bóveda de la cuenta
       (Secrets Store) y el navegador habla con este proxy, que solo sabe hacer cuatro cosas y
       solo sobre historial/: listar, leer, guardar y borrar. */
    if (url.pathname.startsWith('/api/gh/')) return proxyGitHub(request, env, url);

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

const GH_REPO = 'ricardolopezreyero/presentaciones-comerciales-superleads';
const GH_RAMA = 'main';

/** Lo único que se deja pasar: el historial y la lista de commits del historial. Nada más del repo. */
function rutaPermitida(resto, metodo) {
  const limpio = resto.split('?')[0];
  if (metodo === 'GET') {
    return limpio === 'contents/historial'
      || /^contents\/historial\/[A-Za-z0-9_.-]+\.json$/.test(limpio)
      || limpio === 'commits';
  }
  // Escribir o borrar: solo un archivo del historial
  return /^contents\/historial\/[A-Za-z0-9_.-]+\.json$/.test(limpio);
}

async function proxyGitHub(request, env, url) {
  const metodo = request.method;
  const resto = url.pathname.slice('/api/gh/'.length) + url.search;
  const json = (o, s) => Response.json(o, { status: s || 200, headers: { 'cache-control': 'no-store' } });

  if (!['GET', 'PUT', 'DELETE'].includes(metodo)) return json({ message: 'Método no permitido' }, 405);
  if (!rutaPermitida(resto, metodo)) return json({ message: 'Esa ruta no está permitida' }, 403);

  if (metodo !== 'GET') {
    // Guardar y borrar solo desde la propia presentación (no desde otra página ni desde un enlace).
    const origen = request.headers.get('origin') || '';
    if (origen && origen !== url.origin) return json({ message: 'Origen no permitido' }, 403);
    // Si la cuenta tiene clave puesta, se exige; si no, basta con el candado de arriba.
    const clave = env.PRESENTACIONES_CLAVE;
    if (clave && request.headers.get('x-clave') !== clave) return json({ message: 'Falta la clave para guardar' }, 401);
  }

  let token = '';
  try { token = typeof env.GITHUB_TOKEN?.get === 'function' ? await env.GITHUB_TOKEN.get() : (env.GITHUB_TOKEN || ''); } catch (e) { token = ''; }
  if (!token) return json({ message: 'Falta el token de GitHub en la bóveda de la cuenta.' }, 503);

  const r = await fetch(`https://api.github.com/repos/${GH_REPO}/${resto}`, {
    method: metodo,
    headers: {
      authorization: `Bearer ${token}`,
      accept: 'application/vnd.github+json',
      'user-agent': 'SuperLeads-Presentaciones/1.0',
      ...(metodo === 'GET' ? {} : { 'content-type': 'application/json' }),
    },
    body: metodo === 'GET' ? undefined : await request.text(),
  });

  const texto = await r.text();
  // La lista de archivos trae URLs absolutas a api.github.com: se reescriben para que el navegador
  // vuelva por aquí (y nunca necesite el token).
  const cuerpo = texto.split(`https://api.github.com/repos/${GH_REPO}/`).join(`${url.origin}/api/gh/`);
  return new Response(cuerpo, {
    status: r.status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}

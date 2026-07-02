export async function onRequest({ request, params }) {
  const path = params.path.join('/');
  const targetUrl = new URL(`https://memo.z2m.store/${path}${new URL(request.url).search}`);

  // OPTIONS预检本地直接返回，不回源提速
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'Authorization,Content-Type',
        'Access-Control-Max-Age': '86400'
      }
    })
  }

  const proxyReq = new Request(targetUrl, request);
  const res = await fetch(proxyReq);
  const headers = new Headers(res.headers);
  headers.set('Access-Control-Allow-Origin', '*');
  return new Response(res.body, { status: res.status, headers });
}

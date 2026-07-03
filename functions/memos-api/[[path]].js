export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const targetPath = url.pathname.replace(/^\/memos-api/, "");
  const targetUrl = new URL(targetPath, "https://memo.z2m.store");
  targetUrl.search = url.search;
  if (request.method === "OPTIONS") {
    const headers = {"Access-Control-Allow-Origin":"*","Access-Control-Allow-Methods":"GET,POST,PUT,DELETE,OPTIONS","Access-Control-Allow-Headers":"Content-Type,Authorization","Access-Control-Max-Age":"86400"};
    return new Response(null, {status:204,headers:headers});
  }
  try {
    const proxyRequest = new Request(targetUrl, {method:request.method,headers:request.headers,body:request.body,redirect:"follow"});
    const originRes = await fetch(proxyRequest);
    const resHeaders = new Headers(originRes.headers);
    resHeaders.set("Access-Control-Allow-Origin", "*");
    return new Response(originRes.body, {status:originRes.status,headers:resHeaders});
  } catch (err)
    const errData = JSON.stringify({code:500,message:"接口转发失败",error:err.message});
    const errHeaders = {"Content-Type":"application/json"};
    return new Response(errData, {status:500,headers:errHeaders});
  }
}

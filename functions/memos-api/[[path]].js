export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  // 移除 /memos-api 前缀
  const targetPath = url.pathname.replace(/^\/memos-api/, "");
  const targetUrl = new URL(targetPath, "https://memo.z2m.store");
  targetUrl.search = url.search;

  // 处理跨域OPTIONS预检
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  try {
    // 完整复制请求头、body，不丢失鉴权
    const proxyRequest = new Request(targetUrl, {
      method: request.method,
      headers: request.headers,
      body: request.body,
      redirect: "follow",
    });

    const originRes = await fetch(proxyRequest);
    const resHeaders = new Headers(originRes.headers);
    resHeaders.set("Access-Control-Allow-Origin", "*");

    return new Response(originRes.body, {
      status: originRes.status,
      headers: resHeaders,
    });
  } catch (err)
    // 捕获所有异常，杜绝1101崩溃
    console.error("Proxy Worker Error:", err);
    return new Response(
      JSON.stringify({
        code: 500,
        message: "接口转发失败，Worker执行异常",
        error: err.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
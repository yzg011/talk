export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  // 去除 /memos-api 前缀
  const targetPath = url.pathname.replace(/^\/memos-api/, "");
  const targetUrl = new URL(targetPath, "https://memo.z2m.store");
  targetUrl.search = url.search;

  // 处理跨域OPTIONS预检
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  try {
    // 复制全部请求头，不丢失鉴权信息
    const proxyReq = new Request(targetUrl, {
      method: request.method,
      headers: request.headers,
      body: request.body,
      redirect: "follow",
    });

    const res = await fetch(proxyReq);
    const resHeaders = new Headers(res.headers);
    resHeaders.set("Access-Control-Allow-Origin", "*");

    return new Response(res.body, {
      status: res.status,
      headers: resHeaders,
    });
  } catch (err)
    // 捕获脚本内部所有异常，避免Worker崩溃1101
    console.error("Proxy worker error:", err);
    return new Response(
      JSON.stringify({
        code: 500,
        msg: "接口转发失败，请稍后重试",
        error: err.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

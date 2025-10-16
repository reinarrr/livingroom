async function exchange(code, env) {
  const body = new URLSearchParams({
    client_id: env.GITHUB_CLIENT_ID,
    client_secret: env.GITHUB_CLIENT_SECRET,
    code,
    redirect_uri: env.GITHUB_REDIRECT_URI,
  });
  const r = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { Accept: "application/json" },
    body
  });
  if (!r.ok) throw new Error("token exchange failed: " + r.status);
  return r.json(); // { access_token, ... }
}

function htmlClose(token, origin) {
  return `<!doctype html><meta charset=utf-8><body><script>
    (function(){var t=${JSON.stringify(token)},o=${JSON.stringify(origin)};
    if(window.opener){window.opener.postMessage({token:t},o);window.close();}
    else{document.write("Authenticated. You can close this window.");}})();
  </script>`;
}

export async function onRequest({ request, env }) {
  const code = new URL(request.url).searchParams.get("code");
  if (!code) return new Response("Missing code", { status: 400 });
  const data = await exchange(code, env);
  const origin = env.ALLOWED_ORIGIN; // e.g. https://tlr.pages.dev
  return new Response(htmlClose(data.access_token, origin), {
    headers: { "Content-Type": "text/html; charset=utf-8" }
  });
}

async function exchangeCodeForToken(code, env) {
  const params = new URLSearchParams();
  params.set("client_id", env.GITHUB_CLIENT_ID);
  params.set("client_secret", env.GITHUB_CLIENT_SECRET);
  params.set("code", code);
  params.set("redirect_uri", env.GITHUB_REDIRECT_URI);

  const resp = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { "Accept": "application/json" },
    body: params
  });
  if (!resp.ok) {
    throw new Error(`GitHub token exchange failed: ${resp.status}`);
  }
  return await resp.json(); // { access_token, token_type, scope }
}

function htmlCloseWithToken(token, origin) {
  // Decap listens for postMessage({ token }) from the popup window
  return `
<!doctype html><html><body>
<script>
  (function(){
    var t = ${JSON.stringify(token)};
    var o = ${JSON.stringify(origin)};
    if (window.opener) {
      window.opener.postMessage({ token: t }, o);
      window.close();
    } else {
      document.write("Authenticated. Please close this window.");
    }
  })();
</script>
</body></html>`;
}

export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  if (!code) return new Response("Missing code", { status: 400 });

  // Limit who can receive the token via postMessage
  const allowedOrigin = env.ALLOWED_ORIGIN; // e.g., https://tlr.pages.dev

  try {
    const data = await exchangeCodeForToken(code, env);
    const token = data.access_token;
    if (!token) throw new Error("No access_token in response");

    return new Response(htmlCloseWithToken(token, allowedOrigin), {
      headers: { "Content-Type": "text/html; charset=utf-8" }
    });
  } catch (e) {
    return new Response(`OAuth error: ${e.message}`, { status: 500 });
  }
}

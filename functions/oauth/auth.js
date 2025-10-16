export async function onRequest({ env }) {
  const u = new URL("https://github.com/login/oauth/authorize");
  u.searchParams.set("client_id", env.GITHUB_CLIENT_ID);
  u.searchParams.set("scope", env.GITHUB_SCOPE || "repo");
  u.searchParams.set("redirect_uri", env.GITHUB_REDIRECT_URI);
  return Response.redirect(u.toString(), 302);
}

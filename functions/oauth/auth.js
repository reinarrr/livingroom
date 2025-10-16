export async function onRequest({ env, request }) {
  const client_id = env.GITHUB_CLIENT_ID;
  const scope = env.GITHUB_SCOPE || "repo";
  const redirect_uri = env.GITHUB_REDIRECT_URI;

  const url = new URL("https://github.com/login/oauth/authorize");
  url.searchParams.set("client_id", client_id);
  url.searchParams.set("scope", scope);
  url.searchParams.set("redirect_uri", redirect_uri);

  return Response.redirect(url.toString(), 302);
}

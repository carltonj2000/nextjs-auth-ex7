import { Google, GitHub } from "arctic";

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const redirectURI = process.env.GOOGLE_REDIRECT_URI;

if (!clientId || !clientSecret || !redirectURI) {
  console.error("Google Client ID, Secret or URI not set!");
  process.exit(-1);
}

export const google = new Google(clientId, clientSecret, redirectURI);

const ghClientId = process.env.GITHUB_CLIENT_ID;
const ghClientSecret = process.env.GITHUB_CLIENT_SECRET;
const ghRedirectURI = process.env.GITHUB_REDIRECT_URI;

if (!ghClientId || !ghClientSecret || !ghRedirectURI) {
  console.error("GitHub Client ID, Secret or URI not set!");
  process.exit(-1);
}

export const github = new GitHub(ghClientId, ghClientSecret, {
  redirectURI: ghRedirectURI,
});

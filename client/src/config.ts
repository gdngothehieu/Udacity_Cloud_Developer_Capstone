// certification: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = "3qzpu9h9ij";
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`;

export const authConfig = {
  // certification: Create an Auth0 application and copy values from it into this map. For example:
  // domain: 'dev-nd9990-p4.us.auth0.com',
  domain: "dev-mm0vvjb8.us.auth0.com",
  clientId: "WMu3hNE7MMgswzKYNmUGhQb2ygN06A8c",
  callbackUrl: "http://localhost:3000/callback",
};

// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
// API Gateway ID

const apiId = "u70j5r9lr4";
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`;

export const authConfig = {
  domain: "dev-mm0vvjb8.us.auth0.com",
  clientId: "WMu3hNE7MMgswzKYNmUGhQb2ygN06A8c",
  callbackUrl: "http://localhost:3000/callback",
};

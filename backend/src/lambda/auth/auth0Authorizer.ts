import { CustomAuthorizerEvent, CustomAuthorizerResult } from "aws-lambda";
import "source-map-support/register";

import { verify, decode } from "jsonwebtoken"; //--error decode not used
import { createLogger } from "../../utils/logger";
import Axios from "axios";
import { Jwt } from "../../auth/Jwt";
import { JwtPayload } from "../../auth/JwtPayload";

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
const logger = createLogger("auth");

const jwksUrl = process.env.AUTH_0_JSON_WEB_KEY_SET_URL;

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info("Authorizing a user", event.authorizationToken);
  try {
    const jwtToken = await verifyToken(event.authorizationToken);
    logger.info("User was authorized", jwtToken);

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: "2012-10-17",
        Statement: [
          {
            Action: "execute-api:Invoke",
            Effect: "Allow",
            Resource: "*",
          },
        ],
      },
    };
  } catch (e) {
    logger.error("User not authorized", { error: e.message });

    return {
      principalId: "user",
      policyDocument: {
        Version: "2012-10-17",
        Statement: [
          {
            Action: "execute-api:Invoke",
            Effect: "Deny",
            Resource: "*",
          },
        ],
      },
    };
  }
};

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader);
  const response = await Axios.get(jwksUrl);
  const jwks = response.data;
  const keys: any[] = jwks.keys;
  const jwt: Jwt = decode(token, { complete: true }) as Jwt;

  const signingKey = keys.find((key) => key.kid === jwt.header.kid);

  let certValue: string = signingKey.x5c[0];

  certValue = certValue.match(/.{1,64}/g).join("\n");

  const certifcationKey: string = `-----BEGIN CERTIFICATE-----\n${certValue}\n-----END CERTIFICATE-----\n`;

  const jwtPayload: JwtPayload = verify(token, certifcationKey, {
    algorithms: ["RS256"],
  }) as JwtPayload;

  return jwtPayload;
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error("No authentication header");

  if (!authHeader.toLowerCase().startsWith("bearer "))
    throw new Error("Invalid authentication header");

  const split = authHeader.split(" ");
  const token = split[1];

  return token;
}

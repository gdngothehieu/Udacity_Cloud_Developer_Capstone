import "source-map-support/register";

import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  APIGatewayProxyHandler,
} from "aws-lambda";
import { createLogger } from "../../utils/logger";
import {
  deleteCertification,
  certificationExists,
} from "../../businessLogic/certification";

const logger = createLogger("deleteCertificationhandler");

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const certificationId = event.pathParameters.certificationId;

  const authorization = event.headers.Authorization;
  const split = authorization.split(" ");
  const jwtToken = split[1];
  logger.info("Processing event: ", event);
  const isValidCertificationId = await certificationExists(
    certificationId,
    jwtToken
  );

  if (!isValidCertificationId) {
    return {
      statusCode: 404,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        error: "Certification not found",
      }),
    };
  }

  try {
    await deleteCertification(certificationId, jwtToken);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: "Deleted",
    };
  } catch (err) {
    logger.error("Failed to delete", err);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: "Failed to delete",
    };
  }
};

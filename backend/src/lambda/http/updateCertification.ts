import "source-map-support/register";

import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
} from "aws-lambda";

import { UpdateCertificationRequest } from "../../requests/UpdateCertificationRequest";
import {
  updateCertification,
  certificationExists,
} from "../../businessLogic/certification";
import { createLogger } from "../../utils/logger";

const logger = createLogger("updateCertificationhandler");

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const certificationId = event.pathParameters.certificationId;

  const updateCertificationRequest: UpdateCertificationRequest = JSON.parse(
    event.body
  );
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
    const updatedCertification = await updateCertification(
      certificationId,
      updateCertificationRequest,
      jwtToken
    );

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify(updatedCertification),
    };
  } catch (err) {
    logger.error("Update failed", err);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: "Update failed",
    };
  }
};

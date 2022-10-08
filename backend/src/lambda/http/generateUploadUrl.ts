import "source-map-support/register";

import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  APIGatewayProxyHandler,
} from "aws-lambda";
import {
  generateAndAddUploadUrl,
  certificationExists,
} from "../../businessLogic/certification";
import { createLogger } from "../../utils/logger";

const logger = createLogger("generateUploadUrlhandler");

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const certificationId = event.pathParameters.certificationId;

  // DONE: Return a presigned URL to upload a file for a certification item with the provided id
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
    const uploadUrl = await generateAndAddUploadUrl(certificationId, jwtToken);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        uploadUrl: uploadUrl,
      }),
    };
  } catch (err) {
    logger.error("Failed to generate url", err);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: "Failed to generate url",
    };
  }
};

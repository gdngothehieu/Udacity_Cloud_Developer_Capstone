import "source-map-support/register";

import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
} from "aws-lambda";

import { CreateCertificationRequest } from "../../requests/CreateCertificationRequest";
import { createCertification } from "../../businessLogic/certification";
import { createLogger } from "../../utils/logger";

const logger = createLogger("createTodohandler");

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  logger.info("Processing event: ", event);
  const newCertificationRequest: CreateCertificationRequest = JSON.parse(
    event.body
  );

  // DONE: Implement creating a new TODO item
  const authorization = event.headers.Authorization;
  const split = authorization.split(" ");
  const jwtToken = split[1];

  const newCertificationItem = await createCertification(
    newCertificationRequest,
    jwtToken
  );

  return {
    statusCode: 201,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
    body: JSON.stringify({
      item: newCertificationItem,
    }),
  };
};

import "source-map-support/register";
import {
  getCertification,
  searchCertification,
} from "../../businessLogic/certification";
import { createLogger } from "../../utils/logger";

import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  APIGatewayProxyHandler,
} from "aws-lambda";

const logger = createLogger("getCertificationhandler");

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  logger.info("Processing event: ", event);

  const authorization = event.headers.Authorization;
  const split = authorization.split(" ");
  const jwtToken = split[1];
  const searchContent = event.queryStringParameters?.search;
  console.log("avc", event);
  console.log("avc searchContent", searchContent);
  let certification;
  if (searchContent == undefined) {
    certification = await getCertification(jwtToken);
  } else {
    certification = await searchCertification(jwtToken, searchContent);
  }
  // const certification = await getCertification(jwtToken, searchContent);

  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
    body: JSON.stringify({
      items: certification,
    }),
  };
};

import "source-map-support/register";

import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import * as middy from "middy";
import { cors, httpErrorHandler } from "middy/middlewares";

import { deleteCertification } from "../../businessLogic/certifications";
import { getUserId } from "../utils";
import { createLogger } from "../../utils/logger";

const logger = createLogger("deleteCertification");

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const certificationId = event.pathParameters.certificationId;
    // certification: Remove a certification item by id
    logger.info(`Processing event: ${event}`);
    const userId = getUserId(event);
    const newItem = await deleteCertification(userId, certificationId);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        item: newItem, //return empty
      }),
    };
  }
);
handler.use(httpErrorHandler()).use(
  cors({
    credentials: true,
  })
);

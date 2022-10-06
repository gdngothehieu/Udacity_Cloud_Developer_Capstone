import "source-map-support/register";

import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import * as middy from "middy";
import { cors, httpErrorHandler } from "middy/middlewares";
import { getCertifications } from "../../businessLogic/certifications";
import { getUserId } from "../utils";
import { createLogger } from "../../utils/logger";

const logger = createLogger("getCertification");

// certification: Get all certification items for a current user
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      logger.info(`Processing event`);
      const userId = getUserId(event);
      const items = await getCertifications(userId);

      return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify({
          items,
        }),
      };
    } catch (e) {
      console.log(e);
    }
  }
);

handler.use(httpErrorHandler()).use(
  cors({
    credentials: true,
  })
);

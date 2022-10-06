import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import "source-map-support/register";
import * as middy from "middy";
import { cors, httpErrorHandler } from "middy/middlewares";
import { CreateCertificationRequest } from "../../requests/CreateCertificationRequest";
import { getUserId } from "../utils";
import { createCertification } from "../../businessLogic/certifications";
import { createLogger } from "../../utils/logger";

const logger = createLogger("createCertification");
// certification: Implement creating a new certification item

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      logger.info(`Processing event`);
      const newCertification: CreateCertificationRequest = JSON.parse(
        event.body
      );
      const userId = getUserId(event);
      const newItem = await createCertification(newCertification, userId);

      return {
        statusCode: 201,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify({
          item: newItem,
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

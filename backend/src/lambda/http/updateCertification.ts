import "source-map-support/register";

import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import * as middy from "middy";
import { cors, httpErrorHandler } from "middy/middlewares";

import { updateCertification } from "../../businessLogic/certifications";
import { UpdateCertificationRequest } from "../../requests/UpdateCertificationRequest";
import { getUserId } from "../utils";
import { createLogger } from "../../utils/logger";

const logger = createLogger("updateCertification");
// certification: Update a certification item with the provided id using values in the "updatedCertification" object

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      const certificationId = event.pathParameters.certificationId;
      const updatedCertification: UpdateCertificationRequest = JSON.parse(
        event.body
      );
      logger.info("Processing event");

      const userId = getUserId(event);
      const response = await updateCertification(
        userId,
        certificationId,
        updatedCertification
      );

      return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify({
          item: response,
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

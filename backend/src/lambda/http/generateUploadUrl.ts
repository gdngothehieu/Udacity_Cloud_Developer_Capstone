import "source-map-support/register";

import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import * as middy from "middy";
import { cors, httpErrorHandler } from "middy/middlewares";
import { getUploadUrl, updateUrl } from "../../businessLogic/certifications";
import { getUserId } from "../utils";
import { createLogger } from "../../utils/logger";

const logger = createLogger("generateUploadUrl");
// certification: Return a presigned URL to upload a file for a certification item with the provided id

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      const certificationId = event.pathParameters.certificationId;

      logger.info(`Processing event`);
      const userId = getUserId(event);
      const getUploadURLResponse = await getUploadUrl(certificationId);
      const attachmentId = getUploadURLResponse.split("?")[0];

      await updateUrl(userId, certificationId, attachmentId);

      return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify({
          uploadUrl: getUploadURLResponse,
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

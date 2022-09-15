import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import "source-map-support/register";
import * as middy from "middy";
import { cors, httpErrorHandler } from "middy/middlewares";
import { CreateTodoRequest } from "../../requests/CreateTodoRequest";
import { getUserId } from "../utils";
import { createTodo } from "../../businessLogic/todos";
import { createLogger } from "../../utils/logger";

const logger = createLogger("createTodo");
// TODO: Implement creating a new TODO item

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      logger.info(`Processing event`);
      const newTodo: CreateTodoRequest = JSON.parse(event.body);
      const userId = getUserId(event);
      const newItem = await createTodo(newTodo, userId);

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

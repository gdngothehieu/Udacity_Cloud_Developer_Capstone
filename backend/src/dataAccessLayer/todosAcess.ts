import * as AWS from "aws-sdk";
const AWSXRay = require("aws-xray-sdk");
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { createLogger } from "../utils/logger";
import { TodoItem } from "../models/TodoItem";
import { TodoUpdate } from "../models/TodoUpdate";

const XAWS = AWSXRay.captureAWS(AWS);

const logger = createLogger("TodosAccess");

// TODO: Implement the helpers logic
export class TodosAccess {
  constructor(
    private readonly documentClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly todosTableIndexName = process.env.TODOS_CREATED_AT_INDEX
  ) {}

  async getTodos(userId: string): Promise<TodoItem[]> {
    try {
      logger.info(`Get todos request processing`);

      const result = await this.documentClient
        .query({
          TableName: this.todosTable,
          IndexName: this.todosTableIndexName,
          KeyConditionExpression: "#userId = :i",
          ExpressionAttributeNames: {
            "#userId": "userId",
          },
          ExpressionAttributeValues: {
            ":i": userId,
          },
        })
        .promise();

      return result.Items as TodoItem[];
    } catch (e) {
      console.log(e);
    }
  }

  async getTodo(todoId: string, userId: string): Promise<TodoItem> {
    try {
      logger.info(`Get todo request`);

      const result = await this.documentClient
        .get({
          TableName: this.todosTable,
          Key: {
            todoId: todoId,
            userId: userId,
          },
        })
        .promise();

      return result.Item as TodoItem;
    } catch (e) {
      console.log(e);
    }
  }

  async createTodo(todoItem: TodoItem): Promise<TodoItem> {
    try {
      logger.info(
        `Create todo request processing for ${todoItem} in ${this.todosTable}`
      );

      await this.documentClient
        .put({
          TableName: this.todosTable,
          Item: todoItem,
        })
        .promise();
      return Promise.resolve(todoItem);
    } catch (e) {
      console.log(e);
    }
  }

  async updateTodo(todoId: string, todoUpdate: TodoUpdate, userId: string) {
    try {
      logger.info(
        `Update todo request processing for ${todoId} in ${this.todosTable}`
      );

      await this.documentClient
        .update({
          TableName: this.todosTable,
          Key: {
            todoId,
            userId,
          },
          UpdateExpression:
            "set #name = :name, dueDate = :dueDate, done = :done",
          ExpressionAttributeNames: {
            "#name": "name",
          },
          ExpressionAttributeValues: {
            ":name": todoUpdate.name,
            ":dueDate": todoUpdate.dueDate,
            ":done": todoUpdate.done,
          },
        })
        .promise();
    } catch (e) {
      console.log(e);
    }
  }

  async deleteTodo(todoId: string, userId: string): Promise<void> {
    try {
      logger.info(`Delete todo request processing`);

      await this.documentClient
        .delete({
          TableName: this.todosTable,
          Key: {
            todoId: todoId,
            userId: userId,
          },
        })
        .promise();

      return Promise.resolve();
    } catch (e) {
      console.log(e);
    }
  }

  async updateUrl(todoId: string, attachmentUrl: string, userId: string) {
    try {
      logger.info(`Updating the attachment URL`);

      await this.documentClient
        .update({
          TableName: this.todosTable,
          Key: {
            todoId: todoId,
            userId: userId,
          },
          UpdateExpression: "set attachmentUrl = :attachmentUrl",
          ExpressionAttributeValues: {
            ":attachmentUrl": attachmentUrl,
          },
        })
        .promise();
    } catch (e) {
      console.log(e);
    }
  }
}

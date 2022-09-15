import { TodosAccess } from "../dataAccessLayer/todosAcess";
import { AttachmentUtils } from "../fileStorageLayer/attachmentUtils";
import { TodoItem } from "../models/TodoItem";
import { CreateTodoRequest } from "../requests/CreateTodoRequest";
import { UpdateTodoRequest } from "../requests/UpdateTodoRequest";
import { createLogger } from "../utils/logger";
import * as uuid from "uuid";
// TODO: Implement todos businesslogic

const todosAccess = new TodosAccess();
const attachmentUtils = new AttachmentUtils();
const logger = createLogger("todos");

export const getTodos = async (userId: string): Promise<TodoItem[]> => {
  return await todosAccess.getTodos(userId);
};

export async function createTodo(
  createTodoRequest: CreateTodoRequest,
  userId: string
): Promise<TodoItem> {
  try {
    logger.info(`Creating a To Do item `);
    const todoId = uuid.v4();

    return await todosAccess.createTodo({
      todoId: todoId,
      userId: userId,
      done: false,
      attachmentUrl: "",
      createdAt: new Date().toISOString(),
      name: createTodoRequest.name,
      dueDate: createTodoRequest.dueDate,
    });
  } catch (e) {
    console.log(e);
  }
}

export const getTodo = async (
  todoId: string,
  userId: string
): Promise<TodoItem> => {
  try {
    logger.info(`Getting todo item`);

    return await todosAccess.getTodo(todoId, userId);
  } catch (e) {
    console.log(e);
  }
};

export async function updateTodo(
  userId: string,
  todoId: string,
  updateTodoRequest: UpdateTodoRequest
) {
  try {
    logger.info(`Update todo item`);
    const item = await todosAccess.getTodo(todoId, userId);

    if (item.userId !== userId) {
      logger.error(`Can not update this item`);
      throw new Error("Can not update this item");
    }

    return await todosAccess.updateTodo(todoId, updateTodoRequest, userId);
  } catch (e) {
    console.log(e);
  }
}

export async function updateUrl(
  userId: string,
  todoId: string,
  attachmentURL: string
) {
  try {
    logger.info(`Updating URL`);

    const item = await todosAccess.getTodo(todoId, userId);

    if (item.userId !== userId) {
      logger.error(`Failed to update url`);
      throw new Error("Failed to update url");
    }

    return await todosAccess.updateUrl(todoId, attachmentURL, userId);
  } catch (e) {
    console.log(e);
  }
}

export async function deleteTodo(userId: string, todoId: string) {
  try {
    const item = await todosAccess.getTodo(todoId, userId);

    if (item.userId !== userId) {
      logger.error(`Failed to delete item`);
      throw new Error("Failed to delete item");
    }
    logger.info(`Deleting item`);

    return await todosAccess.deleteTodo(todoId, userId);
  } catch (e) {
    console.log(e);
  }
}

export const getUploadUrl = (attachmentId: string) =>
  attachmentUtils.getUploadUrl(attachmentId);

export const getAttachmentUrl = (attachmentId: string) =>
  attachmentUtils.getAttachmentUrl(attachmentId);

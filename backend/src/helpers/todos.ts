import { TodoAccess } from './todosAcess'
import { AttachmentUtils } from './attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import * as createError from 'http-errors'
import { parseUserId } from '../auth/utils';


const todoAccess = new TodoAccess();

export async function getAllTodos(): Promise<TodoItem[]> {
  return todoAccess.getAllTodos();
}

export async function createTodo(
  createTodoRequest: CreateTodoRequest,
  jwtToken: string
): Promise<TodoItem> {

  const itemId = uuid.v4();
  const userId = parseUserId(jwtToken);

  return await todoAccess.createTodo({
      userId:userId,
      todoId:itemId,
      name:createTodoRequest.name,
      dueDate:createTodoRequest.dueDate,
      createdAt:new Date().toISOString(),
      done:false,
  })
}


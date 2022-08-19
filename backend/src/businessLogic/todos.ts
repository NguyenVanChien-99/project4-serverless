import { TodoAccess } from '../dataLayer/todosAcess'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import { TodoUpdate } from '../models/TodoUpdate'


const todoAccess = new TodoAccess();
const logger = createLogger("todo")

export async function getAllTodos(userId:string): Promise<TodoItem[]> {
  return todoAccess.getAllTodos(userId);
}

export async function createTodo(
  createTodoRequest: CreateTodoRequest,
  userId: string
): Promise<TodoItem> {

  const itemId = uuid.v4();

  return await todoAccess.createTodo({
      userId:userId,
      todoId:itemId,
      name:createTodoRequest.name,
      dueDate:createTodoRequest.dueDate,
      createdAt:new Date().toISOString(),
      done:false,
  })
}

export async function deleteTodo(
  itemId :string,
  userId: string
) {
    const item = todoAccess.getTodoById(itemId)
    logger.info(`Delete item :${item}`)
    if((await item).userId!==userId){
      logger.error(`User ${userId} cannot perform this action`)
      throw new Error(`User ${userId} cannot perform this action`)
    }
    await todoAccess.deleteTodo(itemId);
}

export async function updateTodo(
  itemId :string,
  userId: string,
  updatedTodo :UpdateTodoRequest
) {
    const item = todoAccess.getTodoById(itemId)
    logger.info(`Delete item :${item}`)
    if((await item).userId!==userId){
      logger.error(`User ${userId} cannot perform this action`)
      throw new Error(`User ${userId} cannot perform this action`)
    }
    await todoAccess.updateTodo(itemId,updatedTodo as TodoUpdate)
}

export async function updateTodoAttachmentUrl(
  itemId :string,
  userId: string,
  attachmentUrl:string
) {
    const item = todoAccess.getTodoById(itemId)
    logger.info(`Delete item :${item}`)
    if((await item).userId!==userId){
      logger.error(`User ${userId} cannot perform this action`)
      throw new Error(`User ${userId} cannot perform this action`)
    }
    await todoAccess.updateTodoAttachmentUrl(itemId,attachmentUrl)
}
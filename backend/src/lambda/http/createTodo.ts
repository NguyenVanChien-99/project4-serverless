import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { getUserId } from '../utils';
import { createTodo } from '../../businessLogic/todos'
import { createLogger } from '../../utils/logger'


const logger = createLogger("createTodo")

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const newTodo: CreateTodoRequest = JSON.parse(event.body)
    if(!newTodo.name||newTodo.name.trim()==""){
      return {
        statusCode: 400,
        body: JSON.stringify({
          error : `Todo name is required`
        })
      }
    }
    if(!newTodo.dueDate||newTodo.dueDate.trim()==""){
      return {
        statusCode: 400,
        body: JSON.stringify({
          error : `Todo dueDate is required`
        })
      }
    }

    const userId=getUserId(event);
    logger.info(`User ${userId} create new todo item ${newTodo}`)
    try {
      const todoItem =await createTodo(newTodo,userId)
      return {
        statusCode: 201,
        body: JSON.stringify({item:todoItem})
      }
    } catch (err) {
      logger.error(`Fail to create new todo , error ${err}`)
      return {
        statusCode: 500,
        body: JSON.stringify({
          error : `Fail to create new todo , error ${err}`
        })
      }
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)

import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { updateTodo } from '../../businessLogic/todos'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'

const logger = createLogger("updateTodo")

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)

    if(!todoId||todoId.trim()===""){
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: `Invalid todo id`
        })
      }
    }
    if(!updatedTodo.name||updatedTodo.name.trim()==""){
      return {
        statusCode: 400,
        body: JSON.stringify({
          error : `Todo name is required`
        })
      }
    }
    if(!updatedTodo.dueDate||updatedTodo.dueDate.trim()==""){
      return {
        statusCode: 400,
        body: JSON.stringify({
          error : `Todo dueDate is required`
        })
      }
    }
    if(updatedTodo.done===undefined){
      return {
        statusCode: 400,
        body: JSON.stringify({
          error : `Todo dueDate is required`
        })
      }
    }

    let userId:string
    try{
      userId= getUserId(event);
    }catch(err){
      return {
        statusCode: 401,
        body: JSON.stringify({
          error : `Invalid token`
        })
      }
    }
    logger.info(`User ${userId} update todo item id ${todoId} ${updatedTodo}`)


    try {
      //update item attachment url
      await updateTodo(todoId,userId,updatedTodo)
    } catch (error) {
      return {
        statusCode: 401,
        body: JSON.stringify({
          error:`Fail to update TODO ,error ${error}`
        })
      }
    }

    return{
      statusCode: 200,
      body: JSON.stringify({})
    }
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )

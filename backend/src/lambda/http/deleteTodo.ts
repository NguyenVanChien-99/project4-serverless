import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { deleteTodo } from '../../businessLogic/todos'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'

const logger = createLogger("deleteTodo")

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    if(!todoId||todoId.trim()===""){
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: `Invalid todo id`
        })
      }
    }

    try {
      const userId = getUserId(event);
      await deleteTodo(todoId,userId);
    } catch (err) {
      logger.error(`Fail to delete todo ${todoId}, error ${err}`)
      return {
        statusCode: 401,
        body: JSON.stringify({
          error: `Fail to delete todo ${todoId}, error ${err}`
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

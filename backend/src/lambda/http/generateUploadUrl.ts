import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import * as uuid from 'uuid'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { generatePresignedUrl } from '../../dataLayer/attachmentUtils'
import { TodoAccess } from '../../dataLayer/todosAcess'
import { createLogger } from '../../utils/logger'
import { updateTodoAttachmentUrl } from '../../businessLogic/todos'
import { getUserId } from '../utils'


const todoAccess = new TodoAccess();
const logger = createLogger("generateUploadUrl");

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId

    try {
      validateTodoItem(todoId)
    } catch (err) {
      logger.error(`Fail to get Todo with id ${todoId}, error ${err}`)
      return {
        statusCode: 400,
        body: JSON.stringify({
          error : `Fail to get Todo with id ${todoId}, error ${err}`
        })
      }
    }

    // Write your code here
    const userId=getUserId(event);

    const imageId = uuid.v4()

    const url = generatePresignedUrl(imageId)

    try {
      //update item attachment url
      await updateTodoAttachmentUrl(todoId,userId,url)
    } catch (error) {
      return {
        statusCode: 401,
        body: JSON.stringify({
          error:`Fail to update attachment URL ,error ${error}`
        })
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        imageId: imageId,
        presignedUrl: url
      })
    }
  }
)


function validateTodoItem(todoId: String) {
  if (!todoId || todoId.trim() === "") {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: "Invalid todo id"
      })
    }
  }
  todoAccess.getTodoById(todoId)
}

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )

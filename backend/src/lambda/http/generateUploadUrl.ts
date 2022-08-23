import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import * as uuid from 'uuid'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { generatePresignedUrl, getAttachmentUrl } from '../../dataLayer/attachmentUtils'
import { TodoAccess } from '../../dataLayer/todosAcess'
import { createLogger } from '../../utils/logger'
import { updateTodoAttachmentUrl } from '../../businessLogic/todos'
import { getUserId } from '../utils'


const todoAccess = new TodoAccess();
const logger = createLogger("generateUploadUrl");

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId

    // Write your code here
    const userId = getUserId(event);

    if (!todoId || todoId.trim() === "") {
      logger.error(`Invalid todo id ${todoId}`)
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: `Invalid todo id ${todoId}`
        })
      }
    }

    const todoItem =await todoAccess.getTodoById(todoId, userId);

    const imageId = uuid.v4()

    const url = generatePresignedUrl(imageId)

    try {
      //update item attachment url
      await updateTodoAttachmentUrl(todoItem, userId, getAttachmentUrl(imageId))
    } catch (error) {
      logger.error(`Fail to update attachment url ,error ${error}`)
      return {
        statusCode: 401,
        body: JSON.stringify({
          error: `Fail to update attachment URL ,error ${error}`
        })
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        imageId: imageId,
        uploadUrl: url
      })
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

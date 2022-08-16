import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';

const XAWS = AWSXRay.captureAWS(AWS)
const logger = createLogger('TodosAccess')
const imageIdIndex = process.env.IMAGE_ID_INDEX

export class TodoAccess {

    constructor(
        private readonly docClient: DocumentClient = createDynamoDBClient(),
        private readonly todosTable = process.env.TODOS_TABLE) {
    }

    async getTodoById(todoId: String): Promise<TodoItem> {
        logger.info("Get all todo item from dynamodb");

        const result = await this.docClient.scan({
            TableName: this.todosTable,
            IndexName: imageIdIndex,
            KeyConditionExpression: 'todoId = :todoId',
            ExpressionAttributeValues: {
                ':todoId': todoId
            }
        }).promise()

        if (result.Count == 0) {
            throw new Error(`Todo not found with id ${todoId}`)
        }

        const items = result.Items[0]
        return items as TodoItem
    }

    async getAllTodos(): Promise<TodoItem[]> {
        logger.info("Get all todo item from dynamodb");

        const result = await this.docClient.scan({
            TableName: this.todosTable
        }).promise()

        const items = result.Items
        return items as TodoItem[]
    }

    async createTodo(todo: TodoItem): Promise<TodoItem> {
        logger.info("Save todo item to dynamodb", todo);
        await this.docClient.put({
            TableName: this.todosTable,
            Item: todo
        }).promise()

        return todo
    }

    async updateTodo(todoId: String, todo: TodoUpdate,attachmentUrl:String) {
        logger.info(`Update todo item to dynamodb ${todoId}`, todo);
        await this.docClient.update({
            TableName: this.todosTable,
            Key: {
                todoId: todoId
            },
            UpdateExpression: "set name = :name , dueDate = :dueDate , done = :done , attachmentUrl = : url",
            ExpressionAttributeValues: {
                ":name": todo.name,
                ":dueDate": todo.dueDate,
                ":done": todo.done,
                ":url": attachmentUrl
            },
            ReturnValues: "UPDATED_NEW"
        }).promise()

        return 
    }
}

function createDynamoDBClient() {
    if (process.env.IS_OFFLINE) {
        logger.info('Creating a local DynamoDB instance')
        return new XAWS.DynamoDB.DocumentClient({
            region: 'localhost',
            endpoint: 'http://localhost:8000'
        })
    }

    return new XAWS.DynamoDB.DocumentClient()
}

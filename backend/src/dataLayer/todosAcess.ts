import * as AWS from 'aws-sdk'
const AWSXRay = require('aws-xray-sdk');
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';

const XAWS = AWSXRay.captureAWS(AWS)
const logger = createLogger('TodosAccess')

export class TodoAccess {

    constructor(
        private readonly docClient: DocumentClient = createDynamoDBClient(),
        private readonly todosTable = process.env.TODOS_TABLE) {
    }

    async getTodoById(todoId: String): Promise<TodoItem> {
        logger.info("Get all todo item from dynamodb");

        const result = await this.docClient.get({
            TableName: this.todosTable,
            Key:{
                todoId: todoId
            },
        }).promise()

        if (!result.Item) {
            throw new Error(`Todo not found with id ${todoId}`)
        }

        const items = result.Item
        return items as TodoItem
    }

    async getAllTodos(userId:string): Promise<TodoItem[]> {
        logger.info("Get all todo item from dynamodb");

        const result = await this.docClient.scan({
            TableName: this.todosTable,
            FilterExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
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

    async updateTodo(todoId: String, todo: TodoUpdate) {
        logger.info(`Update todo item to dynamodb ${todoId}`, todo);
        await this.docClient.update({
            TableName: this.todosTable,
            Key: {
                todoId: todoId
            },
            UpdateExpression: "set name = :name , dueDate = :dueDate , done = :done",
            ExpressionAttributeValues: {
                ":name": todo.name,
                ":dueDate": todo.dueDate,
                ":done": todo.done,
            },
            ReturnValues: "UPDATED_NEW"
        }).promise()

        return 
    }

    async updateTodoAttachmentUrl(todoId: String, attachmentUrl:string) {
        logger.info(`Update todo attachment ${todoId}`);
        await this.docClient.update({
            TableName: this.todosTable,
            Key: {
                todoId: todoId
            },
            UpdateExpression: "attachmentUrl = :attachmentUrl",
            ExpressionAttributeValues: {
                ":attachmentUrl": attachmentUrl,
            },
            ReturnValues: "UPDATED_NEW"
        }).promise()

        return 
    }

    async deleteTodo(todoId :string){
        logger.info(`Start delete todo from dynamodb `)
        await this.docClient.delete({
            TableName: this.todosTable,
            Key: {
                todoId: todoId
            },
            ReturnValues:"DELETED"
        }).promise();
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

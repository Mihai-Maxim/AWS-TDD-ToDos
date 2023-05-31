import { ApiHandler } from "sst/node/api";
import { Time } from "../../../core/src/time";
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { Table } from "sst/node/table"

const dynamoDb = new DocumentClient();

export const handler = ApiHandler(async (_evt) => {

  const method = _evt.requestContext.http.method

  if (method === "POST") {

    let body = null

    try {
      body = await JSON.parse(_evt.body as string)
    } catch (err) {
  
      return {
        statusCode: 400,
        body: 'Invalid JSON body',
      };
    }

    const { title, description, completed } = body

    if (!title || typeof title !== "string") {
      return {
        statusCode: 400,
        body: 'Title of type string is required.',
      };
    }

    if (description && typeof description !== "string") {
      return {
        statusCode: 400,
        body: 'Description must be a string',
      };
    }

    if (completed !== undefined && completed !== false) {
      return {
        statusCode: 400,
        body: 'You cannot insert a completed todo!',
      };
    }

    const validData = {
      title,
      description: description || '',
      completed: completed || false,
    };
  
    const id = uuidv4()
  
    const todoItem = {
      id,
      ...validData,
    };

    try {
      await dynamoDb
        .put({
          TableName: Table.TodoTable.tableName,
          Item: todoItem,
        })
        .promise();

        if (todoItem.description === "") delete todoItem.description

      return {
        statusCode: 201,
        body: JSON.stringify(todoItem),
      };
    } catch (e) {
      console.error('Error inserting item into DynamoDB:', e);
      return {
        statusCode: 500,
        body: 'Error inserting item into DynamoDB.',
      };
    } 
  }

  if (method === "GET") {
    try {
      const result = await dynamoDb
        .scan({
          TableName: Table.TodoTable.tableName,
        })
        .promise();
  
      let todos = result.Items?.map(todo => {
        todo.description === '' ? delete todo.description : null
        return todo
      });
  
      return {
        statusCode: 200,
        body: JSON.stringify(todos),
      };

    } catch (error) {
      console.error('Error querying todos:', error);
      return {
        statusCode: 500,
        body: 'Error querying todos.',
      };
    }
  }
  return {
    body: `Hello world. The time is ${Time.now()}`,
  };
});

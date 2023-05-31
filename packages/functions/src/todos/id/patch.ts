import { ApiHandler } from "sst/node/api";
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { Table } from "sst/node/table"

const dynamoDb = new DocumentClient();

export const handler = ApiHandler(async (_evt) => {

  const { id } = _evt.pathParameters as any

  try {

    const result = await dynamoDb
      .get({
        TableName: Table.TodoTable.tableName,
        Key: {
          id
        },
      })
      .promise();

    const todo = result.Item;

    if (!todo) return {
        statusCode: 404,
        body: 'Todo not found.',
    };

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

    if (title && typeof title !== "string") {
      return {
        statusCode: 400,
        body: 'Title must be string..',
      };
    }

    if (description && typeof description !== "string") {
      return {
        statusCode: 400,
        body: 'Description must be a string',
      };
    }

    if (completed !== undefined && (typeof completed !== "boolean")) {
      return {
        statusCode: 400,
        body: 'Completed must be a boolean!',
      };
    }

    const newData: {
      title: string,
      description?: string,
      completed: boolean
    } = {
      title,
      completed: completed || false,
    };

    description ? newData.description = description : newData.description = todo.description

    completed ? newData.completed = completed : newData.completed = todo.completed

    title ? newData.title = title : newData.title = todo.title

    try {
        const updateParams = {
          TableName: Table.TodoTable.tableName,
          Key: {
            id: id,
          },
          UpdateExpression: 'SET title = :title, description = :description, completed = :completed',
          ExpressionAttributeValues: {
            ':title': newData.title,
            ':description': newData.description,
            ':completed': newData.completed,
          },
          ReturnValues: 'ALL_NEW',
        };

        const result = await dynamoDb.update(updateParams).promise();

        console.log(result)

        const updatedTodo = result.Attributes;
  
        return {
          statusCode: 200,
          body: JSON.stringify(updatedTodo),
        };

      } catch (error) {
        console.error('Error updating todo:', error);
        return {
          statusCode: 500,
          body: 'Error updating todo.',
        };
      }
    
  } catch (error) {
    console.error('Error retrieving todo:', error);
    return {
      statusCode: 500,
      body: 'Error retrieving todo.',
    };
  }
 
});


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

    const deleteParams = {
        TableName: Table.TodoTable.tableName,
        Key: {
          id
        },
      };
  
      await dynamoDb.delete(deleteParams).promise();
  
      return {
        statusCode: 204,
        body: '',
      };
    
  } catch (error) {
    console.error('Error retrieving todo:', error);
    return {
      statusCode: 500,
      body: 'Error retrieving todo.',
    };
  }
 
});



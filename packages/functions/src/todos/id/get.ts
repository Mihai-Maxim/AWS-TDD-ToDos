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

    if (todo) {
      return {
        statusCode: 200,
        body: JSON.stringify(todo),
      };
    } else {
      return {
        statusCode: 404,
        body: 'Todo not found.',
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

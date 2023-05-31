import { ApiHandler } from "sst/node/api";
import { Time } from "../../../core/src/time";
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { Table } from "sst/node/table"

const dynamoDb = new DocumentClient();

export const handler = ApiHandler(async (_evt) => {
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
})

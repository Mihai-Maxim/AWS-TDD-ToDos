import { StackContext, Api, Table } from "sst/constructs";

export function API({ stack }: StackContext) {
  
  const todoTable = new Table(stack, 'TodoTable', {
    fields: {
      id: 'string',
      title: 'string',
      description: 'string',
      completed: 'string',
    },
    primaryIndex: { partitionKey: 'id' },
  });

  const api = new Api(stack, "api", {
    defaults: {
      function: {
        bind: [todoTable],
        permissions: ["dynamodb"]
      }
    },
    routes: {
      "GET /todos": "packages/functions/src/todos/get.handler",
      "POST /todos": "packages/functions/src/todos/post.handler",
      "GET /todos/{id}": "packages/functions/src/todos/id/get.handler",
      "PUT /todos/{id}": "packages/functions/src/todos/id/put.handler",
      "PATCH /todos/{id}": "packages/functions/src/todos/id/patch.handler",
      "DELETE /todos/{id}": "packages/functions/src/todos/id/delete.handler"
    },
  });

  stack.addOutputs({
    ApiEndpoint: api.url,
  });
}



import { expect, it, describe } from "vitest";
import { Api } from "sst/node/api";
import fetch from "node-fetch"


describe("POST /todos", () => {

    describe("given correct todo data", () => {

        const validToDoData = {
            title: "Hello",
            description: "this is a valid toDo",
            completed: true
        }

        it("should post a todo", async () => {
            const app_url = Api.api.url
          
            const response = await fetch(app_url, {
                method: "POST",
                body: JSON.stringify(validToDoData)
            })

            expect(response.status).toBe(201)

            const body = await response.json()

            delete (body as any).id

            expect(body).toEqual(validToDoData)
          
          });
    })
})

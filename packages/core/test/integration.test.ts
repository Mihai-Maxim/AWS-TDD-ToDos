import { expect, it, describe } from "vitest";
import { Api } from "sst/node/api";
import fetch, { Headers } from "node-fetch"

const app_url = Api.api.url

const insertTodo = async (todo: any) => {
    return fetch(app_url, {
        method: "POST",
        body: JSON.stringify(todo),
        headers: {
            "Content-Type": "application/json"
        }
    })
}

const getAllTodos = async () => {
    const response = await fetch(app_url)

    const body = await response.json()

    return body
}

const getValidToDoAt = async (at: number): Promise<any> => {
    const allToDos = await getAllTodos() as Array<any>

    if (at < allToDos.length) {
        return allToDos[at]
    }
    return allToDos[allToDos.length]
}

const getToDoById = async (id: string): Promise<any> => {
    const response = await fetch(`${app_url}/${id}`)
    const body = await response.json()

    return body
}
          
describe("POST /todos", () => {

    describe("given valid todo data", () => {

        const validToDoData = {
            title: "Hello",
            description: "this is a valid toDo",
        }

        const validToDoDataOnlyTitle = {
            title: "Only title here",
        }


        it("should post a todo", async () => {
          
            const response = await fetch(app_url, {
                method: "POST",
                body: JSON.stringify(validToDoData),
                headers: {
                    "Content-Type": "application/json"
                }
            })

            expect(response.status).toBe(201)

            const body = await response.json() as any

            expect(body).toBeDefined()

            delete body.id

            expect(body).toEqual(validToDoData)
          
        });


        it("should post a todo with only the title", async () => {
          
            const response = await fetch(app_url, {
                method: "POST",
                body: JSON.stringify(validToDoDataOnlyTitle),
                headers: {
                    "Content-Type": "application/json"
                }
            })

            expect(response.status).toBe(201)

            const body = await response.json() as any

            expect(body).toBeDefined()

            delete body.id

            expect(body).toEqual({
                title: "Only title here",
                completed: false
            })
          
        });
    })

    describe("given invalid todo data", () => {
        const invalidToDoDataMissingTitle = {
            description: "this is a valid toDo",
        }

        const invalidToDoDataNotString = {
            title: 123,
            description: 999
        }


        it("should return 400 if title is missing", async () => {
            const response = await fetch(app_url, {
                method: "POST",
                body: JSON.stringify(invalidToDoDataMissingTitle),
                headers: {
                    "Content-Type": "application/json"
                }
            })

            expect(response.status).toBe(400)
        })

        it("should return 400 if title or description are not of type string", async () => {

            const response = await fetch(app_url, {
                method: "POST",
                body: JSON.stringify(invalidToDoDataNotString),
                headers: {
                    "Content-Type": "application/json"
                }
            })

            expect(response.status).toBe(400)
        })
    })
})

describe("GET /todos", () => {
    describe("given that some todos were inserted", () => {

        const firstToDoToInsert = {
            title: "first ToDo title " + new Date().toISOString(),
            description: "first ToDo description"

        }

        const secondToDoToInsert = {
            title: "second ToDo title " +  new Date().toISOString(),
            description: "second ToDo description"
        }

        it("the todos should include the previously inserted todos", async () => {
            await insertTodo(firstToDoToInsert)

            await insertTodo(secondToDoToInsert)

            const response = await fetch(app_url)

            expect(response.status).toBe(200)

            const body = await response.json() as any

            expect(typeof body).toBe("array")

            expect(body.length).toBeGreaterThan(1)

            const hasBothTodos = body.map((todo: any) => {
               return (todo.description === firstToDoToInsert.description && todo.title === firstToDoToInsert.title) ||
                      (todo.description === secondToDoToInsert.description && todo.title === secondToDoToInsert.title)
            })

            expect(hasBothTodos.length).toBe(2)
        })
    })
})

describe("GET /todos/:id", () => {

    describe("given a valid todo id", () => {

        it("should return the corresponding todo for that id", async () => {

            const validToDo = await getValidToDoAt(0)

            const validToDoId = validToDo.id

            const response = await fetch(`${app_url}/${validToDoId}`)

            expect(response.status).toBe(200)

            const body = await response.json() as any

            expect(body).toEqual(validToDo)
        })
    })

    describe("given an invalid todo id", () => {
        it("should return 404", async () => {
            const response = await fetch(`${app_url}/invalid`)
            expect(response.status).toBe(404)
        })
    })
})

describe("PUT /todos/:id", () => {

    describe("given a valid todo id", () => {

        describe("given valid put data", () => {
            const validToDoPutData = {
                title: "this is an update",
                description: "the task has been completed",
                completed: true
            }

            it("should update the todo with the new put data", async () => {
                
                const validToDo = await getValidToDoAt(1)

                const validToDoId = validToDo.id

                const response = await fetch(`${app_url}/${validToDoId}`, {
                    method: "PUT",
                    body: JSON.stringify(validToDoPutData),
                    headers: {
                        "Content-Type": "application/json"
                    }
                })

                expect(response).toBe(200)

                const body = await response.json() as any

                delete body.id

                expect(body).toEqual(validToDoPutData)


                const validToDoRefetch = await getToDoById(validToDoId)

                delete validToDoRefetch.id

                expect(validToDoRefetch).toEqual(validToDoPutData)


            })
        })

        describe("given invalid put data", () => {
            const invalidPutData = {
                title: "this is an invalid update",
                description: "all "
            } // missing completed status

            const invalidPutDataWrongTypes = {
                title: 123,
                description: 213124,
                completed: "maybe"
            }

            it("should return 400 if not all required fields are present (title, completed)", async () => {

                const validToDo = await getValidToDoAt(1)

                const validToDoId = validToDo.id

                const response = await fetch(`${app_url}/${validToDoId}`, {
                    method: "PUT",
                    body: JSON.stringify(invalidPutData),
                    headers: {
                        "Content-Type": "application/json"
                    }
                })

                expect(response).toBe(400)

            })

            it("should return 400 if put data contains invalid types for (title, completed, description)", async () => {
                const validToDo = await getValidToDoAt(1)

                const validToDoId = validToDo.id

                const response = await fetch(`${app_url}/${validToDoId}`, {
                    method: "PUT",
                    body: JSON.stringify(invalidPutDataWrongTypes),
                    headers: {
                        "Content-Type": "application/json"
                    }
                })

                expect(response).toBe(400)
                
            })
        })
    })

    describe("given an invalid todo id", () => {

        const validToDoPutData = {
            title: "this is an update",
            description: "the task has been completed",
            completed: true
        }

        it("should return 404", async () => {
            const response = await fetch(`${app_url}/invalid_id`, {
                method: "PUT",
                body: JSON.stringify(validToDoPutData),
                headers: {
                    "Content-Type": "application/json"
                }
            })

            expect(response).toBe(404)
        })
    })
    
})

describe("PATCH /todos/:id", () => {

    describe("given a valid todo id", () => {

        describe("given valid patch data", () => {

            const validToDoPatchData = {
                title: "this is an update",
                description: "the task has been completed",
                completed: true
            }

            const validToDoPatchDataOnlyTitle = {
                title: "only title should be updated"
            }

            const newToDoCompletedFalse = {
                title: "this is just a random todo",
                description: "hello there",
                completed: false

            }

            const validToDoPatchDataOnlyCompleted = {
                completed: true
            }

            it("should update the todo with the new patch data", async () => {
                
                const validToDo = await getValidToDoAt(0)

                const validToDoId = validToDo.id

                const response = await fetch(`${app_url}/${validToDoId}`, {
                    method: "PATCH",
                    body: JSON.stringify(validToDoPatchData),
                    headers: {
                        "Content-Type": "application/json"
                    }
                })

                expect(response).toBe(200)

                const body = await response.json() as any

                delete body.id

                expect(body).toEqual(validToDoPatchData)


                const validToDoRefetch = await getToDoById(validToDoId)

                delete validToDoRefetch.id

                expect(validToDoRefetch).toEqual(validToDoPatchData)


            })

            it("should update a todo with partial new patch data (only title)", async () => {
                const validToDo = await getValidToDoAt(1)

                const validToDoId = validToDo.id

                const response = await fetch(`${app_url}/${validToDoId}`, {
                    method: "PATCH",
                    body: JSON.stringify(validToDoPatchDataOnlyTitle),
                    headers: {
                        "Content-Type": "application/json"
                    }
                })

                expect(response).toBe(200)

                const body = await response.json() as any

                expect(body.title).toBe(validToDoPatchDataOnlyTitle.title)

                expect(body.title).not.toBe(validToDo.title)

                expect(body.completed).toBe(validToDo.completed)
            })

            it("should update a todo with partial new patch data (only completed)", async () => {
                const insertedToDo = await insertTodo(newToDoCompletedFalse) as any

                const insertedToDoId = insertedToDo.id

                const response = await fetch(`${app_url}/${insertedToDoId}`, {
                    method: "PATCH",
                    body: JSON.stringify(validToDoPatchDataOnlyCompleted),
                    headers: {
                        "Content-Type": "application/json"
                    }
                })

                expect(response).toBe(200)

                const body = await response.json() as any

                expect(body.completed).toBe(validToDoPatchDataOnlyCompleted.completed)
                
                expect(body.title).toBe(insertedToDo.title)

                expect(body.description).toBe(insertedToDo.description)

            })
        })

        describe("given invalid patch data", () => {
            const invalidPutData = {
                title: 1,
                description: 2,
                completed: "i don't know"
            } 

            it("should return 400", async () => {

                const validToDo = await getValidToDoAt(1)

                const validToDoId = validToDo.id

                const response = await fetch(`${app_url}/${validToDoId}`, {
                    method: "PATCH",
                    body: JSON.stringify(invalidPutData),
                    headers: {
                        "Content-Type": "application/json"
                    }
                })

                expect(response).toBe(400)

            })
        })
    })

    describe("given an invalid todo id", () => {

        const validToDoPatchData = {
            title: "this is an update",
            description: "the task has been completed",
            completed: true
        }

        it("should return 404", async () => {
            const response = await fetch(`${app_url}/invalid_id`, {
                method: "PATCH",
                body: JSON.stringify(validToDoPatchData),
                headers: {
                    "Content-Type": "application/json"
                }
            })

            expect(response).toBe(404)
        })
    })
    
})

describe("DELETE /todos/:id", () => {
    describe("given a valid todo id", () => {
        it("should delete the todo", async () => {
            const validToDo = await getValidToDoAt(0)

            const validToDoId = validToDo.id

            const response = await fetch(`${app_url}/${validToDoId}`, {
                method: "DELETE",
            })

            expect(response.status).toBe(204)

            const refetch = await fetch(`${app_url}/${validToDoId}`)

            expect(refetch.status).toBe(404)
        })
    })
    describe("given an invalid todo id", () => {
        it("should return 404", async () => {
            const response = await fetch(`${app_url}/invalid`, {
                method: "DELETE",
            })
            expect(response.status).toBe(404)
        })
    })
})






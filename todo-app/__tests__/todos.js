const request = require("supertest");

const db = require("../models/index");
const app = require("../app");

let server, agent;

describe("Todo test Suit", () => {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
    server = app.listen(3000, () => {});
    agent = request.agent(server);
  });

  afterAll(async () => {
    await db.sequelize.close();
    server.close();
  });

  test("Responds with json at /todos", async () => {
    const response = await agent.post("/todos").send({
      title: "Buy milk",
      dueDate: new Date().toISOString().split("T")[0],
      completed: false,
    });
    expect(response.statusCode).toBe(200);
    expect(response.header["content-type"]).toBe(
      "application/json; charset=utf-8"
    );
    const parsedResponse = JSON.parse(response.text);
    expect(parsedResponse.id).toBeDefined();
  });

  test("Mark a todo as complete.", async () => {
    const response = await agent.post("/todos").send({
      title: "Buy milk",
      dueDate: new Date().toISOString().split("T")[0],
      completed: false,
    });
    const parsedResponse = JSON.parse(response.text);
    const todoID = parsedResponse.id;

    expect(parsedResponse.completed).toBe(false);

    const markAsCompleteResponse = await agent
      .put(`/todos/${todoID}/markAsCompleted`)
      .send();
    // console.log(markAsCompleteResponse.text);
    const parsedUpdateResponse = JSON.parse(markAsCompleteResponse.text);
    expect(parsedUpdateResponse.completed).toBe(true);
  });

  test("Tests for DELETE /todos/:id endpoint using Jest", async () => {
    const response = await agent.post("/todos").send({
      title: "Buy milk",
      dueDate: new Date().toISOString().split("T")[0],
      completed: false,
    });
    const parsedResponse = JSON.parse(response.text);
    const todoID = parsedResponse.id;

    const deleteResponse = await agent.delete(`/todos/${todoID}`).send();
    const parsedDeleteResponse = JSON.parse(deleteResponse.text);
    expect(parsedDeleteResponse).toBe(true);

    // const verifyDeletionResponse = await agent.get("/todos").send();
    // const parsedVerifyDeletionResponse = JSON.parse(
    //   verifyDeletionResponse.text
    // );
    // expect(parsedVerifyDeletionResponse).toEqual([]);
  });
});

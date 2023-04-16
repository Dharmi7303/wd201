const request = require("supertest");
const cheerio = require("cheerio");

const db = require("../models/index");
const app = require("../app");

let server, agent;

function extractCsrfToken(res) {
  const $ = cheerio.load(res.text);
  return $("[name=_csrf]").val();
}

async function updateTodo(latestTodo) {
  const res = await agent.get("/");
  const csrfToken = extractCsrfToken(res);
  const markAsCompleteResponse = await agent
    .put(`/todos/${latestTodo.id}`)
    .send({
      _csrf: csrfToken,
    });

  const parsedUpdateResponse = JSON.parse(markAsCompleteResponse.text);
  return parsedUpdateResponse.completed;
}

describe("Todo test Suit", () => {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
    server = app.listen(4000, () => {});
    agent = request.agent(server);
  });

  afterAll(async () => {
    await db.sequelize.close();
    server.close();
  });

  test("creating a to-do", async () => {
    const res = await agent.get("/");
    const csrfToken = extractCsrfToken(res);

    const response = await agent.post("/todos").send({
      title: "Buy milk",
      dueDate: new Date().toISOString().split("T")[0],
      completed: false,
      _csrf: csrfToken,
    });
    expect(response.statusCode).toBe(302);
  });

  test("updating a to-do", async () => {
    let res = await agent.get("/");
    let csrfToken = extractCsrfToken(res);

    await agent.post("/todos").send({
      title: "Buy milk",
      dueDate: new Date().toISOString().split("T")[0],
      completed: false,
      _csrf: csrfToken,
    });

    const groupedTodoResponse = await agent
      .get("/")
      .set("Accept", "application/json");

    const parsedResponse = JSON.parse(groupedTodoResponse.text);
    const dueTodayCount = parsedResponse.dueToday.length;
    const latestTodo = parsedResponse.dueToday[dueTodayCount - 1];

    expect(await updateTodo(latestTodo)).toBe(true);
    expect(await updateTodo(latestTodo)).toBe(false);
  });

  test("deleting a to-do", async () => {
    let res = await agent.get("/");
    let csrfToken = extractCsrfToken(res);

    await agent.post("/todos").send({
      title: "Buy milk",
      dueDate: new Date().toISOString().split("T")[0],
      completed: false,
      _csrf: csrfToken,
    });

    const groupedTodoResponse = await agent
      .get("/")
      .set("Accept", "application/json");

    const parsedResponse = JSON.parse(groupedTodoResponse.text);
    const dueTodayCount = parsedResponse.dueToday.length;
    const latestTodo = parsedResponse.dueToday[dueTodayCount - 1];

    res = await agent.get("/");
    csrfToken = extractCsrfToken(res);

    const deleteResponse = await agent.delete(`/todos/${latestTodo.id}`).send({
      _csrf: csrfToken,
    });
    const parsedDeleteResponse = JSON.parse(deleteResponse.text);
    expect(parsedDeleteResponse.success).toBe(true);
  });
});

const request = require("supertest");
var cheerio = require("cheerio");
const db = require("../models/index");
const app = require("../app");

let server, agent;

function extractCsrfToken(res) {
  var $ = cheerio.load(res.text);
  return $("[name=_csrf]").val();
}

const login = async (agent, username, password) => {
  let res = await agent.get("/login");
  let csrfToken = extractCsrfToken(res);
  res = await agent.post("/session").send({
    email: username,
    password: password,
    _csrf: csrfToken,
  });
};

describe("Todo Application", function () {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
    server = app.listen(4000, () => {});
    agent = request.agent(server);
  });

  afterAll(async () => {
    try {
      await db.sequelize.close();
      await server.close();
    } catch (error) {
      console.log(error);
    }
  });

  test("Sign up", async () => {
    let res = await agent.get("/signup");
    const csrfToken = extractCsrfToken(res);
    res = await agent.post("/users").send({
      firstName: "sonthos",
      lastName: "M",
      email: "sonthos@gmail.com",
      password: "12345678",
      "_csrf": csrfToken, //prettier-ignore
    });
    expect(res.statusCode).toBe(302);
  });

  test("Sign out", async () => {
    let res = await agent.get("/todos");
    expect(res.statusCode).toBe(200);
    res = await agent.get("/signout");
    expect(res.statusCode).toBe(302);
    res = await agent.get("/todos");
    expect(res.statusCode).toBe(302);
  });

  test("Creates a new todos", async () => {
    const agent = request.agent(server);
    await login(agent, "sonthos@gmail.com", "12345678");
    let res = await agent.get("/todos");
    let csrfToken = extractCsrfToken(res);
    const response = await agent.post("/todos").send({
      title: "Buy milk",
      dueDate: new Date().toISOString(),
      completed: false,
      "_csrf": csrfToken, // prettier-ignore
    });
    expect(response.statusCode).toBe(302);
  });

  test("Marks as complete with id", async () => {
    const agent = request.agent(server);
    await login(agent, "sonthos@gmail.com", "12345678");
    let res = await agent.get("/todos");
    let csrfToken = extractCsrfToken(res);
    await agent.post("/todos").send({
      title: "Buy milk",
      dueDate: new Date().toISOString(),
      completed: false,
      "_csrf": csrfToken, // prettier-ignore
    });

    const groupedTodosResponse = await agent
      .get("/todos")
      .set("Accept", "application/json");
    const parsedGroupedResponse = JSON.parse(groupedTodosResponse.text);
    const dueTodayCounts = parsedGroupedResponse.dueToday.length;
    const latestTodos = parsedGroupedResponse.dueToday[dueTodayCounts - 1];

    res = await agent.get("/todos");
    csrfToken = extractCsrfToken(res);

    const markCompleteResponse = await agent
      .put(`/todos/${latestTodos.id}`)
      .send({
        completed: true,
        "_csrf": csrfToken, // prettier-ignore
      });
    const parsedUpdateResponses = JSON.parse(markCompleteResponse.text);
    expect(parsedUpdateResponses.completed).toBe(true);
  });
  test("Deletes a todo with the given ID", async () => {
    const agent = request.agent(server);
    await login(agent, "sonthos@gmail.com", "12345678");
    let res = await agent.get("/todos");
    let csrfToken = extractCsrfToken(res);
    await agent.post("/todos").send({
      title: "Buy Chocklate",
      dueDate: new Date().toISOString(),
      completed: false,
      "_csrf": csrfToken, // prettier-ignore
    });

    const groupedTodosResponse = await agent
      .get("/todos")
      .set("Accept", "application/json");

    const parsedResponse = JSON.parse(groupedTodosResponse.text);
    const todoId = parsedResponse.dueToday.length;
    const latestTodos = parsedResponse.dueToday[todoId - 1];

    res = await agent.get("/todos");
    csrfToken = extractCsrfToken(res);

    const deleteResponses = await agent.delete(`/todos/${latestTodos.id}`).send({
      "_csrf": csrfToken, // prettier-ignore
    });
    const parsedUpdateResponses = JSON.parse(deleteResponses.text);
    expect(parsedUpdateResponses).toBe(true); //prettier-ignore
  });
});

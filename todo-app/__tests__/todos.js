// /* eslint-disable no-unused-vars */
// /* eslint-disable no-undef */

const request = require("supertest");
var cheerio = require("cheerio");
const db = require("../models/index");
const app = require("../app");
function extractCsrfToken(res) {
  var $ = cheerio.load(res.text);
  return $("[name=_csrf]").val();
}

const loginMake = async (agent, username, password) => {
  let res = await agent.get("/login");
  let csrfToken = extractCsrfToken(res);
  res = await agent.post("/session").send({
    email: username,
    password: password,
    _csrf: csrfToken,
  });
};

let server, agent;

//test suit case conatains all test
describe("Todo Application", function () {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
    server = app.listen(5000, () => {});
    agent = request.agent(server);
  });

  afterAll(async () => {
    await db.sequelize.close();
    await server.close();
  });

  //sign up
  test("sign up", async () => {
    let res = await agent.get("/signup");
    const csrfToken = extractCsrfToken(res);
    res = await agent.post("/users").send({
      firstName: "Test",
      lastName: "Uses A",
      email: "Test2@gmail.com",
      password: "Test",
      _csrf: csrfToken,
    });
    expect(res.statusCode).toBe(302);
  });

  //sign out
  test("sign out", async () => {
    let res = await agent.get("/todos");
    expect(res.statusCode).toBe(200);

    res = await agent.get("/signout");

    expect(res.statusCode).toBe(302);

    res = await agent.get("/todos");

    expect(res.statusCode).toBe(302);
  });

  //test for deleting todo with Id
  test("Delete todo with ID", async () => {
    await loginMake(agent, "Test2@gmail.com", "Test");
    let res = await agent.get("/todos");

    let csrfToken = extractCsrfToken(res);

    await agent.post("/todos").send({
      title: "Buy milk todo Delete complete",
      dueDate: new Date().toISOString(),
      completed: true,
      _csrf: csrfToken,
    });

    const groupedTodosResponse = await agent
      .get("/todos")
      .set("Accept", "application/json");

    const parsedGroupResponse = JSON.parse(groupedTodosResponse.text);

    const coutDueToday = parsedGroupResponse.dueTodayTodos.length;

    const LatestTodo = parsedGroupResponse.dueTodayTodos[coutDueToday - 1];

    res = await agent.get("/todos");
    csrfToken = extractCsrfToken(res);

    const responsedelete = await agent.delete(`/todos/${LatestTodo.id}`).send({
      _csrf: csrfToken,
    });
    expect(responsedelete.statusCode).toBe(200);
  });

  // test for creating a TODO
  test("Creates a todo and responds with json at /todos POST endpoint", async () => {
    await loginMake(agent, "Test2@gmail.com", "Test");

    const res = await agent.get("/todos");

    const csrfToken = extractCsrfToken(res);
    const response = await agent.post("/todos").send({
      title: "Buy Google",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });

    expect(response.statusCode).toBe(302);
  });

  //   //test for marking a Todo as incomplete
  test("Marks a todo with the given ID as incomplete", async () => {
    await loginMake(agent, "Test2@gmail.com", "Test");
    let res = await agent.get("/todos");

    let csrfToken = extractCsrfToken(res);

    await agent.post("/todos").send({
      title: "Buy milk todo complete",
      dueDate: new Date().toISOString(),
      completed: true,
      _csrf: csrfToken,
    });

    const groupedTodosResponse = await agent
      .get("/todos")
      .set("Accept", "application/json");

    const parsedGroupResponse = JSON.parse(groupedTodosResponse.text);

    const dueTodayCount = parsedGroupResponse.dueTodayTodos.length;

    const latestTodo = parsedGroupResponse.dueTodayTodos[dueTodayCount - 1];

    res = await agent.get("/todos");

    csrfToken = extractCsrfToken(res);

    const markCompleteResponse = await agent
      .put(`/todos/${latestTodo.id}`)
      .send({
        completed: false,
        _csrf: csrfToken,
      });

    const parsedUpdateResponse = JSON.parse(markCompleteResponse.text);

    expect(parsedUpdateResponse.completed).toBe(false);
  });

  //   //test for marking a TODo  as complete
  test("Marks a todo with the given ID as complete", async () => {
    await loginMake(agent, "Test2@gmail.com", "Test");
    let res = await agent.get("/todos");

    let csrfToken = extractCsrfToken(res);

    await agent.post("/todos").send({
      title: "Buy milk todo complete",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });

    const groupedTodosResponse = await agent
      .get("/todos")
      .set("Accept", "application/json");

    const parsedGroupResponse = JSON.parse(groupedTodosResponse.text);

    const dueTodayCount = parsedGroupResponse.dueTodayTodos.length;

    const latestTodo = parsedGroupResponse.dueTodayTodos[dueTodayCount - 1];

    res = await agent.get("/todos");

    csrfToken = extractCsrfToken(res);

    const markCompleteResponse = await agent
      .put(`/todos/${latestTodo.id}`)
      .send({
        completed: true,
        _csrf: csrfToken,
      });

    const parsedUpdateResponse = JSON.parse(markCompleteResponse.text);

    expect(parsedUpdateResponse.completed).toBe(true);
  });
});

// //////////////////////////////////////

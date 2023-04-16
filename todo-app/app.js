/* eslint-disable no-unused-vars */
// sudo service postgresql start
// NODE_ENV=test npx sequelize-cli db:drop && NODE_ENV=test npx sequelize-cli db:create && NODE_ENV=test npx sequelize-cli model:generate --name Todo --attributes title:string,dueDate:string,completed:boolean && NODE_ENV=test npx sequelize-cli db:migrate

const express = require("express");
const app = express();
const { Todo } = require("./models");
const bodyParser = require("body-parser");

const csrf = require("tiny-csrf");
const cookieParser = require("cookie-parser");

const path = require("path");
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));

app.use(cookieParser("cookie-parser-secret"));
app.use(csrf("we_secure_our_page_with_tinycsrf", ["POST", "PUT", "DELETE"]));

// app.METHOD(PATH, HANDLER)
// or
// app.METHOD(path, callback [, callback ...])

app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname, "public")));

app.get("/", async (request, response) => {
  const allTodos = await Todo.getAllTodos();
  const overdue = await Todo.overdue();
  const dueToday = await Todo.dueToday();
  const dueLater = await Todo.dueLater();
  const completed = await Todo.completed();

  if (request.accepts("html")) {
    response.render("index", {
      title: "Todo Application",
      // allTodos,
      overdue,
      dueToday,
      dueLater,
      completed,
      csrfToken: request.csrfToken(),
    });
  } else {
    response.json({
      title: "Todo Application",
      // allTodos,
      overdue,
      dueToday,
      dueLater,
      completed,
    });
  }
});

app.get("/todos", async (request, response) => {
  // res.send("Hello World");
  console.log("Todo List");
  try {
    const todos = await Todo.getAllTodos();
    return response.json(todos);
  } catch (err) {
    console.error(err);
    return response.status(422).json(err);
  }
});

app.post("/todos", async (request, response) => {
  console.log("Creating a Todo", request.body);
  // Todo
  try {
    await Todo.addTodo({
      title: request.body.title,
      dueDate: request.body.dueDate,
      completed: false,
    });
    return response.redirect("/");
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

// PUT http://mytodoapp.com/todos/123/markAsCompleted
app.put("/todos/:id", async (request, response) => {
  console.log("We have to update a todo with ID:", request.params.id);
  const todo = await Todo.findByPk(request.params.id);
  try {
    const updatedTodo = await todo.setCompletionStatus(todo.completed);
    return response.json(updatedTodo);
  } catch (error) {
    console.log(error);
  }
});

app.delete("/todos/:id", async (request, response) => {
  console.log("Delete a todo by ID:", request.params.id);
  try {
    await Todo.remove(request.params.id);
    return response.json({ success: true });
  } catch (err) {
    // console.error(err);
    return response.status(422).json(err);
  }
});

module.exports = app;

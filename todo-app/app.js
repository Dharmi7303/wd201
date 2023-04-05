const express = require("express");
const app = express();
const { Todo } = require("./models");
const bodyParser = require("body-parser");
const todo = require("./models/todo");
const { where } = require("sequelize");
const path = require("path");
app.use(bodyParser.json());

app.set("view engine","ejs");

app.use(express.static(path.join(__dirname+"/public")))



app.get("/todos", async function (_request, response) {
  console.log("Processing list of all Todos ...");
  try {
    const todo = await Todo.findAll();
    return response.json(todo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.get("/todos/:id", async function (request, response) {
  try {
    const todo = await Todo.findByPk(request.params.id);
    return response.json(todo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.get("/", async function (request, response) {
  const odue = await Todo.odue();
  const tdue = await Todo.tdue();
  const ldue = await Todo.ldue();

  if(request.accepts("html")){
    response.render("index",{
      odue,tdue,ldue,
    });
  }
  else{
    response.json({
      odue,tdue,ldue,
    });
  }
});

app.post("/todos", async function (request, response) {
  try {
    const todo = await Todo.addTodo(request.body);
    return response.json(todo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.put("/todos/:id/markAsCompleted", async function (request, response) {
  const todo = await Todo.findByPk(request.params.id);
  try {
    const updatedTodo = await todo.markAsCompleted();
    return response.json(updatedTodo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.delete("/todos/:id", async function (request, response) {
  console.log("We have to delete a Todo with ID: ", request.params.id);
  try {
    const delbyid = await Todo.destroy({where:{ id : request.params.id }});
    response.send(delbyid ? true : false);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

module.exports = app;

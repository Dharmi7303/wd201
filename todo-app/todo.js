"use strict";
const { Model } = require("sequelize");
const { Op } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static today = new Date().toISOString().split("T")[0];

    // static associate(models) {
    //   // define association here
    // }

    static async addTask(params) {
      return await Todo.create(params);
    }

    static async showList() {
      console.log("My Todo list \n");

      console.log("Overdue");
      // FILL IN HERE
      // const todos = await this.overdue();
      // const todoList = todos.map(todo => todo.displayableString()).join('\n');
      // console.log(todoList);
      console.log(
        (await this.overdue())
          .map((todo) => todo.displayableString())
          .join("\n")
      );
      console.log("\n");

      console.log("Due Today");
      // FILL IN HERE
      console.log(
        (await this.dueToday())
          .map((todo) => todo.displayableString())
          .join("\n")
      );
      console.log("\n");

      console.log("Due Later");
      console.log(
        (await this.dueLater())
          .map((todo) => todo.displayableString())
          .join("\n")
      );
      // FILL IN HERE
    }

    static async overdue() {
      // FILL IN HERE TO RETURN OVERDUE ITEMS
      const todos = await Todo.findAll({
        where: {
          dueDate: { [Op.lt]: Todo.today },
        },
      });
      return todos;
    }

    static async dueToday() {
      // FILL IN HERE TO RETURN ITEMS DUE tODAY
      const todos = await Todo.findAll({
        where: {
          dueDate: { [Op.eq]: Todo.today },
        },
      });
      return todos;
    }

    static async dueLater() {
      // FILL IN HERE TO RETURN ITEMS DUE LATER
      const todos = await Todo.findAll({
        where: {
          dueDate: { [Op.gt]: Todo.today },
        },
      });
      return todos;
    }

    static async markAsComplete(id) {
      // FILL IN HERE TO MARK AN ITEM AS COMPLETE
      await Todo.update(
        { completed: true },
        {
          where: {
            id: id,
          },
        }
      );
    }

    displayableString() {
      let checkbox = this.completed ? "[x]" : "[ ]";
      let dueDate = this.dueDate == Todo.today ? "" : this.dueDate;
      return `${this.id}. ${checkbox} ${this.title} ${dueDate}`.trim();
    }
  }
  Todo.init(
    {
      title: DataTypes.STRING,
      dueDate: DataTypes.DATEONLY,
      completed: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "Todo",
    }
  );
  return Todo;
};

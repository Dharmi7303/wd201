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

    // static associate(models) {
    //   // define association here

    // }

    static addTodo({ title, dueDate }) {
      return this.create({ title: title, dueDate: dueDate, completed: false });
    }

    static getAllTodos() {
      return this.findAll();
    }

    static today = new Date().toISOString().split("T")[0];

    static async overdue() {
      // FILL IN HERE TO RETURN OVERDUE ITEMS
      const todos = await Todo.findAll({
        where: {
          [Op.and]: [
            { dueDate: { [Op.lt]: Todo.today } },
            { completed: { [Op.eq]: false } },
          ],
        },
      });
      return todos;
    }

    static async dueToday() {
      // FILL IN HERE TO RETURN ITEMS DUE tODAY
      const todos = await Todo.findAll({
        where: {
          [Op.and]: [
            { dueDate: { [Op.eq]: Todo.today } },
            { completed: { [Op.eq]: false } },
          ],
        },
      });
      return todos;
    }

    static async dueLater() {
      // FILL IN HERE TO RETURN ITEMS DUE LATER
      const todos = await Todo.findAll({
        where: {
          [Op.and]: [
            { dueDate: { [Op.gt]: Todo.today } },
            { completed: { [Op.eq]: false } },
          ],
        },
      });
      return todos;
    }

    static async completed() {
      // FILL IN HERE TO RETURN ITEMS DUE LATER
      const todos = await Todo.findAll({
        where: {
          completed: { [Op.eq]: true },
        },
      });
      return todos;
    }

    markAsCompleted() {
      return this.update({ completed: true });
    }

    setCompletionStatus(status) {
      return this.update({ completed: status == true ? false : true });
    }

    static async remove(id) {
      return await this.destroy({ where: { id } });
    }
  }
  Todo.init(
    {
      title: DataTypes.STRING,
      dueDate: DataTypes.STRING,
      completed: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "Todo",
    }
  );
  return Todo;
};

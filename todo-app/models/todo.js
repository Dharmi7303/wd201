"use strict";
const { Model, Op } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Todos extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */

    static async overdue() {
      const overdueTodos = await Todos.findAll({
        where: {
          dueDate: { [Op.lt]: new Date() },
          completed: false,
        },
      });

      return overdueTodos;
    }

    static async dueToday() {
      const dueTodayTodos = await Todos.findAll({
        where: {
          dueDate: { [Op.eq]: new Date() },
          completed: false,
        },
      });

      return dueTodayTodos;
    }

    static async dueLater() {
      const dueLaterTodos = await Todos.findAll({
        where: {
          dueDate: { [Op.gt]: new Date() },
          completed: false,
        },
      });

      return dueLaterTodos;
    }
    static async completed() {
      const completedTodos = await Todos.findAll({
        where: {
          completed: true,
        },
      });

      return completedTodos;
    }

    static async getTodos() {
      return this.findAll();
    }
    static async addTodo({ title, dueDate }) {
      return this.create({ title: title, dueDate: dueDate, completed: false });
    }
    static async remove(id) {
      return this.destroy({
        where: {
          id: id,
        },
      });
    }
    markAsCompleted() {
      return this.update({ completed: true });
    }
    setCompletionStatus(bool) {
      return this.update({ completed: bool });
    }
    // eslint-disable-next-line no-unused-vars
    static associate(models) {
      // define association here
    }
  }
  Todos.init(
    {
      title: DataTypes.STRING,
      dueDate: DataTypes.DATEONLY,
      completed: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "Todos",
    }
  );
  return Todos;
};

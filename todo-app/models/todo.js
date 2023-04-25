/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

"use strict";
const { Model, Op } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    static associate(models) {
      Todo.belongsTo(models.User, { foreignKey: "userID" });
    }

    static addTodo(title, dueDate, userID) {
      try {
        // title = JSON.stringify(title)
        // console.log(typeof(JSON.stringify(title)))
        // console.log(typeof(dueDate))
        console.log(userID);
        return this.create({
          title,
          dueDate,
          completed: false,
          userID: userID,
        });
      } catch (error) {
        console.error("Error adding a task", error);
      }
    }

    static getTodos(userID) {
      return this.findAll({
        order: [["id", "ASC"]],
        where: {
          userID,
        },
      });
    }

    //delete todo
    static async remove(id, userID) {
      return this.destroy({
        where: {
          id,
          userID,
        },
      });
    }

    // return dueLater items
    static async dueLater(userID) {
      return Todo.findAll({
        where: {
          completed: false,
          dueDate: {
            [Op.gt]: new Date(),
          },
          userID,
        },
        order: [["id", "ASC"]],
      });
    }

    // return dueToday items
    static async dueToday(userID) {
      return Todo.findAll({
        where: {
          completed: false,
          dueDate: {
            [Op.eq]: new Date(),
          },
          userID,
        },
        order: [["id", "ASC"]],
      });
    }

    // return overdue items
    static async overDue(userID) {
      return Todo.findAll({
        where: {
          completed: false,
          dueDate: {
            [Op.lt]: new Date(),
          },
          userID,
        },
        order: [["id", "ASC"]],
      });
    }

    //return completed items i.e complete status equals true
    static async completedItems(userID) {
      return Todo.findAll({
        where: {
          completed: true,
          userID,
        },

        order: [["id", "ASC"]],
      });
    }

    // sets the completed status of a todo accordingly
    async setCompletionStatus(boolvalue) {
      return this.update({ completed: boolvalue });
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
      logging: false,
    }
  );

  return Todo;
};

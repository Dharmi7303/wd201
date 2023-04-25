"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Todos", "userID", {
      type: Sequelize.INTEGER,
    });

    queryInterface.addConstraint("Todos", {
      fields: ["userID"],
      type: "foreign key",
      references: {
        table: "Users",add-user-id-in-todos.js
        field: "id",
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Todos", "userId");
  },
};

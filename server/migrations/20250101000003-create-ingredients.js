'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ingredients', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      base_unit: {
        type: Sequelize.STRING,
        allowNull: false
      }
    });
    await queryInterface.addIndex('ingredients', ['name']);
  },
  async down(queryInterface) {
    await queryInterface.dropTable('ingredients');
  }
};
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('recipe_ingredients', {
      recipe_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: { model: 'recipes', key: 'id' },
        onDelete: 'CASCADE'
      },
      ingredient_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: { model: 'ingredients', key: 'id' },
        onDelete: 'CASCADE'
      },
      quantity: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      unit: {
        type: Sequelize.STRING,
        allowNull: false
      }
    });
    await queryInterface.addIndex('recipe_ingredients', ['ingredient_id']);
  },
  async down(queryInterface) {
    await queryInterface.dropTable('recipe_ingredients');
  }
};
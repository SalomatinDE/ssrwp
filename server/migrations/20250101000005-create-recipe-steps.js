'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('recipe_steps', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      recipe_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'recipes', key: 'id' },
        onDelete: 'CASCADE'
      },
      step_number: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      instruction: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      duration: {
        type: Sequelize.INTEGER
      }
    });
    await queryInterface.addIndex('recipe_steps', ['recipe_id', 'step_number'], { unique: true });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('recipe_steps');
  }
};
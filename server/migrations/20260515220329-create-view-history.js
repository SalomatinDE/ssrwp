'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('view_history', {
      user_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE'
      },
      recipe_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: { model: 'recipes', key: 'id' },
        onDelete: 'CASCADE'
      },
      viewed_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });
    await queryInterface.addIndex('view_history', ['user_id', 'viewed_at']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('view_history');
  }
};
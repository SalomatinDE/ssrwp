'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('favorites', {
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE'
      },
      recipe_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: { model: 'recipes', key: 'id' },
        onDelete: 'CASCADE'
      }
    });
    await queryInterface.addIndex('favorites', ['recipe_id']);
  },
  async down(queryInterface) {
    await queryInterface.dropTable('favorites');
  }
};
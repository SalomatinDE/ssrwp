'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('collections', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE'
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      is_favorites: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    await queryInterface.createTable('collection_recipes', {
      collection_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: { model: 'collections', key: 'id' },
        onDelete: 'CASCADE'
      },
      recipe_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: { model: 'recipes', key: 'id' },
        onDelete: 'CASCADE'
      },
      added_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });
    await queryInterface.addIndex('collection_recipes', ['recipe_id']);
    await queryInterface.addIndex('collections', ['user_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('collection_recipes');
    await queryInterface.dropTable('collections');
  }
};

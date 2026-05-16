'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('recipes', {
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
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT
      },
      cooking_time: {
        type: Sequelize.INTEGER
      },
      difficulty: {
        type: Sequelize.ENUM('easy', 'medium', 'hard'),
        allowNull: false
      },
      image_url: {
        type: Sequelize.STRING
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      rating_average: {
        type: Sequelize.FLOAT,
        defaultValue: 0
      }
    });
    await queryInterface.addIndex('recipes', ['title']);
    await queryInterface.addIndex('recipes', ['description']);
    await queryInterface.addIndex('recipes', ['user_id']);
  },
  async down(queryInterface) {
    await queryInterface.dropTable('recipes');
  }
};
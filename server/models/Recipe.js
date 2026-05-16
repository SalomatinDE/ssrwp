const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Recipe = sequelize.define('Recipe', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'users', key: 'id' }
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  cooking_time: {
    type: DataTypes.INTEGER,
    comment: 'в минутах'
  },
  difficulty: {
    type: DataTypes.ENUM('easy', 'medium', 'hard'),
    allowNull: false
  },
  image_url: {
    type: DataTypes.STRING
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  rating_average: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  }
}, {
  tableName: 'recipes',
  timestamps: false,
  indexes: [
    { fields: ['title'] },
    { fields: ['description'] }
  ]
});

module.exports = Recipe;
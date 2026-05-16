const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RecipeStep = sequelize.define('RecipeStep', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  recipe_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'recipes', key: 'id' }
  },
  step_number: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  instruction: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'минуты'
  }
}, {
  tableName: 'recipe_steps',
  timestamps: false,
  indexes: [
    { fields: ['recipe_id', 'step_number'], unique: true }
  ]
});

module.exports = RecipeStep;
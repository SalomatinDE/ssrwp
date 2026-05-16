const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RecipeIngredient = sequelize.define('RecipeIngredient', {
  recipe_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: { model: 'recipes', key: 'id' }
  },
  ingredient_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: { model: 'ingredients', key: 'id' }
  },
  quantity: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  unit: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'recipe_ingredients',
  timestamps: false,
  indexes: [
    { fields: ['ingredient_id'] }
  ]
});

module.exports = RecipeIngredient;
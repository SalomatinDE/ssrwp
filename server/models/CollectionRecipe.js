const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CollectionRecipe = sequelize.define('CollectionRecipe', {
  collection_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: { model: 'collections', key: 'id' }
  },
  recipe_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: { model: 'recipes', key: 'id' }
  },
  added_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'collection_recipes',
  timestamps: false,
  indexes: [
    { fields: ['recipe_id'] }
  ]
});

module.exports = CollectionRecipe;
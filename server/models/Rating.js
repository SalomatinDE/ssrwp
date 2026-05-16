const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Rating = sequelize.define('Rating', {
  user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: { model: 'users', key: 'id' }
  },
  recipe_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: { model: 'recipes', key: 'id' }
  },
  score: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1, max: 5 }
  }
}, {
  tableName: 'ratings',
  timestamps: false,
  indexes: [
    { fields: ['recipe_id'] }
  ]
});

module.exports = Rating;
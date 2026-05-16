const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ViewHistory = sequelize.define('ViewHistory', {
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
  viewed_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'view_history',
  timestamps: false, // используем только viewed_at
  indexes: [
    { fields: ['user_id', 'viewed_at'] }
  ]
});

module.exports = ViewHistory;
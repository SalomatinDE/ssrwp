const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Ingredient = sequelize.define('Ingredient', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  base_unit: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'г, мл, шт. и т.д.'
  }
}, {
  tableName: 'ingredients',
  timestamps: false,
  indexes: [
    { fields: ['name'] }
  ]
});

module.exports = Ingredient;
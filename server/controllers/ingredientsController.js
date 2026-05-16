const { Ingredient } = require('../models');

exports.getAll = async (req, res, next) => {
  try {
    const ingredients = await Ingredient.findAll({
      attributes: ['id', 'name'],
      order: [['name', 'ASC']]
    });
    res.json(ingredients);
  } catch (err) {
    next(err);
  }
};
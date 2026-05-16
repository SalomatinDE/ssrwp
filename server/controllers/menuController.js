const { Op } = require('sequelize');
const { Recipe, Ingredient, RecipeIngredient } = require('../models');
const AppError = require('../utils/errors');

const BASIC_SPICES = ['соль', 'сахар', 'перец', 'масло'];

function isBasicSpice(name) {
  return BASIC_SPICES.some(spice => name.toLowerCase().includes(spice));
}

exports.generate = async (req, res, next) => {
  try {
    const searchTerms = req.body.ingredients; // массив строк

    // Найти все ингредиенты, соответствующие любому из поисковых терминов
    const allMatchedIngredients = await Ingredient.findAll({
      where: {
        [Op.or]: searchTerms.map(term => ({
          name: { [Op.iLike]: `%${term}%` }
        }))
      }
    });

    if (allMatchedIngredients.length === 0) {
      return res.json([]);
    }

    // Для каждого термина формируем множество ID ингредиентов, которые ему соответствуют
    const termToIngredientIds = new Map();
    for (const term of searchTerms) {
      const ids = allMatchedIngredients
        .filter(ing => ing.name.toLowerCase().includes(term.toLowerCase()))
        .map(ing => ing.id);
      termToIngredientIds.set(term, ids);
    }

    // Получаем ID всех подходящих ингредиентов (объединение)
    const allIngredientIds = allMatchedIngredients.map(ing => ing.id);

    // Находим все рецепты, у которых есть хотя бы один из этих ингредиентов
    const candidateRecipeIds = await RecipeIngredient.findAll({
      attributes: ['recipe_id'],
      where: { ingredient_id: { [Op.in]: allIngredientIds } },
      group: ['recipe_id']
    });

    if (candidateRecipeIds.length === 0) {
      return res.json([]);
    }

    const recipeIds = candidateRecipeIds.map(r => r.recipe_id);

    // Загружаем эти рецепты с ингредиентами
    const recipes = await Recipe.findAll({
      where: { id: { [Op.in]: recipeIds } },
      include: [
        {
          model: Ingredient,
          as: 'ingredients',
          attributes: ['id', 'name']
        }
      ],
      attributes: ['id', 'title', 'cooking_time', 'rating_average']
    });

    // Фильтруем рецепты: оставляем только те, где для каждого поискового термина есть хотя бы один ингредиент
    const matchedRecipes = recipes.filter(recipe => {
      const recipeIngredientNames = recipe.ingredients.map(i => i.name.toLowerCase());
      return searchTerms.every(term =>
        recipeIngredientNames.some(ingName => ingName.includes(term.toLowerCase()))
      );
    });

    // Собираем результат с missing_ingredients
    const result = matchedRecipes.map(recipe => {
      const recipeIngredientNames = recipe.ingredients.map(i => i.name);
      const missing = recipeIngredientNames.filter(name => {
        if (isBasicSpice(name)) return false;
        return !searchTerms.some(term => name.toLowerCase().includes(term.toLowerCase()));
      });

      return {
        recipe: {
          id: recipe.id,
          title: recipe.title,
          cooking_time: recipe.cooking_time,
          rating_average: recipe.rating_average
        },
        missing_ingredients: missing
      };
    });

    // Сортируем по возрастанию количества недостающих ингредиентов
    result.sort((a, b) => a.missing_ingredients.length - b.missing_ingredients.length);

    res.json(result);
  } catch (err) {
    next(err);
  }
};
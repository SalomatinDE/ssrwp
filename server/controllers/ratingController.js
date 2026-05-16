// server/controllers/ratingController.js
const { Rating, Recipe } = require('../models');
const AppError = require('../utils/errors');

exports.rate = async (req, res, next) => {
  try {
    const recipeId = parseInt(req.params.id, 10);
    const userId = req.user.id;
    const { score } = req.body;

    // Проверка существования рецепта
    const recipe = await Recipe.findByPk(recipeId);
    if (!recipe) {
      throw new AppError('Рецепт не найден', 404);
    }

    // Поиск существующей оценки
    let rating = await Rating.findOne({
      where: { user_id: userId, recipe_id: recipeId }
    });

    if (rating) {
      // Обновить
      rating.score = score;
      await rating.save();
    } else {
      // Создать
      rating = await Rating.create({
        user_id: userId,
        recipe_id: recipeId,
        score
      });
    }

    // Пересчитать средний рейтинг рецепта
    const result = await Rating.findAll({
      attributes: [[Rating.sequelize.fn('AVG', Rating.sequelize.col('score')), 'avgScore']],
      where: { recipe_id: recipeId }
    });
    const avg = parseFloat(result[0].get('avgScore') || 0).toFixed(2);
    recipe.rating_average = avg;
    await recipe.save();

    res.json({
      recipe_id: recipeId,
      average_rating: avg,
      user_score: score
    });
  } catch (err) {
    next(err);
  }
};
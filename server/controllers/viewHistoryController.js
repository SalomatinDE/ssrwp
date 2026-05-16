const { ViewHistory, Recipe } = require('../models');
const AppError = require('../utils/errors');

const MAX_HISTORY = 100;

// POST /api/recipes/:id/view
exports.recordView = async (req, res, next) => {
  try {
    const recipeId = req.params.id;
    const userId = req.user.id;

    // Проверяем существование рецепта
    const recipe = await Recipe.findByPk(recipeId);
    if (!recipe) throw new AppError('Рецепт не найден', 404);

    // Проверяем текущее количество записей пользователя
    const count = await ViewHistory.count({ where: { user_id: userId } });
    if (count >= MAX_HISTORY) {
      // Удаляем самую старую запись (с минимальным viewed_at)
      const oldest = await ViewHistory.findOne({
        where: { user_id: userId },
        order: [['viewed_at', 'ASC']],
        limit: 1
      });
      if (oldest) {
        await oldest.destroy();
      }
    }

    // Upsert: если запись существует, обновим viewed_at, иначе создадим
    const [record, created] = await ViewHistory.findOrCreate({
      where: { user_id: userId, recipe_id: recipeId },
      defaults: { user_id: userId, recipe_id: recipeId, viewed_at: new Date() }
    });
    if (!created) {
      // Уже существовала — обновляем время
      record.viewed_at = new Date();
      await record.save();
    }

    res.json({ message: 'Просмотр зафиксирован', viewed_at: record.viewed_at });
  } catch (err) {
    next(err);
  }
};

// GET /api/history
exports.getHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await ViewHistory.findAndCountAll({
      where: { user_id: userId },
      include: [
        {
          model: Recipe,
          as: 'recipe', // нужно указать alias, который мы задали в ассоциациях
          attributes: ['id', 'title', 'cooking_time', 'rating_average', 'image_url']
        }
      ],
      order: [['viewed_at', 'DESC']],
      limit,
      offset,
      distinct: true
    });

    const history = rows.map(entry => ({
      viewed_at: entry.viewed_at,
      recipe: entry.recipe
    }));

    res.json({
      total: count,
      page,
      limit,
      history
    });
  } catch (err) {
    next(err);
  }
};
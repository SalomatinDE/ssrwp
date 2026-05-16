const { Collection, CollectionRecipe, Recipe } = require('../models');
const { Sequelize } = require('sequelize');
const AppError = require('../utils/errors');

// GET /api/collections – список коллекций пользователя
exports.getAll = async (req, res, next) => {
  try {
    const collections = await Collection.findAll({
      where: { user_id: req.user.id },
      attributes: {
        include: [
          [Sequelize.literal(`(
            SELECT COUNT(*)::int
            FROM collection_recipes
            WHERE collection_id = "Collection".id
          )`), 'recipe_count']
        ]
      },
      order: [['is_favorites', 'DESC'], ['created_at', 'ASC']]
    });
    res.json(collections);
  } catch (err) {
    next(err);
  }
};

// POST /api/collections – создать коллекцию
exports.create = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      throw new AppError('Название коллекции обязательно', 400);
    }

    const collection = await Collection.create({
      user_id: req.user.id,
      name: name.trim(),
      is_favorites: false
    });
    res.status(201).json(collection);
  } catch (err) {
    next(err);
  }
};

// PUT /api/collections/:id – переименовать
exports.rename = async (req, res, next) => {
  try {
    const collection = await Collection.findByPk(req.params.id);
    if (!collection) throw new AppError('Коллекция не найдена', 404);
    if (collection.user_id !== req.user.id) throw new AppError('Нет доступа', 403);
    if (collection.is_favorites) throw new AppError('Нельзя переименовать системную коллекцию', 400);

    const { name } = req.body;
    if (!name || !name.trim()) throw new AppError('Название обязательно', 400);

    collection.name = name.trim();
    await collection.save();
    res.json(collection);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/collections/:id – удалить коллекцию (кроме системной)
exports.delete = async (req, res, next) => {
  try {
    const collection = await Collection.findByPk(req.params.id);
    if (!collection) throw new AppError('Коллекция не найдена', 404);
    if (collection.user_id !== req.user.id) throw new AppError('Нет доступа', 403);
    if (collection.is_favorites) throw new AppError('Нельзя удалить коллекцию «Избранное»', 400);

    await collection.destroy();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

// GET /api/collections/:id/recipes – рецепты коллекции
exports.getRecipes = async (req, res, next) => {
  try {
    const collection = await Collection.findByPk(req.params.id);
    if (!collection) throw new AppError('Коллекция не найдена', 404);
    if (collection.user_id !== req.user.id) throw new AppError('Нет доступа', 403);

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    // Используем CollectionRecipe для пагинации, включая рецепт
    const { count, rows } = await CollectionRecipe.findAndCountAll({
      where: { collection_id: collection.id },
      include: [
        {
          model: Recipe,
          attributes: ['id', 'title', 'cooking_time', 'rating_average', 'image_url']
        }
      ],
      order: [['added_at', 'DESC']],
      limit,
      offset,
      distinct: true
    });

    const recipes = rows.map(cr => cr.Recipe).filter(Boolean);

    res.json({
      total: count,
      page,
      limit,
      collection_id: collection.id,
      collection_name: collection.name,
      recipes
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/collections/:id/recipes – добавить рецепт в коллекцию
exports.addRecipe = async (req, res, next) => {
  try {
    const collection = await Collection.findByPk(req.params.id);
    if (!collection) throw new AppError('Коллекция не найдена', 404);
    if (collection.user_id !== req.user.id) throw new AppError('Нет доступа', 403);

    const { recipe_id } = req.body;
    if (!recipe_id) throw new AppError('recipe_id обязателен', 400);

    // Проверить существование рецепта
    const recipe = await Recipe.findByPk(recipe_id);
    if (!recipe) throw new AppError('Рецепт не найден', 404);

    // Проверить, нет ли уже записи
    const existing = await CollectionRecipe.findOne({
      where: { collection_id: collection.id, recipe_id }
    });
    if (existing) {
      throw new AppError('Рецепт уже в коллекции', 409);
    }

    await CollectionRecipe.create({
      collection_id: collection.id,
      recipe_id,
      added_at: new Date()
    });

    res.status(201).json({ message: 'Рецепт добавлен в коллекцию' });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/collections/:id/recipes/:recipeId – удалить рецепт из коллекции
exports.removeRecipe = async (req, res, next) => {
  try {
    const collection = await Collection.findByPk(req.params.id);
    if (!collection) throw new AppError('Коллекция не найдена', 404);
    if (collection.user_id !== req.user.id) throw new AppError('Нет доступа', 403);

    const recipeId = parseInt(req.params.recipeId, 10);
    const record = await CollectionRecipe.findOne({
      where: { collection_id: collection.id, recipe_id: recipeId }
    });
    if (!record) throw new AppError('Рецепт не найден в коллекции', 404);

    await record.destroy();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
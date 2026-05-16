const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const AppError = require('../utils/errors');
const { Recipe, RecipeIngredient, RecipeStep, Ingredient, User } = require('../models');

// Вспомогательная функция: обновление ингредиентов и шагов в транзакции
async function replaceRecipeDetails(transaction, recipeId, ingredients, steps) {
  // Удаляем старые
  await RecipeIngredient.destroy({ where: { recipe_id: recipeId }, transaction });
  await RecipeStep.destroy({ where: { recipe_id: recipeId }, transaction });

  // Создаём новые
  if (ingredients && ingredients.length) {
    await RecipeIngredient.bulkCreate(
      ingredients.map(ing => ({
        recipe_id: recipeId,
        ingredient_id: ing.ingredient_id,
        quantity: ing.quantity,
        unit: ing.unit
      })),
      { transaction }
    );
  }

  if (steps && steps.length) {
    await RecipeStep.bulkCreate(
      steps.map(step => ({
        recipe_id: recipeId,
        step_number: step.step_number,
        instruction: step.instruction,
        duration: step.duration || null
      })),
      { transaction }
    );
  }
}

// POST /api/recipes
exports.create = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(errors.array()[0].msg, 400);
    }

    const { title, description, cooking_time, difficulty, image_url, ingredients, steps } = req.body;

    // Создаём рецепт
    const recipe = await Recipe.create({
      user_id: req.user.id,
      title,
      description,
      cooking_time,
      difficulty,
      image_url,
      rating_average: 0
    }, { transaction: t });

    // Добавляем ингредиенты и шаги
    await replaceRecipeDetails(t, recipe.id, ingredients, steps);

    await t.commit();

    // Загружаем рецепт со связями
    const fullRecipe = await Recipe.findByPk(recipe.id, {
      include: [
        { model: Ingredient, as: 'ingredients', attributes: ['id', 'name', 'base_unit'] },
        { model: RecipeStep, as: 'steps', attributes: ['step_number', 'instruction', 'duration'] },
        { model: User, as: 'author', attributes: ['id', 'username'] }
      ]
    });

    res.status(201).json(fullRecipe);
  } catch (err) {
    await t.rollback();
    next(err);
  }
};

// GET /api/recipes
exports.getAll = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';

    const { difficulty, max_cooking_time, min_rating, exclude_ingredients, include_ingredients } = req.query;

    const whereConditions = {};

    // Поиск по названию рецепта или ингредиенту
    if (search) {
      whereConditions[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        sequelize.literal(`EXISTS (
          SELECT 1 FROM recipe_ingredients ri 
          JOIN ingredients i ON ri.ingredient_id = i.id 
          WHERE ri.recipe_id = "Recipe".id AND i.name ILIKE '%${search}%'
        )`)
      ];
    }

    if (difficulty && ['easy', 'medium', 'hard'].includes(difficulty)) {
      whereConditions.difficulty = difficulty;
    }

    if (max_cooking_time) {
      const maxTime = parseInt(max_cooking_time, 10);
      if (!isNaN(maxTime)) {
        whereConditions.cooking_time = { [Op.lte]: maxTime };
      }
    }

    if (min_rating) {
      const minRating = parseFloat(min_rating);
      if (!isNaN(minRating)) {
        whereConditions.rating_average = { [Op.gte]: minRating };
      }
    }

    if (include_ingredients) {
      const ids = include_ingredients.split(',').map(id => parseInt(id, 10)).filter(id => !isNaN(id));
      if (ids.length > 0) {
        whereConditions[Op.and] = whereConditions[Op.and] || [];
        whereConditions[Op.and].push(
          sequelize.literal(`"Recipe".id IN (
            SELECT ri.recipe_id 
            FROM recipe_ingredients ri 
            WHERE ri.ingredient_id IN (${ids.join(',')}) 
            GROUP BY ri.recipe_id 
            HAVING COUNT(DISTINCT ri.ingredient_id) = ${ids.length}
          )`)
        );
      }
    }

    if (exclude_ingredients) {
      const ids = exclude_ingredients.split(',').map(id => parseInt(id, 10)).filter(id => !isNaN(id));
      if (ids.length > 0) {
        whereConditions[Op.and] = whereConditions[Op.and] || [];
        whereConditions[Op.and].push(
          sequelize.literal(`"Recipe".id NOT IN (
            SELECT ri.recipe_id 
            FROM recipe_ingredients ri 
            WHERE ri.ingredient_id IN (${ids.join(',')})
          )`)
        );
      }
    }

    // Шаг 1: получаем уникальные ID рецептов с пагинацией
    const { count, rows: idRows } = await Recipe.findAndCountAll({
      where: whereConditions,
      attributes: ['id'],
      order: [['created_at', 'DESC']],
      limit,
      offset,
      subQuery: false,
      group: ['Recipe.id'],
    });

    const total = Array.isArray(count) ? count.length : count;
    const ids = idRows.map(r => r.id);

    // Шаг 2: загружаем полные рецепты по этим ID со связями
    const recipes = ids.length > 0 ? await Recipe.findAll({
      where: { id: { [Op.in]: ids } },
      include: [
        { model: Ingredient, as: 'ingredients', attributes: ['id', 'name', 'base_unit'] },
        { model: RecipeStep, as: 'steps', attributes: ['step_number', 'instruction'] },
        { model: User, as: 'author', attributes: ['id', 'username'] }
      ],
      order: [['created_at', 'DESC']],
    }) : [];

    res.json({
      total,
      page,
      limit,
      recipes,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/recipes/:id
exports.getById = async (req, res, next) => {
  try {
    const recipe = await Recipe.findByPk(req.params.id, {
      include: [
        { model: Ingredient, as: 'ingredients', attributes: ['id', 'name', 'base_unit'] },
        { model: RecipeStep, as: 'steps', attributes: ['step_number', 'instruction', 'duration'] },
        { model: User, as: 'author', attributes: ['id', 'username'] }
      ]
    });

    if (!recipe) {
      throw new AppError('Рецепт не найден', 404);
    }

    res.json(recipe);
  } catch (err) {
    next(err);
  }
};

// PUT /api/recipes/:id
exports.update = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(errors.array()[0].msg, 400);
    }

    const recipe = await Recipe.findByPk(req.params.id, { transaction: t });
    if (!recipe) {
      throw new AppError('Рецепт не найден', 404);
    }

    if (recipe.user_id !== req.user.id) {
      throw new AppError('У вас нет прав на редактирование этого рецепта', 403);
    }

    const { title, description, cooking_time, difficulty, image_url, ingredients, steps } = req.body;

    // Обновляем основные поля, если они переданы
    if (title !== undefined) recipe.title = title;
    if (description !== undefined) recipe.description = description;
    if (cooking_time !== undefined) recipe.cooking_time = cooking_time;
    if (difficulty !== undefined) recipe.difficulty = difficulty;
    if (image_url !== undefined) recipe.image_url = image_url;
    await recipe.save({ transaction: t });

    // Обновляем ингредиенты и шаги, если они переданы
    if (ingredients !== undefined || steps !== undefined) {
      await replaceRecipeDetails(t, recipe.id, ingredients, steps);
    }

    await t.commit();

    // Возвращаем обновлённый рецепт со связями
    const updatedRecipe = await Recipe.findByPk(recipe.id, {
      include: [
        { model: Ingredient, as: 'ingredients', attributes: ['id', 'name', 'base_unit'] },
        { model: RecipeStep, as: 'steps', attributes: ['step_number', 'instruction', 'duration'] },
        { model: User, as: 'author', attributes: ['id', 'username'] }
      ]
    });

    res.json(updatedRecipe);
  } catch (err) {
    await t.rollback();
    next(err);
  }
};

// DELETE /api/recipes/:id
exports.delete = async (req, res, next) => {
  try {
    const recipe = await Recipe.findByPk(req.params.id);
    if (!recipe) {
      throw new AppError('Рецепт не найден', 404);
    }

    if (recipe.user_id !== req.user.id) {
      throw new AppError('У вас нет прав на удаление этого рецепта', 403);
    }

    await recipe.destroy(); // каскадное удаление настроено в миграциях (onDelete: 'CASCADE')
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
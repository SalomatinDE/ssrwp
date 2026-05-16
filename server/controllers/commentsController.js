const { Comment, User } = require('../models');
const AppError = require('../utils/errors');
const { validationResult } = require('express-validator');

// GET /api/recipes/:id/comments
exports.getAllByRecipe = async (req, res, next) => {
  try {
    const recipeId = req.params.id;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await Comment.findAndCountAll({
      where: { recipe_id: recipeId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'avatar_url']
        }
      ],
      order: [['created_at', 'ASC']],
      limit,
      offset,
      distinct: true
    });

    const comments = rows.map(comment => ({
      id: comment.id,
      text: comment.text,
      created_at: comment.created_at,
      updated_at: comment.updated_at,
      user: comment.user
    }));

    res.json({
      total: count,
      page,
      limit,
      comments
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/recipes/:id/comments
exports.create = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(errors.array()[0].msg, 400);
    }

    const recipeId = req.params.id;
    const userId = req.user.id;
    const { text } = req.body;

    const comment = await Comment.create({
      user_id: userId,
      recipe_id: recipeId,
      text: text.trim()
    });

    // Загружаем с пользователем для ответа
    const fullComment = await Comment.findByPk(comment.id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'username', 'avatar_url'] }
      ]
    });

    res.status(201).json(fullComment);
  } catch (err) {
    next(err);
  }
};

// PUT /api/comments/:id
exports.update = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(errors.array()[0].msg, 400);
    }

    const comment = await Comment.findByPk(req.params.id);
    if (!comment) throw new AppError('Комментарий не найден', 404);
    if (comment.user_id !== req.user.id) throw new AppError('Нет прав на редактирование', 403);

    comment.text = req.body.text.trim();
    comment.updated_at = new Date();
    await comment.save();

    const updatedComment = await Comment.findByPk(comment.id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'username', 'avatar_url'] }
      ]
    });

    res.json(updatedComment);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/comments/:id
exports.delete = async (req, res, next) => {
  try {
    const comment = await Comment.findByPk(req.params.id);
    if (!comment) throw new AppError('Комментарий не найден', 404);
    if (comment.user_id !== req.user.id) throw new AppError('Нет прав на удаление', 403);

    await comment.destroy();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
// server/models/index.js
const User = require('./User');
const Recipe = require('./Recipe');
const Ingredient = require('./Ingredient');
const RecipeIngredient = require('./RecipeIngredient');
const RecipeStep = require('./RecipeStep');
const Rating = require('./Rating');
const Collection = require('./Collection');
const Comment = require('./Comment');
const CollectionRecipe = require('./CollectionRecipe');
const ViewHistory = require('./ViewHistory');

// User -> Recipe (1:*)
User.hasMany(Recipe, { foreignKey: 'user_id', as: 'recipes' });
Recipe.belongsTo(User, { foreignKey: 'user_id', as: 'author' });

// Recipe -> RecipeStep (1:*)
Recipe.hasMany(RecipeStep, { foreignKey: 'recipe_id', as: 'steps' });
RecipeStep.belongsTo(Recipe, { foreignKey: 'recipe_id' });

// Recipe <-> Ingredient через RecipeIngredient
Recipe.belongsToMany(Ingredient, {
  through: RecipeIngredient,
  foreignKey: 'recipe_id',
  otherKey: 'ingredient_id',
  as: 'ingredients'
});
Ingredient.belongsToMany(Recipe, {
  through: RecipeIngredient,
  foreignKey: 'ingredient_id',
  otherKey: 'recipe_id',
  as: 'recipes'
});

// User <-> Recipe через Rating
User.belongsToMany(Recipe, { through: Rating, foreignKey: 'user_id', as: 'ratedRecipes' });
Recipe.belongsToMany(User, { through: Rating, foreignKey: 'recipe_id', as: 'ratedBy' });

RecipeIngredient.belongsTo(Ingredient, { foreignKey: 'ingredient_id' });

User.hasMany(Collection, { foreignKey: 'user_id', as: 'collections' });
Collection.belongsTo(User, { foreignKey: 'user_id', as: 'owner' });

Collection.belongsToMany(Recipe, {
  through: CollectionRecipe,
  foreignKey: 'collection_id',
  otherKey: 'recipe_id',
  as: 'recipes'
});
Recipe.belongsToMany(Collection, {
  through: CollectionRecipe,
  foreignKey: 'recipe_id',
  otherKey: 'collection_id',
  as: 'collections'
});

Collection.hasMany(CollectionRecipe, { foreignKey: 'collection_id', as: 'collectionRecipes' });
CollectionRecipe.belongsTo(Collection, { foreignKey: 'collection_id' });
CollectionRecipe.belongsTo(Recipe, { foreignKey: 'recipe_id' });

User.hasMany(Comment, { foreignKey: 'user_id', as: 'comments' });
Comment.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Recipe.hasMany(Comment, { foreignKey: 'recipe_id', as: 'comments' });
Comment.belongsTo(Recipe, { foreignKey: 'recipe_id', as: 'recipe' });

User.belongsToMany(Recipe, { through: ViewHistory, foreignKey: 'user_id', as: 'viewedRecipes' });
Recipe.belongsToMany(User, { through: ViewHistory, foreignKey: 'recipe_id', as: 'viewedByUsers' });
ViewHistory.belongsTo(Recipe, { foreignKey: 'recipe_id', as: 'recipe' });

module.exports = {
  User, Recipe, Ingredient, RecipeIngredient, RecipeStep, Rating,
  Collection, CollectionRecipe, Comment, ViewHistory
};
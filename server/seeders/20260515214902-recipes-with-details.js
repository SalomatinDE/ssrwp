'use strict';

module.exports = {
  async up(queryInterface) {
    // Получаем ID пользователей (должны существовать после сидера пользователей)
    const users = await queryInterface.sequelize.query(
      'SELECT id FROM users ORDER BY id', { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    const userIds = users.map(u => u.id);
    if (userIds.length === 0) throw new Error('Нет пользователей в базе');

    // Получаем коллекции «Избранное» для каждого пользователя
    const favCollections = await queryInterface.sequelize.query(
      'SELECT id, user_id FROM collections WHERE is_favorites = true ORDER BY id', 
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    // Сопоставим: ключ — user_id, значение — коллекция
    const favMap = {};
    favCollections.forEach(c => { favMap[c.user_id] = c.id; });

    // 20 рецептов
    const recipesData = [
      'Борщ классический', 'Цезарь с курицей', 'Плов с говядиной', 'Паста Карбонара',
      'Куриные котлеты', 'Омлет с овощами', 'Греческий салат', 'Том Ям',
      'Шарлотка с яблоками', 'Ризотто с грибами', 'Лазанья', 'Уха из форели',
      'Блинчики тонкие', 'Сырники', 'Овощное рагу', 'Шашлык из свинины',
      'Винегрет', 'Куриный суп с лапшой', 'Брауни', 'Смузи боул'
    ];
    const difficulties = ['easy', 'medium', 'hard'];

    const recipesRows = recipesData.map((title, i) => ({
      user_id: userIds[i % 5],
      title,
      description: `Описание рецепта "${title}"`,
      cooking_time: 30 + Math.floor(Math.random() * 90),
      difficulty: difficulties[Math.floor(Math.random() * 3)],
      image_url: `https://picsum.photos/seed/recipe${i + 1}/400/300`,
      created_at: new Date(),
      rating_average: 0
    }));
    const createdRecipes = await queryInterface.bulkInsert('recipes', recipesRows, { returning: true });
    const recipeIds = createdRecipes.map(r => r.id);

    // Ингредиенты для рецептов (от 3 до 8 случайных ингредиентов из базы id 1-50)
    const recipeIngredients = [];
    for (let i = 0; i < recipeIds.length; i++) {
      const count = 3 + Math.floor(Math.random() * 6);
      const used = new Set();
      for (let j = 0; j < count; j++) {
        let ingId;
        do {
          ingId = 1 + Math.floor(Math.random() * 50);
        } while (used.has(ingId));
        used.add(ingId);
        recipeIngredients.push({
          recipe_id: recipeIds[i],
          ingredient_id: ingId,
          quantity: (Math.random() * 400 + 50).toFixed(0),
          unit: ['г', 'мл', 'шт.'][Math.floor(Math.random() * 3)]
        });
      }
    }
    await queryInterface.bulkInsert('recipe_ingredients', recipeIngredients);

    // Шаги для рецептов (от 3 до 6)
    const recipeSteps = [];
    for (let i = 0; i < recipeIds.length; i++) {
      const stepCount = 3 + Math.floor(Math.random() * 4);
      for (let j = 1; j <= stepCount; j++) {
        recipeSteps.push({
          recipe_id: recipeIds[i],
          step_number: j,
          instruction: `Шаг ${j} для рецепта "${recipesData[i]}": выполните необходимое действие.`,
          duration: j === 1 ? 5 : null
        });
      }
    }
    await queryInterface.bulkInsert('recipe_steps', recipeSteps);

    // Добавим несколько рецептов в избранное пользователю 1 и 2
    const collectionRecipes = [];
    // Пользователь 1 (id=1) добавляет первые 3 рецепта
    const user1Id = userIds[0];
    const user1FavCollection = favMap[user1Id];
    if (user1FavCollection) {
      for (let i = 0; i < 3; i++) {
        collectionRecipes.push({
          collection_id: user1FavCollection,
          recipe_id: recipeIds[i],
          added_at: new Date()
        });
      }
    }
    // Пользователь 2 добавляет рецепты 3 и 4
    const user2Id = userIds[1];
    const user2FavCollection = favMap[user2Id];
    if (user2FavCollection) {
      collectionRecipes.push(
        { collection_id: user2FavCollection, recipe_id: recipeIds[2], added_at: new Date() },
        { collection_id: user2FavCollection, recipe_id: recipeIds[3], added_at: new Date() }
      );
    }
    if (collectionRecipes.length > 0) {
      await queryInterface.bulkInsert('collection_recipes', collectionRecipes);
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('collection_recipes', null, {});
    await queryInterface.bulkDelete('recipe_steps', null, {});
    await queryInterface.bulkDelete('recipe_ingredients', null, {});
    await queryInterface.bulkDelete('recipes', null, {});
  }
};

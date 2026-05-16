'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Получить всех пользователей
    const users = await queryInterface.sequelize.query(
      'SELECT id FROM users', { type: Sequelize.QueryTypes.SELECT }
    );

    // 2. Для каждого пользователя создать коллекцию "Избранное" и перенести его избранные рецепты
    for (const user of users) {
      // Создаем коллекцию
      const [collection] = await queryInterface.bulkInsert('collections', [{
        user_id: user.id,
        name: 'Избранное',
        is_favorites: true,
        created_at: new Date()
      }], { returning: true });

      // Получаем избранные рецепты пользователя из таблицы favorites
      const favorites = await queryInterface.sequelize.query(
        'SELECT recipe_id FROM favorites WHERE user_id = ?',
        { replacements: [user.id], type: Sequelize.QueryTypes.SELECT }
      );

      // Переносим в collection_recipes
      if (favorites.length > 0) {
        const records = favorites.map(fav => ({
          collection_id: collection.id,
          recipe_id: fav.recipe_id,
          added_at: new Date()
        }));
        await queryInterface.bulkInsert('collection_recipes', records);
      }
    }

    // 3. Удаляем таблицу favorites
    await queryInterface.dropTable('favorites');
  },

  async down(queryInterface, Sequelize) {
    // Восстановить таблицу favorites из коллекций (если нужен откат)
    // Это сложно, можно оставить пустым
  }
};

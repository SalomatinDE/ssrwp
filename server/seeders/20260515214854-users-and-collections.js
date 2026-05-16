'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface) {
    const passwordHash = await bcrypt.hash('password123', 10);

    // Создаём 5 пользователей
    const users = [];
    for (let i = 1; i <= 5; i++) {
      users.push({
        email: `user${i}@example.com`,
        password_hash: passwordHash,
        username: `cook_${i}`,
        created_at: new Date()
      });
    }
    const createdUsers = await queryInterface.bulkInsert('users', users, { returning: true });

    // Каждому пользователю — коллекция «Избранное»
    const collections = createdUsers.map(user => ({
      user_id: user.id,
      name: 'Избранное',
      is_favorites: true,
      created_at: new Date()
    }));
    await queryInterface.bulkInsert('collections', collections);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('collections', null, {});
    await queryInterface.bulkDelete('users', null, {});
  }
};
'use strict';

module.exports = {
  async up(queryInterface) {
    const ingredients = [
      { name: 'Мука пшеничная', base_unit: 'г' },
      { name: 'Сахар', base_unit: 'г' },
      { name: 'Соль', base_unit: 'г' },
      { name: 'Масло растительное', base_unit: 'мл' },
      { name: 'Молоко', base_unit: 'мл' },
      { name: 'Яйцо куриное', base_unit: 'шт.' },
      { name: 'Картофель', base_unit: 'г' },
      { name: 'Морковь', base_unit: 'г' },
      { name: 'Лук репчатый', base_unit: 'г' },
      { name: 'Чеснок', base_unit: 'зубчик' },
      { name: 'Помидоры', base_unit: 'г' },
      { name: 'Огурцы', base_unit: 'г' },
      { name: 'Капуста белокочанная', base_unit: 'г' },
      { name: 'Рис', base_unit: 'г' },
      { name: 'Макароны', base_unit: 'г' },
      { name: 'Гречка', base_unit: 'г' },
      { name: 'Куриное филе', base_unit: 'г' },
      { name: 'Говядина', base_unit: 'г' },
      { name: 'Свинина', base_unit: 'г' },
      { name: 'Фарш мясной', base_unit: 'г' },
      { name: 'Рыба (филе)', base_unit: 'г' },
      { name: 'Креветки', base_unit: 'г' },
      { name: 'Сыр твердый', base_unit: 'г' },
      { name: 'Сметана', base_unit: 'мл' },
      { name: 'Майонез', base_unit: 'мл' },
      { name: 'Кетчуп', base_unit: 'мл' },
      { name: 'Мед', base_unit: 'мл' },
      { name: 'Горчица', base_unit: 'мл' },
      { name: 'Перец черный молотый', base_unit: 'г' },
      { name: 'Перец красный молотый', base_unit: 'г' },
      { name: 'Паприка', base_unit: 'г' },
      { name: 'Куркума', base_unit: 'г' },
      { name: 'Лавровый лист', base_unit: 'шт.' },
      { name: 'Укроп', base_unit: 'пучок' },
      { name: 'Петрушка', base_unit: 'пучок' },
      { name: 'Базилик', base_unit: 'пучок' },
      { name: 'Лимон', base_unit: 'шт.' },
      { name: 'Апельсин', base_unit: 'шт.' },
      { name: 'Яблоко', base_unit: 'шт.' },
      { name: 'Банан', base_unit: 'шт.' },
      { name: 'Шоколад темный', base_unit: 'г' },
      { name: 'Какао-порошок', base_unit: 'г' },
      { name: 'Дрожжи сухие', base_unit: 'г' },
      { name: 'Разрыхлитель теста', base_unit: 'г' },
      { name: 'Ванилин', base_unit: 'г' },
      { name: 'Оливковое масло', base_unit: 'мл' },
      { name: 'Уксус столовый', base_unit: 'мл' },
      { name: 'Соевый соус', base_unit: 'мл' },
      { name: 'Томатная паста', base_unit: 'г' },
      { name: 'Сливочное масло', base_unit: 'г' }
    ];

    await queryInterface.bulkInsert('ingredients', ingredients.map(i => ({
      name: i.name,
      base_unit: i.base_unit
    })));
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('ingredients', null, {});
  }
};
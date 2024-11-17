const Router = require("express").Router();
const jwt = require("jsonwebtoken");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const User = require("../models/User");
const Product = require("../models/Product");
const Reservation = require('../models/Reservation');

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });



// Data for navbar
Router.post("/data", async (req, res) => {
  const { token } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded._id);
    if (!user) {
      return res.status(404).send({ error: "User not found!" });
    }
    return res .status(200).send({ id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin });
  } 
  catch (err) {
    return res.status(401).send({ error: "Invalid token" });
  }
});



// Додати коментар
Router.post("/product/comment/:id", async (req, res) => {
  const { id } = req.params;
  const { user_id, comment } = req.body;
  const product = await Product.findById(id);
  
  if (!product) {
    return res.status(404).send({ error: "product не знайдено" });
  }

  const user = await User.findById(user_id);
  
  product.comments.push({
    name: user.name,
    comment: comment,
    date: new Date(),
  });

  product.hasCommented.push(user_id);

  await product.save();
  return res.status(200).send({ product: product });
});



// Рейтинг
Router.post("/product/rate/:id", async (req, res) => {
  try {
      const { id } = req.params;
      const { rating, user_id } = req.body;
      const product = await Product.findById(id);

      if (!product) {
          return res.status(404).json({ message: "Product not found" });
      }

      let oldRating = product.rating;
      let newRating;

      if (oldRating === 0) {
        newRating = rating;
      }
      else {
        newRating = (oldRating + rating) / 2;
      }

      product.rating = parseFloat(newRating.toFixed(1));
      product.hasRated.push(user_id);
      await product.save();

      return res.status(200).send({ product: product });
  } catch (error) {
      res.status(500).json({ message: "Server error", error });
  }
});



// Profile data
Router.post("/profile", async (req, res) => {
  const { token } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded._id);
    
    if (!user) {
      return res.status(404).send({ error: "User not found!" });
    }

    let reservations;
    if (user.isAdmin) {
      // Якщо користувач - адміністратор, вибираємо всі резервації
      reservations = await Reservation.find( {returned: false} );
    } else {
      // Якщо користувач не адміністратор, вибираємо його власні резервації
      reservations = await Reservation.find({ userId: user._id });
    }

    const products = await Product.find({ authorId: user._id });
    const savedProducts = await Product.find({ saves: decoded._id });
    //const reservations = await Reservation.find({ userId: user._id });
    
    return res.status(200).send({
      id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      products: products,
      savedProducts: savedProducts,
      reservations: reservations,
    });

  } 
  catch (err) {
    return res.status(401).send({ error: "Invalid token" });
  }
});



// Отримати рекомендовані продукти для користувача
const stopWords = ['і', 'й', 'в', 'на', 'з', 'до', 'як', 'по', 'без', 'для', 'та', 'у', 'не', 
   'який', 'яка', 'яке', 'яку', 'він', 'вона', 'воно']; // Список стоп-слів українською
const endings = [
  'а', 'і', 'у', 'е', 'о', 'ою', 'ою', 'ами', 'ами', 'ях', 'и', 'ь', 'я', 'ї', 'є', 'ому', 'им', 'ого', 'их', 'ами', 'ею', 
  'ський', 'ська', 'ській', 'ий', 'ється'
]; // Закінчення для видалення

function removeEndings(word) {
  // Видаляємо закінчення, що знаходяться в масиві endings
  for (const ending of endings) {
    if (word.endsWith(ending)) {
      return word.slice(0, -ending.length); // Вирізаємо закінчення
    }
  }
  return word; // Якщо закінчення не знайдено, повертаємо слово без змін
}

function extractKeywords(description) {
  // Приводимо до нижнього регістру та розбиваємо на слова
  const words = description.toLowerCase().match(/[а-яА-ЯіІєЄґҐ'’`'0-9]+/g) || [];
  
  // Видаляємо закінчення та фільтруємо стоп-слова
  const processedWords = words
    .filter(word => !stopWords.includes(word) && /^[а-яА-ЯіІєЄґҐ]+$/.test(word)) // Вилучаємо стоп-слова
    .map(removeEndings); // Вилучаємо закінчення
  // Фільтруємо стоп-слова та неприпустимі символи

  return [...new Set(processedWords)]; // Повертаємо унікальні слова
}



// Функція для підрахунку відсотку співпадаючих слів
/*
function calculateDescriptionSimilarity(desc1, desc2) {
  const words1 = desc1.toLowerCase().split(/\W+/);
  const words2 = desc2.toLowerCase().split(/\W+/);
  const set1 = new Set(words1);
  const set2 = new Set(words2);
  
  const intersection = [...set1].filter(word => set2.has(word));
  const totalWords = new Set([...words1, ...words2]).size;
  
  return (intersection.length / totalWords) * 100;
}
*/

// Спроба рек + популярні
/*
Router.post('/recommendations12', async (req, res) => {
  const { token } = req.body;

  try {

    if (!token) {
      const products = await Product.find({});
    
      // Обчислюємо середнє значення популярності для всіх продуктів
      const productPopularity = products.map(product => {
        const avgPopularity = (product.rating +
          (product.comments.length * 0.2) +
          (product.saves.length * 0.3) +
          (product.views * 0.5)) / 4;
        return { product, avgPopularity };
      });
    
      // Сортуємо продукти за середнім значенням популярності для книг
      const booksPopularity = productPopularity
        .filter(item => item.product.type === 'Книга')
        .sort((a, b) => b.avgPopularity - a.avgPopularity)
        .slice(0, 5);
    

      // Сортуємо продукти за середнім значенням популярності для пазлів
      const puzzlesPopularity = productPopularity
        .filter(item => item.product.type === 'Пазл')
        .sort((a, b) => b.avgPopularity - a.avgPopularity)
        .slice(0, 5);
    
      return res.json({
        recommendedBooks: booksPopularity.map(item => item.product),
        recommendedPuzzles: puzzlesPopularity.map(item => item.product)
      });
    }
    

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded._id).populate({
      path: 'reservations',
      populate: {
        path: 'product', // Додаємо, щоб заповнити інформацію про продукт
        model: 'Product',
      }
    });

    // Отримуємо останні резервації користувача
    const lastReservations = user.reservations;

    // Отримуємо опис продуктів в резерваціях та витягуємо ключові слова
    const descriptions = lastReservations.map(reservation => reservation.product.content);
    const keywords = descriptions.flatMap(extractKeywords); // Об'єднуємо всі ключові слова з резервацій
    const uniqueKeywords = [...new Set(keywords)]; // Унікальні ключові слова
    console.log("Unique Keywords:", uniqueKeywords);

    // Отримуємо жанри, авторів та вік з продуктів в резерваціях
    const genres = lastReservations.map(reservation => reservation.product.category);
    const authors = lastReservations.map(reservation => reservation.product.author);
    const ages = lastReservations.map(reservation => reservation.product.age);
    
    // Розділяємо рекомендації для книг та пазлів
    const bookRecommendations = [];
    const puzzleRecommendations = [];

    // Створюємо масив умов для пошуку
    const searchConditions = [
      { category: { $in: genres }, author: { $in: authors }, age: { $in: ages } },
      { category: { $in: genres }, author: { $in: authors } },
      { category: { $in: genres }, age: { $in: ages } },
      { author: { $in: authors }, age: { $in: ages } },
      { category: { $in: genres } },
      { author: { $in: authors } },
      { age: { $in: ages } },
    ];

    // Виконуємо пошук для кожної комбінації умов
    for (const conditions of searchConditions) {
      // Додаємо умову для ключових слів в описі
      if (uniqueKeywords.length > 0) {
        conditions.content = { $regex: uniqueKeywords.join('|'), $options: 'i' }; // Пошук по ключовим словам в описі
      }

      // Рекомендації для книг
      const foundBooks = await Product.find({
        ...conditions,
        type: 'Книга', // Пошук лише книг
        _id: { $nin: user.reservations.map(reservation => reservation.product) } // Вилучаємо вже зарезервовані продукти
      });
      bookRecommendations.push(...foundBooks);

      // Рекомендації для пазлів
      const foundPuzzles = await Product.find({
        ...conditions,
        type: 'Пазл', // Пошук лише пазлів
        _id: { $nin: user.reservations.map(reservation => reservation.product) } // Вилучаємо вже зарезервовані продукти
      });
      puzzleRecommendations.push(...foundPuzzles);
    }

    // Обробка унікальних продуктів та підрахунок кількості співпадінь для книг
    const uniqueBookResults = {};
    for (const product of bookRecommendations) {
      if (!uniqueBookResults[product._id]) {
        uniqueBookResults[product._id] = { product, matchCount: 0 };
      }
      uniqueBookResults[product._id].matchCount++;
    }

    // Обробка унікальних продуктів та підрахунок кількості співпадінь для пазлів
    const uniquePuzzleResults = {};
    for (const product of puzzleRecommendations) {
      if (!uniquePuzzleResults[product._id]) {
        uniquePuzzleResults[product._id] = { product, matchCount: 0 };
      }
      uniquePuzzleResults[product._id].matchCount++;
    }

    // Сортуємо продукти за кількістю співпадінь для книг
    const sortedBookResults = Object.values(uniqueBookResults).sort((a, b) => b.matchCount - a.matchCount);
    const recommendedBooks = sortedBookResults.slice(0, 5).map(item => item.product);

    

    // Сортуємо продукти за кількістю співпадінь для пазлів
    const sortedPuzzleResults = Object.values(uniquePuzzleResults).sort((a, b) => b.matchCount - a.matchCount);
    const recommendedPuzzles = sortedPuzzleResults.slice(0, 5).map(item => item.product);


    if ((recommendedBooks.length < 5 || recommendedPuzzles.length < 5)) { 
      const products = await Product.find({});
      const productPopularity = products.map(product => {
        const avgPopularity = (product.rating +
          (product.comments.length * 0.2) +
          (product.saves.length * 0.3) +
          (product.views * 0.5)) / 4;
        return { product, avgPopularity };
      });
    
      const popularBooks = productPopularity
        .filter(item => item.product.type === 'Книга')
        .sort((a, b) => b.avgPopularity - a.avgPopularity)
        .slice(0, 5);
    
      const additionalBooks = popularBooks.filter(book => !recommendedBooks.map(rec => rec._id).includes(book.product._id));
      const recommendedBooks2 = [...recommendedBooks, ...additionalBooks.slice(0, 5 - recommendedBooks.length).map(item => item.product)];
    
      const popularPuzzles = productPopularity
        .filter(item => item.product.type === 'Пазл')
        .sort((a, b) => b.avgPopularity - a.avgPopularity)
        .slice(0, 5);
    
      const additionalPuzzles = popularPuzzles.filter(puzzle => !recommendedPuzzles.map(rec => rec._id).includes(puzzle.product._id));
      const recommendedPuzzles2 = [...recommendedPuzzles, ...additionalPuzzles.slice(0, 5 - recommendedPuzzles.length).map(item => item.product)];
    
      return res.json({
        recommendedBooks: recommendedBooks2,
        recommendedPuzzles: recommendedPuzzles2
      });
    }
    

    res.json({ recommendedBooks, recommendedPuzzles });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Не вдалося отримати рекомендації' });
  }
});
*/


Router.post('/recommendations', async (req, res) => {
  const { token } = req.body;

  try {
    if (!token) {
      const products = await Product.find({});
      const productPopularity = products.map(product => {
        const avgPopularity = (product.rating +
          (product.comments.length * 0.2) +
          (product.saves.length * 0.3) +
          (product.views * 0.5)) / 4;
        return { product, avgPopularity };
      });

      const booksPopularity = productPopularity
        .filter(item => item.product.type === 'Книга')
        .sort((a, b) => b.avgPopularity - a.avgPopularity)
        .slice(0, 5);

      const puzzlesPopularity = productPopularity
        .filter(item => item.product.type === 'Пазл')
        .sort((a, b) => b.avgPopularity - a.avgPopularity)
        .slice(0, 5);

      return res.json({
        recommendedBooks: booksPopularity.map(item => item.product),
        recommendedPuzzles: puzzlesPopularity.map(item => item.product)
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded._id).populate({
      path: 'reservations',
      populate: {
        path: 'product',
        model: 'Product',
      }
    });

    const lastReservations = user.reservations;
    const hasBooks = lastReservations.some(reservation => reservation.product.type === 'Книга');
    const hasPuzzles = lastReservations.some(reservation => reservation.product.type === 'Пазл');

    let recommendedBooks = [];
    if (hasBooks) {
      const descriptions = lastReservations.map(reservation => reservation.product.content);
      const keywords = descriptions.flatMap(extractKeywords);
      const uniqueKeywords = [...new Set(keywords)];

      const genres = lastReservations.map(reservation => reservation.product.category);
      const authors = lastReservations.map(reservation => reservation.product.author);
      const ages = lastReservations.map(reservation => reservation.product.age);

      const searchConditions = [
        { category: { $in: genres }, author: { $in: authors }, age: { $in: ages } },
        { category: { $in: genres }, author: { $in: authors } },
        { category: { $in: genres }, age: { $in: ages } },
        { author: { $in: authors }, age: { $in: ages } },
        { category: { $in: genres } },
        { author: { $in: authors } },
        { age: { $in: ages } },
      ];

      if (uniqueKeywords.length > 0) {
        const keywordCondition = { content: { $regex: uniqueKeywords.join('|'), $options: 'i' } };
        searchConditions.push(keywordCondition);
      }

      const userCategories = [...new Set(lastReservations.map(reservation => reservation.product.category))];
      const categoryRecommendations = {};

      for (const category of userCategories) {
        categoryRecommendations[category] = [];
        for (const conditions of searchConditions) {
          const foundBooks = await Product.find({
            ...conditions,
            type: 'Книга',
            category: category,
            _id: { $nin: user.reservations.map(reservation => reservation.product) }
          });
          categoryRecommendations[category].push(...foundBooks);
        }
      }

      // Збираємо всі книги з категорій і усуваємо дублікати
      recommendedBooks = Object.values(categoryRecommendations)
        .flat() // Розгортання масиву рекомендацій з кожної категорії
        .reduce((acc, product) => {
          acc[product._id] = product; // Використовуємо об'єкт для усунення дублікатів
          return acc;
        }, {});

      // Конвертуємо об'єкт у масив, перемішуємо та обмежуємо до 5
      recommendedBooks = Object.values(recommendedBooks)
        .sort(() => Math.random() - 0.5)
        .slice(0, 5);
    }

    let recommendedPuzzles = [];
    if (hasPuzzles) {
      const descriptions = lastReservations.map(reservation => reservation.product.content);
      const keywords = descriptions.flatMap(extractKeywords);
      const uniqueKeywords = [...new Set(keywords)];

      const genres = lastReservations.map(reservation => reservation.product.category);
      const authors = lastReservations.map(reservation => reservation.product.author);
      const ages = lastReservations.map(reservation => reservation.product.age);

      const searchConditions = [
        { category: { $in: genres }, author: { $in: authors }, age: { $in: ages } },
        { category: { $in: genres }, author: { $in: authors } },
        { category: { $in: genres }, age: { $in: ages } },
        { author: { $in: authors }, age: { $in: ages } },
        { category: { $in: genres } },
        { author: { $in: authors } },
        { age: { $in: ages } },
      ];

      if (uniqueKeywords.length > 0) {
        const keywordCondition = { content: { $regex: uniqueKeywords.join('|'), $options: 'i' } };
        searchConditions.push(keywordCondition);
      }

      const userCategories = [...new Set(lastReservations.map(reservation => reservation.product.category))];
      const categoryRecommendations = {};

      for (const category of userCategories) {
        categoryRecommendations[category] = [];
        for (const conditions of searchConditions) {
          const foundPuzzles = await Product.find({
            ...conditions,
            type: 'Пазл',
            category: category,
            _id: { $nin: user.reservations.map(reservation => reservation.product) }
          });
          categoryRecommendations[category].push(...foundPuzzles);
        }
      }

      // Збираємо всі пазли з категорій і усуваємо дублікати
      recommendedPuzzles = Object.values(categoryRecommendations)
        .flat() // Розгортання масиву рекомендацій з кожної категорії
        .reduce((acc, product) => {
          acc[product._id] = product; // Використовуємо об'єкт для усунення дублікатів
          return acc;
        }, {});

      // Конвертуємо об'єкт у масив, перемішуємо та обмежуємо до 5
      recommendedPuzzles = Object.values(recommendedPuzzles)
        .sort(() => Math.random() - 0.5)
        .slice(0, 5);
    }

    if (!hasBooks) {
      const products = await Product.find({});
      const productPopularity = products.map(product => {
        const avgPopularity = (product.rating +
          (product.comments.length * 0.2) +
          (product.saves.length * 0.3) +
          (product.views * 0.5)) / 4;
        return { product, avgPopularity };
      });

      const booksPopularity = productPopularity
        .filter(item => item.product.type === 'Книга')
        .sort((a, b) => b.avgPopularity - a.avgPopularity)
        .slice(0, 5);

      recommendedBooks = booksPopularity.map(item => item.product);
    }

    if (!hasPuzzles) {
      const products = await Product.find({});
      const productPopularity = products.map(product => {
        const avgPopularity = (product.rating +
          (product.comments.length * 0.2) +
          (product.saves.length * 0.3) +
          (product.views * 0.5)) / 4;
        return { product, avgPopularity };
      });

      const puzzlesPopularity = productPopularity
        .filter(item => item.product.type === 'Пазл')
        .sort((a, b) => b.avgPopularity - a.avgPopularity)
        .slice(0, 5);

      recommendedPuzzles = puzzlesPopularity.map(item => item.product);
    }

    res.json({ recommendedBooks, recommendedPuzzles });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Не вдалося отримати рекомендації' });
  }
});


/*
Router.post('/recommendations2', async (req, res) => {
  const { token } = req.body;

  try {
    if (!token) {
      const products = await Product.find({});
      const productPopularity = products.map(product => {
        const avgPopularity = (product.rating +
          (product.comments.length * 0.2) +
          (product.saves.length * 0.3) +
          (product.views * 0.5)) / 4;
        return { product, avgPopularity };
      });

      const booksPopularity = productPopularity
        .filter(item => item.product.type === 'Книга')
        .sort((a, b) => b.avgPopularity - a.avgPopularity)
        .slice(0, 5);

      const puzzlesPopularity = productPopularity
        .filter(item => item.product.type === 'Пазл')
        .sort((a, b) => b.avgPopularity - a.avgPopularity)
        .slice(0, 5);

      return res.json({
        recommendedBooks: booksPopularity.map(item => item.product),
        recommendedPuzzles: puzzlesPopularity.map(item => item.product)
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded._id).populate({
      path: 'reservations',
      populate: {
        path: 'product',
        model: 'Product',
      }
    });

    const lastReservations = user.reservations;
    const hasBooks = lastReservations.some(reservation => reservation.product.type === 'Книга');
    const hasPuzzles = lastReservations.some(reservation => reservation.product.type === 'Пазл');

    let recommendedBooks = [];
    if (hasBooks) {
      const descriptions = lastReservations.map(reservation => reservation.product.content);
      const keywords = descriptions.flatMap(extractKeywords);
      const uniqueKeywords = [...new Set(keywords)];

      const genres = lastReservations.map(reservation => reservation.product.category);
      const authors = lastReservations.map(reservation => reservation.product.author);
      const ages = lastReservations.map(reservation => reservation.product.age);

      const searchConditions = [
        { category: { $in: genres }, author: { $in: authors }, age: { $in: ages } },
        { category: { $in: genres }, author: { $in: authors } },
        { category: { $in: genres }, age: { $in: ages } },
        { author: { $in: authors }, age: { $in: ages } },
        { category: { $in: genres } },
        { author: { $in: authors } },
        { age: { $in: ages } },
      ];

      if (uniqueKeywords.length > 0) {
        const keywordCondition = { content: { $regex: uniqueKeywords.join('|'), $options: 'i' } };
        searchConditions.push(keywordCondition);
      }

      const userCategories = [...new Set(lastReservations.map(reservation => reservation.product.category))];
      const categoryRecommendations = {};

      for (const category of userCategories) {
        categoryRecommendations[category] = [];
        for (const conditions of searchConditions) {
          const foundBooks = await Product.find({
            ...conditions,
            type: 'Книга',
            category: category,
            _id: { $nin: user.reservations.map(reservation => reservation.product) }
          });
          categoryRecommendations[category].push(...foundBooks);
        }
      }

      // Збираємо всі книги з категорій і усуваємо дублікати
      recommendedBooks = Object.values(categoryRecommendations)
        .flat() // Розгортання масиву рекомендацій з кожної категорії
        .reduce((acc, product) => {
          acc[product._id] = product; // Використовуємо об'єкт для усунення дублікатів
          return acc;
        }, {});

      // Конвертуємо об'єкт у масив, перемішуємо та обмежуємо до 5
      recommendedBooks = Object.values(recommendedBooks)
        .sort(() => Math.random() - 0.5)
        .slice(0, 5);
    }

    let recommendedPuzzles = [];
    if (hasPuzzles) {
      const descriptions = lastReservations.map(reservation => reservation.product.content);
      const keywords = descriptions.flatMap(extractKeywords);
      const uniqueKeywords = [...new Set(keywords)];

      const genres = lastReservations.map(reservation => reservation.product.category);
      const authors = lastReservations.map(reservation => reservation.product.author);
      const ages = lastReservations.map(reservation => reservation.product.age);

      const searchConditions = [
        { category: { $in: genres }, author: { $in: authors }, age: { $in: ages } },
        { category: { $in: genres }, author: { $in: authors } },
        { category: { $in: genres }, age: { $in: ages } },
        { author: { $in: authors }, age: { $in: ages } },
        { category: { $in: genres } },
        { author: { $in: authors } },
        { age: { $in: ages } },
      ];

      if (uniqueKeywords.length > 0) {
        const keywordCondition = { content: { $regex: uniqueKeywords.join('|'), $options: 'i' } };
        searchConditions.push(keywordCondition);
      }

      for (const conditions of searchConditions) {
        const foundPuzzles = await Product.find({
          ...conditions,
          type: 'Пазл',
          _id: { $nin: user.reservations.map(reservation => reservation.product) }
        });
        recommendedPuzzles.push(...foundPuzzles);
      }

      recommendedPuzzles = recommendedPuzzles
        .reduce((acc, product) => {
          acc[product._id] = product;
          return acc;
        }, {});

      recommendedPuzzles = Object.values(recommendedPuzzles)
        .sort(() => Math.random() - 0.5)
        .slice(0, 5);
    }

    if (!hasBooks) {
      const products = await Product.find({});
      const productPopularity = products.map(product => {
        const avgPopularity = (product.rating +
          (product.comments.length * 0.2) +
          (product.saves.length * 0.3) +
          (product.views * 0.5)) / 4;
        return { product, avgPopularity };
      });

      const booksPopularity = productPopularity
        .filter(item => item.product.type === 'Книга')
        .sort((a, b) => b.avgPopularity - a.avgPopularity)
        .slice(0, 5);

      recommendedBooks = booksPopularity.map(item => item.product);
    }

    if (!hasPuzzles) {
      const products = await Product.find({});
      const productPopularity = products.map(product => {
        const avgPopularity = (product.rating +
          (product.comments.length * 0.2) +
          (product.saves.length * 0.3) +
          (product.views * 0.5)) / 4;
        return { product, avgPopularity };
      });

      const puzzlesPopularity = productPopularity
        .filter(item => item.product.type === 'Пазл')
        .sort((a, b) => b.avgPopularity - a.avgPopularity)
        .slice(0, 5);

      recommendedPuzzles = puzzlesPopularity.map(item => item.product);
    }

    res.json({ recommendedBooks, recommendedPuzzles });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Не вдалося отримати рекомендації' });
  }
});
*/


/*
// Рекомендації (перший код)
Router.post('/recommendations0', async (req, res) => {
  const { token } = req.body;

  try {
    if (!token) {
      const products = await Product.find({});

      // Обчислюємо середнє значення популярності для всіх продуктів
      const productPopularity = products.map(product => {
        const avgPopularity = (product.rating +
          (product.comments.length * 0.2) +
          (product.saves.length * 0.3) +
          (product.views * 0.5)) / 4;
        return { product, avgPopularity };
      });

      // Сортуємо продукти за середнім значенням популярності для книг
      const booksPopularity = productPopularity
        .filter(item => item.product.type === 'Книга')
        .sort((a, b) => b.avgPopularity - a.avgPopularity)
        .slice(0, 5);

      // Сортуємо продукти за середнім значенням популярності для пазлів
      const puzzlesPopularity = productPopularity
        .filter(item => item.product.type === 'Пазл')
        .sort((a, b) => b.avgPopularity - a.avgPopularity)
        .slice(0, 5);

      return res.json({
        recommendedBooks: booksPopularity.map(item => item.product),
        recommendedPuzzles: puzzlesPopularity.map(item => item.product)
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded._id).populate({
      path: 'reservations',
      populate: {
        path: 'product',
        model: 'Product',
      }
    });

    const lastReservations = user.reservations;
    const hasBooks = lastReservations.some(reservation => reservation.product.type === 'Книга');
    const hasPuzzles = lastReservations.some(reservation => reservation.product.type === 'Пазл');

    // Рекомендації для книг
    let recommendedBooks = [];
    if (hasBooks) {
      const descriptions = lastReservations.map(reservation => reservation.product.content);
      const keywords = descriptions.flatMap(extractKeywords);
      const uniqueKeywords = [...new Set(keywords)];

      const genres = lastReservations.map(reservation => reservation.product.category);
      const authors = lastReservations.map(reservation => reservation.product.author);
      const ages = lastReservations.map(reservation => reservation.product.age);
      
      const searchConditions = [
        { category: { $in: genres }, author: { $in: authors }, age: { $in: ages } },
        { category: { $in: genres }, author: { $in: authors } },
        { category: { $in: genres }, age: { $in: ages } },
        { author: { $in: authors }, age: { $in: ages } },
        { category: { $in: genres } },
        { author: { $in: authors } },
        { age: { $in: ages } },
      ];
      
      if (uniqueKeywords.length > 0) {
        const keywordCondition = { content: { $regex: uniqueKeywords.join('|'), $options: 'i' } };
        searchConditions.push(keywordCondition);
      }

      for (const conditions of searchConditions) {
        const foundBooks = await Product.find({
          ...conditions,
          type: 'Книга',
          _id: { $nin: user.reservations.map(reservation => reservation.product) }
        });
        recommendedBooks.push(...foundBooks);
      }

      // Обробка унікальних продуктів та підрахунок кількості співпадінь для книг
      const uniqueBookResults = {};
      for (const product of recommendedBooks) {
        if (!uniqueBookResults[product._id]) {
          uniqueBookResults[product._id] = { product, matchCount: 0 };
        }
        uniqueBookResults[product._id].matchCount++;
      }

      const sortedBookResults = Object.values(uniqueBookResults).sort((a, b) => b.matchCount - a.matchCount);
      recommendedBooks = sortedBookResults.slice(0, 5).map(item => item.product);
    }

    // Рекомендації для пазлів
    let recommendedPuzzles = [];
    if (hasPuzzles) {
      const descriptions = lastReservations.map(reservation => reservation.product.content);
      const keywords = descriptions.flatMap(extractKeywords);
      const uniqueKeywords = [...new Set(keywords)];

      const genres = lastReservations.map(reservation => reservation.product.category);
      const authors = lastReservations.map(reservation => reservation.product.author);
      const ages = lastReservations.map(reservation => reservation.product.age);
      
      const searchConditions = [
        { category: { $in: genres }, author: { $in: authors }, age: { $in: ages } },
        { category: { $in: genres }, author: { $in: authors } },
        { category: { $in: genres }, age: { $in: ages } },
        { author: { $in: authors }, age: { $in: ages } },
        { category: { $in: genres } },
        { author: { $in: authors } },
        { age: { $in: ages } },
      ];
      
      if (uniqueKeywords.length > 0) {
        const keywordCondition = { content: { $regex: uniqueKeywords.join('|'), $options: 'i' } };
        searchConditions.push(keywordCondition);
      }

      for (const conditions of searchConditions) {
        const foundPuzzles = await Product.find({
          ...conditions,
          type: 'Пазл',
          _id: { $nin: user.reservations.map(reservation => reservation.product) }
        });
        recommendedPuzzles.push(...foundPuzzles);
      }

      // Обробка унікальних продуктів та підрахунок кількості співпадінь для пазлів
      const uniquePuzzleResults = {};
      for (const product of recommendedPuzzles) {
        if (!uniquePuzzleResults[product._id]) {
          uniquePuzzleResults[product._id] = { product, matchCount: 0 };
        }
        uniquePuzzleResults[product._id].matchCount++;
      }

      const sortedPuzzleResults = Object.values(uniquePuzzleResults).sort((a, b) => b.matchCount - a.matchCount);
      recommendedPuzzles = sortedPuzzleResults.slice(0, 5).map(item => item.product);
    }

    // Якщо у користувача немає резервованих книг, пропонуємо найпопулярніші
    if (!hasBooks) {
      const products = await Product.find({});
      const productPopularity = products.map(product => {
        const avgPopularity = (product.rating +
          (product.comments.length * 0.2) +
          (product.saves.length * 0.3) +
          (product.views * 0.5)) / 4;
        return { product, avgPopularity };
      });

      const booksPopularity = productPopularity
        .filter(item => item.product.type === 'Книга')
        .sort((a, b) => b.avgPopularity - a.avgPopularity)
        .slice(0, 5);

      recommendedBooks = booksPopularity.map(item => item.product);
    }


    // Якщо у користувача немає резервованих пазлів, пропонуємо найпопулярніші
    if (!hasPuzzles) {
      const products = await Product.find({});
      const productPopularity = products.map(product => {
        const avgPopularity = (product.rating +
          (product.comments.length * 0.2) +
          (product.saves.length * 0.3) +
          (product.views * 0.5)) / 4;
        return { product, avgPopularity };
      });

      const puzzlesPopularity = productPopularity
        .filter(item => item.product.type === 'Пазл')
        .sort((a, b) => b.avgPopularity - a.avgPopularity)
        .slice(0, 5);

      recommendedPuzzles = puzzlesPopularity.map(item => item.product);
    }

    res.json({ recommendedBooks, recommendedPuzzles });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Не вдалося отримати рекомендації' });
  }
});
*/


// Резервації користувача
Router.post("/reservations", async (req, res) => {
  const { token } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded._id);
    
    if (!user) {
      return res.status(404).send({ error: "User not found!" });
    }

    const reservations = await Reservation.find({ userId: user._id });
    
    return res.status(200).send({
      reservations: reservations,
    });

  } 
  catch (err) {
    return res.status(401).send({ error: "Invalid token" });
  }
});



// All products
Router.get("/products", async (req, res) => {
  const products = await Product.find({});
  return res.status(200).send({ products: products });
});



// Search product by title and author
Router.get("/search/:query", async (req, res) => {
  const { query } = req.params;

  try {
    const products = await Product.find({
      $or: [
        { title: { $regex: query, $options: "i" } },
        { author: { $regex: query, $options: "i" } }
      ]
    });

    return res.status(200).send({ products: products });
  } catch (error) {
    return res.status(500).send({ error: "Internal Server Error" });
  }
});



// Get product
Router.get("/product/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findById(id);
    
    if (!product) {
      return res.status(404).send({ error: "Product not found!" });
    }
    
    return res.status(200).send({ product: product });
  } 
  catch (err) {
    return res.status(404).send({ error: "Product not found!" });
  }
});



// Get user
Router.get("/userdata/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).send({ error: "User not found!" });
    }
    
    return res.status(200).send({ user: user });
  } 
  catch (err) {
    return res.status(404).send({ error: "User not found!" });
  }
});



// Product views
Router.post("/product/:id/views", (req, res) => {
  const { id } = req.params;
  Product.findById(id)
    .then((product) => {
      if (!product) {
        return res.status(404).send({ error: "Product not found!" });
      }
      product.views++;
      product.save();
      return res.status(200).send({ product: product });
    })
    .catch((err) => {
      return res.status(404).send({ error: "Product not found!" });
    });
});



// Save product
Router.post("/product/save/:id", async (req, res) => {
  const { id } = req.params;
  const { user_id } = req.body;
  const product = await Product.findById(id);
  
  if (!product) {
    return res.status(404).send({ error: "Product not found!" });
  }

  product.saves.push(user_id);

  await product.save();
  return res.status(200).send({ product: product });
});



// Remove product from saved
Router.post("/product/unsave/:id", async (req, res) => {
  const { id } = req.params;
  const { user_id } = req.body;
  const product = await Product.findById(id);
  
  if (!product) {
    return res.status(404).send({ error: "Product not found!" });
  }

  const index = product.saves.indexOf(user_id);
  product.saves.splice(index, 1);
  await product.save();
  return res.status(200).send({ product: product });
});



// Create reservation
Router.post('/reserve', async (req, res) => {
  //const { id } = req.params;
  const { id, fullName, startDate, endDate, phone, address, token } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded._id);
    

    if (!user) {
      return res.status(404).send({ error: "User not found!" });
    }

    const product = await Product.findById(id);
    
    if (!product) {
      return res.status(404).send({ error: "Product not found!" });
    }
    
    if (product.amountInStock <= 0) {
      return res.status(400).send({ error: "Product out of stock!" });
    }

    product.amountInStock -= 1;
    await product.save();

    const reservation = new Reservation({
      product: product._id,
      productType: product.type,
      fullName: fullName,
      userId: user._id,
      startDate: startDate,
      endDate: endDate,
      phone: phone,
      address: address,
    });
    
    await reservation.save();
    user.reservations.push(reservation._id);
    await user.save();
    
    return res.status(200).send({ message: "reservation created successfully!" });
    
  } 
  catch (err) {
    return res.status(401).send({ error: "Invalid token" });
  }
 
});



// Продовжити резервацію
Router.post('/reservation/:id/extend', async (req, res) => {
  const { id } = req.params;
  const { token, newEndDate } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded._id);
    
    if (!user) {
      return res.status(404).send({ error: "User not found!" });
    }

    const reservation = await Reservation.findById(id);
    
    if (!reservation) {
      return res.status(404).send({ error: "Reservation not found!" });
    }

    // Перевіряємо, чи є користувач власником резервації або адміністратором
    if (reservation.userId.toString() !== user._id.toString() && !user.isAdmin) {
      return res.status(403).send({ error: "Not authorized to extend this reservation" });
    }


    if (reservation.extended) {
      return res.status(400).send({ error: "You can only extend the reservation once" });
    }

    reservation.endDate = newEndDate;
    reservation.extended = true;
    await reservation.save();

    return res.status(200).send({ message: "Reservation extended successfully!" });
  } 
  catch (err) {
    console.error(err);
    return res.status(500).send({ error: "Server error" });
  }
});



// Відправка резервації
Router.post('/reservation/:id/sent', async (req, res) => {
  const { id } = req.params;
  const { sent } = req.body; // Отримання даних з тіла запиту
  
  try {
    const reservation = await Reservation.findById(id);
    reservation.sent = sent; // Оновлення поля `sent`
    
    await reservation.save();
    res.status(200).send(reservation.sent);

  } catch (error) {
    console.error(error);
    res.status(500).send("Помилка сервера");
  }
});



// Повернення резервації
Router.post('/reservation/:id/returned', async (req, res) => {
  const { id } = req.params;
  const { returned } = req.body; // Отримання даних з тіла запиту
  
  try {
    const reservation = await Reservation.findById(id);
    reservation.returned = returned; // Оновлення поля `returned`
    
    await reservation.save();

    const product = await Product.findById(reservation.product);

    if (!product) {
      return res.status(404).send({ error: "Product not found!" });
    }

    product.amountInStock += 1; // Збільшення кількості продукту
    await product.save();

    res.status(200).send({ message: "Product returned successfully!", returned: reservation.returned });

    //res.status(200).send(reservation.returned);

  } catch (error) {
    console.error(error);
    res.status(500).send("Помилка сервера");
  }
});



// Delete reservation
Router.post("/delete/reservation", async (req, res) => {
  const { id, token } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded._id);
    
    if (!user) {
      return res.status(404).send({ error: "User not found!" });
    }

    const reservation = await Reservation.findById(id);
    
    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    await reservation.remove();
    const reservations = await Reservation.find({ });
    
    const product = await Product.findById(reservation.product);
    product.amountInStock += 1; // Збільшення кількості продукту
    await product.save();

    return res.status(200).send({ reservations: reservations });

  } catch (error) {
    return res.status(401).send({ error: "Invalid token" });
  }
});



// Create new product
Router.post("/create", upload.single("image"), async (req, res) => {
  const { title, author, aboutAuthor, content, date, category, type, amountPagesDetails, 
    yearWeight, languageCountry, age, coverSize, publisherPicSize, amountInStock, token } = req.body;

  if (req.file) {
    cloudinary.uploader.upload(
      req.file.path,
      { folder: "bookPuzzle" },
      async (err, result) => {
        if (err) {
          return res.status(500).json({ error: "Internal server error" });
        }

        const image = result.secure_url;
        const cloudinaryId = result.public_id;
        
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          const user = await User.findById(decoded._id);
          
          if (!user) {
            return res.status(404).send({ error: "User not found!" });
          }

          if (!user.isAdmin) {
            return res.status(404).send({ error: "User not admin!" });
          }
          
          const product = new Product({
            title,
            author,
            aboutAuthor,
            content,
            image,
            cloudinaryId,
            authorId: user._id,
            createdAt: date,
            category,
            type,
            amountPagesDetails,
            yearWeight,
            languageCountry, 
            age, 
            coverSize, 
            publisherPicSize,
            amountInStock,
          });

          await product.save();
          user.products.push(product._id);
          await user.save();
          return res.status(200).send({ message: "Product created successfully!" });
        } 
        catch (err) {
          return res.status(401).send({ error: "Invalid token" });
        }
      }
    );
  } 
  else {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded._id);
      
      if (!user) {
        return res.status(404).send({ error: "User not found!" });
      }
      
      const product = new Product({
        title,
        content,
        author,
        aboutAuthor,
        authorId: user._id,
        createdAt: date,
        category,
        type,
        amountPagesDetails,
        aboutAuthor,
        yearWeight,
        languageCountry, 
        age, 
        coverSize, 
        publisherPicSize,
        amountInStock,
      });

      await product.save();
      user.products.push(product._id);
      await user.save();
      return res.status(200).send({ message: "Product created successfully!" });
    } 
    catch (err) {
      return res.status(401).send({ error: "Invalid token" });
    }
  }
});



// Edit product
Router.post("/edit", upload.single("image"), async (req, res) => {
  const { title, author, aboutAuthor, content, date, id, token, image, category, 
    amountPagesDetails, yearWeight, languageCountry, age, coverSize, publisherPicSize, amountInStock } = req.body;
  if (req.file) {
    const product = await Product.findById(id);


    if (!product) {
      return res.status(404).send({ error: "Product not found!" });
    }

    if (product.image) {
      cloudinary.uploader.destroy(product.cloudinaryId, async (err, result) => {
        if (err) {
          return res.status(500).json({ error: "Internal server error" });
        }
      });
    }

    cloudinary.uploader.upload(
      req.file.path,
      { folder: "bookPuzzle" },
      async (err, result) => {
        if (err) {
          return res.status(500).json({ error: "Internal server error" });
        }
        const image = result.secure_url;
        const cloudinaryId = result.public_id;
        
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          const user = await User.findById(decoded._id);
          
          if (!user) {
            return res.status(404).send({ error: "User not found!" });
          }
          const product = await Product.findById(id);
          
          if (!product) {
            return res.status(404).send({ error: "Product not found!" });
          }
          
          if (product.authorId.toString() !== user._id.toString()) {
            return res.status(401).send({ error: "Unauthorized!" });
          }

          product.title = title;
          product.author = author;
          product.aboutAuthor = aboutAuthor;
          product.content = content;
          product.image = image;
          product.category = category;
          product.amountPagesDetails = amountPagesDetails;
          product.yearWeight = yearWeight;
          product.languageCountry = languageCountry;
          product.age = age;
          product.coverSize = coverSize;
          product.publisherPicSize = publisherPicSize;
          product.amountInStock = amountInStock;
          product.cloudinaryId = cloudinaryId;
          await product.save();
          return res.status(200).send({ message: "Product updated successfully!" });
        } 
        catch (err) {
          return res.status(401).send({ error: "Invalid token" });
        }
      }
    );
  } 
  else {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded._id);
      if (!user) {
        return res.status(404).send({ error: "User not found!" });
      }
      const product = await Product.findById(id);
      
      if (!product) {
        return res.status(404).send({ error: "Product not found!" });
      }
      
      if (product.authorId.toString() !== user._id.toString()) {
        return res.status(401).send({ error: "Unauthorized!" });
      }
      
      if (product.image && image === "null") {
        cloudinary.uploader.destroy(product.cloudinaryId, async (err, result) => {
          if (err) {
            return res.status(500).json({ error: "Internal server error" });
          }
        });
        product.image = null;
        product.cloudinaryId = null;
      }

      product.title = title;
      product.author = author;
      product.aboutAuthor = aboutAuthor;
      product.content = content;
      product.category = category;
      product.amountPagesDetails = amountPagesDetails;
      product.yearWeight = yearWeight;
      product.languageCountry = languageCountry;
      product.age = age;
      product.coverSize = coverSize;
      product.publisherPicSize = publisherPicSize;
      product.amountInStock =amountInStock;
      await product.save();
      return res.status(200).send({ message: "Product updated successfully!" });
    } catch (err) {
      return res.status(401).send({ error: "Invalid token" });
    }
  }
});



// Delete product
Router.post("/delete", upload.single("image"), async (req, res) => {
  const { id, token } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded._id);
    
    if (!user) {
      return res.status(404).send({ error: "User not found!" });
    }
    const product = await Product.findById(id);
    
    if (!product) {
      return res.status(404).send({ error: "Product not found!" });
    }
    const index = user.products.indexOf(id);
    user.products.splice(index, 1);
    await user.save();

    if (product.cloudinaryId) {
      cloudinary.uploader.destroy(product.cloudinaryId, (err, result) => {
        if (err) {
          return res.status(500).json({ error: "Internal server error" });
        }
      });
    }

    await product.remove();
    const products = await Product.find({ authorId: user._id });
    const savedProducts = await Product.find({ saves: decoded._id });
    return res.status(200).send({ products: products, savedProducts: savedProducts });
  } 
  catch (err) {
    return res.status(401).send({ error: "Invalid token" });
  }
});


module.exports = Router;

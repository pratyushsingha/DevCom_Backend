import dotenv from 'dotenv';
import connectDB from './src/db/index.js';
import { faker } from '@faker-js/faker';
import { Category } from './models/Category.model.js';
import { Product } from './models/product.model.js';
import { Address } from './models/address.model.js';
import { User } from './models/user.model.js';
import { Review } from './models/review.model.js';

dotenv.config();

await connectDB();

const seedCategories = async (users) => {
  const categories = [];

  for (let i = 0; i < 10; i++) {
    categories.push({
      name: faker.commerce.department(),
      owner: users[Math.floor(Math.random() * users.length)]._id
    });
  }

  const createdCategories = await Category.insertMany(categories);
  console.log('Categories seeded!');
  return createdCategories;
};

const seedProducts = async (categories, users) => {
  const products = [];

  for (let i = 0; i < 50; i++) {
    products.push({
      name: faker.commerce.productName(),
      price: parseFloat(faker.commerce.price()),
      description: faker.commerce.productDescription(),
      category: categories[Math.floor(Math.random() * categories.length)]._id,
      stock: Math.floor(Math.random() * 100) + 1,
      mainImage: faker.image.urlLoremFlickr(),
      owner: users[Math.floor(Math.random() * users.length)]._id
    });
  }

  const createdProducts = await Product.insertMany(products);
  console.log('Products seeded!');
  return createdProducts;
};

const seedUsers = async () => {
  const users = [];

  for (let i = 0; i < 20; i++) {
    users.push({
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      avatar: faker.image.avatar(),
      username: faker.internet.userName()
    });
  }

  const createdUsers = await User.insertMany(users);
  console.log('Users seeded!');
  return createdUsers;
};

const seedAddresses = async (users) => {
  const addresses = [];

  for (let i = 0; i < 20; i++) {
    addresses.push({
      addressLine1: faker.location.streetAddress(),
      owner: users[Math.floor(Math.random() * users.length)]._id,
      city: faker.location.city(),
      state: faker.location.state(),
      country: faker.location.country(),
      pincode: Math.floor(Math.random() * 1000000)
    });
  }

  const createdAddresses = await Address.insertMany(addresses);
  console.log('Addresses seeded!');
  return createdAddresses;
};

const seedReviews = async (users, products) => {
  const reviews = [];

  for (let i = 0; i < 50; i++) {
    reviews.push({
      owner: users[Math.floor(Math.random() * users.length)]._id,
      product: products[Math.floor(Math.random() * products.length)]._id,
      starRatting: Math.floor(Math.random() * 5) + 1,
      reviewDescription: faker.lorem.sentence(),
      productImage: [faker.image.urlLoremFlickr()]
    });
  }

  await Review.insertMany(reviews);
  console.log('Reviews seeded!');
};



const seedData = async () => {
  try {
    await Product.deleteMany({});
    await User.deleteMany({});
    await Address.deleteMany({});
    await Review.deleteMany({});

    const users = await seedUsers();
    const categories = await seedCategories(users);
    const products = await seedProducts(categories, users);
    await seedAddresses(users);
    await seedReviews(users, products);

    console.log('Database seeded!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding the database:', error);
    process.exit(1);
  }
};

seedData();

const { Sequelize } = require('sequelize');
require('dotenv').config();

const name = process.env.DB_DATABASE;
const username = process.env.DB_USERNAME;
const password = process.env.DB_PASSWORD;
const host = process.env.DB_HOST;
const dialect = 'mysql';

const sequelize = new Sequelize(name, username, password, {
    host,
    dialect
});

module.exports = sequelize
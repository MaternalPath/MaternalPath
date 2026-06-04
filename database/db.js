const { Sequelize } = require('sequelize');

const name = process.env.DB_DATABASE || process.env.DB_NAME;
const username = process.env.DB_USERNAME;
const password = process.env.DB_PASSWORD;
const host = process.env.DB_HOST;
const dialect = process.env.DB_DIALECT || 'mysql';

const sequelize = new Sequelize(name, username, password, {
    host,
    dialect
});

module.exports = sequelize
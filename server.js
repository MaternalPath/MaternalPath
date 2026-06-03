require('dotenv').config();
const express = require('express');
const PORT = process.env.PORT || 2245;
const sequelize = require('./database/db');
const motherRouter = require('./routes/mother');
const hospitalRouter = require('./routes/hospital');

const app = express();
app.use(express.json());

app.use('/api/v1', motherRouter);
app.use('/api/v1', hospitalRouter); 

app.use((error, req, res, next) => {
    const status = error.statusCode || error.status || 500;
    res.status(status).json({
        message: error.message || 'Internal Server Error',
        status
    });
});

const database = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection to Database has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the Database:', error);
    }
};

database()

app.listen(PORT, () => {
    console.log(`Server is listening to Port: ${PORT}`)
});
require('dotenv').config();
const express = require('express');
const PORT = process.env.PORT || 3002;
const rateLimiter = require('./middlewares/rateLimiter')
const sequelize = require('./database/db');
const motherRouter = require('./routes/mother');
const hospitalRouter = require('./routes/hospital');
const adminRouter = require('./routes/admin');
const uploadedBillRouter = require('./routes/uploadedbill');
const paymentRouter = require('./routes/payment')
const trimesterRouter = require('./routes/trimester')
const hospitalDashBoardRouter = require('./routes/hospitalDashBoard');
const verifyPatientFundRouter = require('./routes/verifyPatientFund');
const billRouter = require('./routes/checkBill')
const patientRouter = require('./routes/patient');
const notificationRouter = require('./routes/notification');
const dashRouter = require('./routes/dashboardOverview');
const trackerRouter = require('./routes/pregnancyTracker');
const emergencyRouter = require('./routes/emergencyWallet');
const motherNotificationRouter = require('./routes/motherNotification');
const guidanceRouter = require('./routes/healthGuidance');
const expressSession = require('express-session')
const passport = require('passport');
require('./controller/mother')
require('./database/db')
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const cors = require('cors');
const redisClient = require('./config/redis');
const morgan = require('morgan');


 
const app = express();
app.use(cors())
app.use(express.json());
app.use(expressSession({secret: 'olachi', saveUninitialized: false, resave: false}))
app.use(passport.initialize());
app.use(passport.session())
app.use(morgan('dev'));


app.use('/api/v1/mother', motherRouter);
app.use('/api/v1/hospital', hospitalRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/bill', uploadedBillRouter);
app.use('/api/v1/payment', paymentRouter);
app.use('/api/v1', trimesterRouter);
app.use('/api/v1', billRouter);
app.use('/api/v1/hospital', hospitalDashBoardRouter);
app.use('/api/v1/hospital', verifyPatientFundRouter);
app.use('/api/v1', patientRouter);
app.use('/api/v1', dashRouter);
app.use('/api/v1', emergencyRouter);
app.use('/api/v1/tracker', trackerRouter);
app.use('/api/v1/mothers', motherNotificationRouter);
app.use('/api/v1/notifications', notificationRouter);
app.use('/api/v1/guide', guidanceRouter);

app.get('/', (req, res) => {
    res.send('Welcome to MaternalPath API');
});

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'MaternalPath Web Application',
    version: '1.0.0',
    description:
      'This is a REST API application made with Express. It retrieves data from JSONPlaceholder.',
    license: {
      name: 'Official URL',
      url: 'https://google.com',
    },
    contact: {
      name: 'JSONPlaceholder',
      url: 'https://jsonplaceholder.typicode.com',
    },
  },
  servers: [
    {
      url: 'https://maternalpath-h56a.onrender.com',
      description: 'Development server',
    },
    {
      url: 'http://localhost:2245',
      description: 'Development server',
    },
  ],
  security: [
    {
        bearerAuth: []
    }
  ],
  components: {
    securitySchemes: {
        bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
        }
    }
  }
};

const options = {
    swaggerDefinition,
    apis: ['./routes/*.js', './routes/**/*.js']
}

const swaggerSpec = swaggerJsdoc(options);

app.use('/api/v1/documentation', swaggerUi.serve, swaggerUi.setup(swaggerSpec))



app.use((err, req, res, next) => {
    const status = err.statusCode || err.status || 500;
    res.status(status).json({
        message: err.message || 'Internal Server Error',
        status
    });
    if (err.name === 'MulterError'){
        return res.status(400).json({
            message: 'File upload failed'
        })
    }
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            message: 'Session expired, please login again'
        })
    }
    res.status(500).json({
        message: err.message,
        status
    })
});

const database = async () => {
    try {
      redisClient.connect()
        .then(() => {
          console.log('Connected to Redis');
      }).catch((err) => {
          console.error('Error connecting to Redis: ', err);
      });
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

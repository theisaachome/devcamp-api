const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const fileupload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const errorHanlder = require('./middleware/error');
const connectDb = require('./config/db');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');


// load env vars
dotenv.config({path:'./config/config.env'});

// Connect to database
connectDb();
//Route files
const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');
const auth = require('./routes/auth');
const users = require('./routes/user');
const reviews = require('./routes/review');


const app = express();

// Body Parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());



// Dev logginng middleware
if(process.env.NODE_ENV == 'development'){
    app.use(morgan('dev'));
}
// File Upload
app.use(fileupload());

// Sanitize data
app.use(mongoSanitize());


// Prevent XSS attacks
app.use(xss());


// Set security headers
app.use(helmet());

// Rate limitting
const limiter = rateLimit({
    windowMs:10*60* 1000,
    max:100
});
app.use(limiter);
// Prevent http param pollution
app.use(hpp());

// Enable  CORS
app.use(cors());

// Set static folder
app.use(express.static(path.join(__dirname,'public')));
// Mount routers
app.use('/api/v1/bootcamps',bootcamps);
app.use('/api/v1/courses',courses);
app.use('/api/v1/auth',auth);
app.use('/api/v1/users',users);
app.use('/api/v1/reviews',reviews);

//Middleware
//this middleware must come after routes
app.use(errorHanlder);



const PORT = process.env.PORT || 5000;
const server =app.listen((PORT), () => {
    console.log(`Server Running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold);
});

// Handle unhandled promise rejections

process.on('unhandledRejection',(err,promise)=>{
    console.log(`Error : ${err.message}`.red);

    //Close Server & exit process
    server.close(() => process.exit(1));
});
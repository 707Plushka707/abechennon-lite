const mongoose = require('mongoose');
require('dotenv').config();

const dbConnection = async() => {
    try {
        await mongoose.connect(process.env.MONGODB_CNN, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
            useCreateIndex: true
        });
        console.log('- Mongo Database up!');

    } catch (error) {
        console.log(error);
        throw new Error('Connection error Mongo Database');
    };
};

// let urlDB;

// if (process.env.NODE_ENV === 'dev') {
//     urlDB = 'mongodb://localhost:27017/bot1';
// } else {
//     urlDB = process.env.MONGO_URI;
// }
// process.env.URLDB = urlDB;

module.exports = { dbConnection };
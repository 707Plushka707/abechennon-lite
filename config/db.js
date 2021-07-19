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

module.exports = { dbConnection };
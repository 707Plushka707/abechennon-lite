const mongoose = require('mongoose');

async function conectMongoose() {
    try {
        const db = await mongoose.connect(process.env.URLDB, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true },
            (err, res) => {
                if (err) throw err;
                let response = 'MongoDB ONLINE!';
                return console.log(response);
            });
    } catch (err) {
        throw err;
    };
};

conectMongoose();

module.exports = conectMongoose;
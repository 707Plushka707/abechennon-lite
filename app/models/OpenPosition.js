const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const openPositionSchema = new Schema({

    amount: { // executedQty: '0.007',
        type: String,
        required: true,
    },

    transaction_code: { // "buy" // side: 'BUY',
        type: String,
        required: true,
    },

    symbol: { // "adbe" // symbol: 'ETHUSDT',
        type: String,
        required: true,
    },

    price: { // "19.1072802650074180519368383102118968963623046875" // price: '1922.63',
        type: String,
        required: true,
    },
    total: { //"143572.1039112657392422534031" // cummulativeQuoteQty: '13.45841',
        type: String,
        required: true,
    },

    date: {
        type: Date,
        default: Date.now(),
    }

}, { versionKey: false });


module.exports = mongoose.model('OpenPosition', openPositionSchema);
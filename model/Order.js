const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
    date: Number, // 2003 - 09 - 09 T00: 00: 00.000 + 00: 00 // transactTime: 1626463141497,
    amount: String, // executedQty: '0.007',
    transaction_code: String, // "buy" // side: 'BUY',
    symbol: String, // "adbe" // symbol: 'ETHUSDT',
    price: String, // "19.1072802650074180519368383102118968963623046875" // price: '1922.63',
    total: String, //"143572.1039112657392422534031" // cummulativeQuoteQty: '13.45841',
}, { versionKey: false });

module.exports = mongoose.model('orders', orderSchema);
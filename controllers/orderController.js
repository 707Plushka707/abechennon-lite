const Order = require('../model/Order');

// const display = (req, res) => {
//     Order.find({}, (error, orders) => {
//         if (error) {
//             return res.status(500).json({
//                 message: 'error mostrando las ordenes'
//             });
//         };
//         console.log(orders);
//     });
// };
// module.exports = { display }

module.exports.display = (req, res) => {
    Order.find({}, (error, orders) => {
        if (error) {
            return res.status(500).json({
                message: 'error mostrando las ordenes'
            });
        };
        console.log(orders);
    });
};
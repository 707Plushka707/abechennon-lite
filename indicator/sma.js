const { sumArray } = require('./utils');

// tiene que dar de resultado: sma 52127.64 
const src = [45135.66, 49587.03, 48440.65, 50349.37, 48374.09, 48751.71, 48882.2, 50971.75, 52375.17, 54884.5, 55851.59, 57773.16, 57221.72, 61188.39];

const sma = (src, length) => {

    let sum = sumArray(src);

    let sma = sum / length;
    return sma;
};

// console.log("Sma: " + sma(src, 14))

module.exports = sma;
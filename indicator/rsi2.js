const ema = require('./ema');

const arrayPrueba2 = [45135.66, 49587.03, 48440.65, 50349.37, 48374.09, 48751.71, 48882.2, 50971.75, 52375.17, 54884.5, 55851.59, 57773.16, 57221.72, 61188.39]; // tiene que dar de resultado: rsi 72.71
// const arrayPrueba3 = [45135.66, 49587.03, 48440.65, 50349.37, 48374.09, 48751.71, 48882.2, 50971.75, 52375.17, 54884.5, 55851.59, 57773.16, 57221.72, 61188.39]; //

// arrayGain: 4451.369999999995,1908.7200000000012,377.6200000000026,130.48999999999796,2089.550000000003,1403.4199999999983,
// 2509.3300000000017,967.0899999999965,1921.570000000007,3966.6699999999983
// arrayLoss: 1146.3799999999974,1975.280000000006,551.4400000000023
const change = (val, idx, arrayPrueba2) => { //x - x[y]
    if (arrayPrueba2[idx] == undefined || arrayPrueba2[idx + 1] == undefined) {
        return 0;
    } else {
        let change = arrayPrueba2[idx] - arrayPrueba2[idx + 1];
        return change;
    };
};

const sma = (arrayPrueba2, period) => {
    let sum = arrayPrueba2.reduce((acc, cur, idx, src) => {
        acc = acc + cur;
        return acc;
    });
    let sma = sum / period;
    return sma;
};

//sum := na(sum[1]) ? sma(src, length) : alpha * precioActual + (1 - alpha) * emaAnterior o sma
const ema = (src, length) => {
    const alpha = 2 / (length + 1);
    let res;

    src.map((curr, idx, array) => {
        res = alpha * curr + (1 - alpha) * 52575
    });
    return res;
};
// console.log(ema(arrayPrueba2, 14));

//sum := na(sum[1]) ? sma(src, length) : alpha * src + (1 - alpha) * nz(sum[1])
const rma = (array, period) => {
    const alpha = 1 / period;
    let sum = 0;
    array.forEach((val, idx, array, period) => {
        sum = sum + val;
    });
    let res = alpha * sum + (1 - alpha) * sum;

    return res;
};

//rs = rma(u, y) / rma(d, y)
const rs = (arrayGain, arrayLoss, period) => {
    let res = rma(arrayGain, period) / rma(arrayLoss, period);
    return res;
};

//======================================================================================================

const rsi = (arrayPrueba2, period) => {
    let arrayGain = [];
    let arrayLoss = [];

    arrayPrueba2.forEach((val, idx, arrayPrueba2) => {
        change(val, idx, arrayPrueba2) >= 0 ? arrayGain.push(change(val, idx, arrayPrueba2)) : 0.0
        change(val, idx, arrayPrueba2) < 0 ? arrayLoss.push(change(val, idx, arrayPrueba2) * -1) : 0.0
    });
    console.log(arrayGain)
    console.log(arrayLoss)

    let res = 100 - (100 / (1 + rs(arrayGain, arrayLoss, period)));

    return res;
};

// console.log(rsi(arrayPrueba2, 14));


//======================================================================================================
//======================================================================================================

// arrayPrueba2.forEach((val, idx, arrayPrueba2) => {
//     //======================================================================================================
//     // u = max(x - x[1], 0) // upward change
//     // d = max(x[1] - x, 0)// downward change

//     // let changeU = arrayPrueba2[idx] - arrayPrueba2[idx + 1];
//     // let changeD = arrayPrueba2[idx + 1] - arrayPrueba2[idx];

//     // if (changeU > 0) {
//     //     // let changeU = arrayPrueba2[idx] - arrayPrueba2[idx + 1];
//     //     arrayGain.push(changeU)
//     // } else if (changeD > 0) {
//     //     // let changeD = arrayPrueba2[idx + 1] - arrayPrueba2[idx];
//     //     arrayLoss.push(changeD);
//     // };
//     //======================================================================================================

// });
// console.log(arrayGain)
// console.log(arrayLoss)

module.exports = rsi;
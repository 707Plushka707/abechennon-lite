const { changeUp, changeDown } = require('./utils');

let objectRsi = new Object();
let arrayRes = new Array;

const rsi = (src, length) => {
    const alpha = 1 / length;
    let res;
    let smooth_up = 0;
    let smooth_down = 0;

    for (i = 1; i <= length; ++i) {
        upward = changeUp(i, src);
        downward = changeDown(i, src);
        smooth_up += upward;
        smooth_down += downward;
    };

    smooth_up /= length;
    smooth_down /= length;

    res = 100.0 * (smooth_up / (smooth_up + smooth_down));
    // console.log("1er: " + res);
    arrayRes.push(res);
    // objectRsi['Rsi'] = res;

    for (i = length + 1; i < src.length; ++i) {
        upward = changeUp(i, src);
        downward = changeDown(i, src);
        smooth_up = (upward - smooth_up) * alpha + smooth_up;
        smooth_down = (downward - smooth_down) * alpha + smooth_down;

        res = 100.0 * (smooth_up / (smooth_up + smooth_down));
        // console.log("2do: " + res);
        // objectRsi['Rsi'] = res;
        arrayRes.push(res);
    };
    return arrayRes;
};

module.exports = rsi;
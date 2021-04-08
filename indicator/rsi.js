const { changeUp, changeDown, srcLength, sumArray, max } = require('./utils');

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

    for (i = length + 1; i < src.length; ++i) {
        upward = changeUp(i, src);
        downward = changeDown(i, src);
        smooth_up = (upward - smooth_up) * alpha + smooth_up;
        smooth_down = (downward - smooth_down) * alpha + smooth_down;

        res = 100.0 * (smooth_up / (smooth_up + smooth_down));
        // console.log("2do: " + res);
    };
    return res;
};

module.exports = rsi;
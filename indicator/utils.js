const change = (curr, idx, src) => {
    if (src[idx] == undefined || src[idx + 1] == undefined) {
        return 0;
    } else {
        let change = src[idx] - src[idx + 1];
        return change;
    };
};

const srcLength = (src, length) => {
    let arrayCloseLength = [];

    src.map((curr, idx, src) => {
            start_idx = idx - length;
            upto_idx = idx;

            if (start_idx >= 0) {
                arrayCloseLength = src.slice(start_idx, upto_idx);
            };
            // console.log(arrayCloseLength);
        })
        // return arrayCloseLength;
};

const sum = (src) => {
    let suma = src.reduce((acc, curr, idx, src) => {
        acc = acc + parseFloat(curr);
        return acc;
    }, 0);
    return suma;
};

module.exports = {
    change,
    srcLength,
    sum
}
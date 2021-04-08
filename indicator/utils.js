// Recibe un array y devuelve la diferencia entre cada elemento
const changeUp = (i, src) => {
    // let upward = src[i] > src[i - 1] ? src[i] - src[i - 1] : 0;
    // return upward;
    if (src[i] == undefined || src[i + 1] == undefined) {
        return 0;
    } else {
        let upward = src[i] > src[i - 1] ? src[i] - src[i - 1] : 0;
        return upward;
    };
};

const changeDown = (i, src) => {
    // let downward = src[i] < src[i - 1] ? src[i - 1] - src[i] : 0;
    // return downward;
    if (src[i] == undefined || src[i + 1] == undefined) {
        return 0;
    } else {
        let downward = src[i] < src[i - 1] ? src[i - 1] - src[i] : 0;
        return downward;
    };
};

// Recibe un array con la coleccion del historico, y devuelve un/unos arrays reducidos con el length que se le pase
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
    return arrayCloseLength;
};

// Devuelve la suma de los elementos del array que se le pase
const sumArray = (src) => {
    let sum = src.reduce((acc, curr, idx, src) => {
        acc = acc + parseFloat(curr);
        return acc;
    }, 0);
    return sum;
};

// Recibe dos argumentos y devuelve el mayor
const max = (a, b) => {
    if (a > b) {
        return a;
    } else {
        return b;
    };
};

module.exports = {
    changeUp,
    changeDown,
    srcLength,
    sumArray,
    max
}
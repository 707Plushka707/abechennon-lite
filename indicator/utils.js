// Recibe un array y devuelve la diferencia entre cada elemento
const change = (curr, idx, src) => {
    if (src[idx] == undefined || src[idx + 1] == undefined) {
        return 0;
    } else {
        let change = src[idx] - src[idx + 1];
        return change;
    };
};

// Recibe un array grande, y devuelve un/unos arrays reducidos con el length que se le pase
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
    change,
    srcLength,
    sumArray,
    max
}
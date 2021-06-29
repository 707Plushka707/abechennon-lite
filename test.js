const primero = () => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve('paso 1');
        }, 5000);
    });
};

const segundo = async() => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve('paso 2');
        }, 3000);
    });
};

const tercero = async() => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve('paso 3');
        }, 1000);
    });
};


const asyncAwait = (async _ => {
    try {
        console.log(`calling`);
        const pri = await primero();
        console.log('primero')
        console.log(`1) ${pri}`);
        const seg = await segundo();
        console.log('segundo')
        console.log(`2) ${seg}`);
        const ter = await tercero();
        console.log('tercero')
        console.log(`3) ${ter}`);
    } catch (error) {
        console.error(error);
    };
})();


// function resolveAfter2Seconds() {
//     return new Promise(resolve => {
//         setTimeout(() => {
//             resolve('resolved');
//         }, 2000);
//     });
// }

// async function asyncCall() {
//     console.log('calling');
//     const result = await resolveAfter2Seconds();
//     console.log(result);
//     // expected output: "resolved"
// }

// asyncCall();
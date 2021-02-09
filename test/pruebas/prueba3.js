const callback = binance.prices("NEOBTC", (error, response) => {
    if (error) {
        console.error(error)
    } else {
        console.log(response)
    }
});


const classicPromise = binance.prices("NEOBTC")
    .then(response => console.log(response))
    .catch(error => console.error(error));


const asyncAwait = (async _ => {
    try {
        const response = await binance.prices("NEOBTC")
        console.log(response)
    } catch (error) {
        console.error(error)
    }
})();

//========================================================//
//========================================================//
//========================================================//
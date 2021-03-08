const strategy1 = (array, period) => {
    let quantity = 0.00043060; //Equivale u$d20 al 09/02/2021
    let calculateRsi = rsi(array, period);

    console.log(`Strategy RSI: ${calculateRsi}`);

    if (calculateRsi < 20) {
        console.log(`Buy ${quantity}`);
        // binance.marketBuy("BTCUSDT", quantity);
    }
    if (calculateRsi > 80) {
        console.log(`Sell ${quantity}`);
        // binance.marketSell("BTCUSDT", quantity);
    } else
        console.log('RSI dentro de rango');
};
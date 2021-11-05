# Abechenoon Margin Trader Bot

## Que es Abechennon?
Es un bot de trading para el exchange ```Binance```, en desarrollo con node js. Abechennon opera a traves del comercio de margin, por lo tanto puede hacer uso del apalancaminto que ofrece Binance y operar tanto en operaciones en largos o cortos (long/short).

## Como funciona?
El bot consume una api externa llamada node-binance-api, la cual usa para comunicarse al exchange binance y asi obtener datos y enviar las ordenes. Por otra lado el bot obtiene las senales a traves de los algoritmos disenados en la estrategia, la estrategia genera las senales que pueden ser "buy", "sell" y "close" (para cerrar posiciones existentes). Una vez que se dispare alguna senal el bot ejecutara la orden que corresponde, si se dispara la senal "buy" se enviara una orden para un prestamo en fiat y luego se comprara el par que disparo la senal, en el caso de "sell" se ejecuta una orden de prestamo de la cryptodivisa y posteriormente se vendera, y si la senal es "close" se vende/compra segun la posicion abierta existente y se reepaga el prestamo existente.

## Lo puede usar?
Claro, actualmente el desarrollo del back-end ya se encuentra avanzado y con las caracteristicas minimas requeridas, por lo cual puede lanzarlo a traves de la terminal/consola para su operacion. Pero unicamente desarrolladores estaran capacitados para su uso ya que el front-end aun no fue desarrollado y la unica manera de cargar la informacion y editar/crear la estrategias sera a traves de la edicion del proyecto en un IDE.

## Como usarlo?
Si eres desarrollador y no quieres esperar a que se complete parte del front-end, puedes hacer hard-code(mala practica),e ingresar los siguientes datos:
#### '.env':
Ingresar su api-key de binance, credenciales de mongoDB
```APIKEY = 'xxxxxxxxxxxxxxxxxxxxxxx'```
```APISECRET = 'xxxxxxxxxxxxxxxxxxxxxxx'```

```MONGODB_CNN = mongodb+srv://xxxxxx:xxxxxx@xxxxxxxxxxxxxxxxxxxxxx```

#### 'trading.js':
```Funcion trading```:
1) Setear: todas las variables que estan al comienzo de la funcion trading
2) Asignar su estrategia a la variable dataBackTesting (dos veces), por default:
let dataBackTesting = await classicRsi(symbol, inputHistoryCandlestick[symbol], invertSignal, true, 14, 30, 70);
3) Asignar su estrategia a la variable signal, por default:
let signal = await classicRsi(symbol, inputHistoryCandlestick[symbol], invertSignal, false, 14, 30, 70);

#### 'strategy.js':
Crear su estrategia o usar las que esten en esa ubicacion (actualmente ```strategyRsi.js``` y ```strategyRsiWithCrossover.js```).
Puede consultar mas estrategias en ```https://github.com/pablob206/abechennon-strategies```

-------------------------------------------------------------------------------------------------
## ***IMPORTANTE:
> El modulo 'node-binance-api' (modulo externo a abechennon) presenta un error desde aproximadamente 30/04/2021, ya fue notificado en el correspoondiente repositorio del proyecto, pero aun no fue fixeado, por lo tanto luego de realizar el npm install debera fixear el modulo 'node-binance-api' manualmente, siguiendo los siguientes pasos.
```
Ubiquese en el archivo:
$ /node_modules/node-binance-api/node-binance-api.js

Busque la funcion "mgAccount" Y reemplaze la linea correspondiente a "const endpoint =" por la siguente linea:
$ const endpoint = 'v1/margin' + (isIsolated?'/isolated':'') + '/account'
```
-------------------------------------------------------------------------------------------------

## Nota: 
```BNB``` no se debe operar, ya que actualmente esta configurado para no tenerlo en cuenta (por que se lo usa para pagar los intereses de los prestamos y las comisiones).
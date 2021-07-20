Abechenoon TraderBot

Que es Abechennon?
Es un bot de trading para el exchange Binance, en desarrollo con node js. Abechennon opera a traves del comercio de margin, por lo tanto puede hacer uso del apalancaminto que ofrece Binance y operar tanto en operaciones en largos o cortos (long/short).

Como funciona?
Por el momento solo funciona en modalidad ping-pong, solo opera un lote por vez: o sea, cuando la estrategia envia una senial de compra, el bot cerrara la posicion existente (en el caso que exista (esta sera un short)) y abrira un long, y lo mismo a la inversa, si se envia una senial buy y al otro intervalo de tiempo se envia otra senial de buy, la segunda es ignorada. Parece obvio no?, pero mas adelante se agregara la opcion para que opere con multiples lotes.
* Ejemplo, ping-pong (un lote a la vez): "ignr" = ignorado 
Senial de la estrategia: buy - sell - buy - sell - sell - sell - buy - sell - buy - buy  - sell - sell - buy - buy  - buy
Operacion de abechennon: buy - sell - buy - sell - ignr - ignr - buy - sell - buy - ignr - sell - ignr - buy - ignr - ignr
* Ejemplo, multi-lote (lotes acumulativos, tambien se podra setear el limite de lotes a usar)
Senial de la estrategia: buy - sell - buy - sell - sell - sell - buy - sell - buy - buy  - sell - sell - buy - buy  - buy
Operacion de abechennon: buy - sell - buy - sell - sell - sell - buy - sell - buy - buy  - sell - sell - buy - buy  - buy

Se puede usar?
Claro, actualmente el desarrollo del back-end ya se encuentra avanzado y con las caracteristicas minimas requeridas, por lo cual puede lanzarlo a traves de la terminal/consola para su operacion. Pero unicamente desarrolladores estaran capacitados para su uso ya que el front-end aun no fue desarrollado y la unica manera de cargar la informacion y editar la estrategia sera a traves de la edicion del proyecto en un IDE.

Como usarlo?
Si eres desarrollador y no quieres esperar a que se complete parte del front-end, puedes hacer hard-code(mala practica),e ingresar los siguientes datos:
* '.env', colocar tu api-key, credenciales de mongoDB
* 'trading', funcion trading (setear: todas las variables que estan al comienzo de la funcion trading)
* 'trading', colocar al objeto "currencies" el nombre de las monedas a operar
* 'strategy', crear su estrategia o usar las que esten en esa ubicacion (actualmente solo strategyRsi.js)
* 'trading', colocar la estrategia deseada a la variable signal
* 'trading', probar la estrategia con backtesting: asignar la estrategia a probar a la variable dataBackTesting

Nota: BNB no se debe operar, ya que actualmente esta configurado para no tenerlo en cuenta (por que se lo usa para pagar los intereses de los prestamos y las comisiones).

Ruta de desarrollo para el back-end: 
* Seguir documentando
* Agregar profit factor al backtesting
* Desarrollar en 'trading.js' la funcion buildNameCurrency (Genera los nombres de las monedas a partir de los nombres de los pares, ej: "ADA" : "ADAUSDT"), y agrega el nombre recuperado de la moneda ("ADA") al objeto "currencies"
* Agregar herramientas de risk manangement (trailing stop, stop loss, profit %, etc)
* Crear las rutas
* Setear los input de los indicadores
* Desarrollar modalidad de multiples lotes(lotes acumulativos) con limite seteables de lotes
* Agregar analisis de herramientas de accion de precios
* Agregar analisis de pool de volumen
* Y muchas otras..

Ruta de desarrollo para el front-end (con EJS): 
* '/', tablas con las ordenes actuales
* '/exchange', input de la key de binance
* '/config, input de la configuracion del bot
* '/backTesting', backtesting y sus input
* '/strategies', configuracion de estrategias
* '/trade-history', historial de trades
* '/support', soporte, documentacion, preguntas/respuestas
* Y muchas otras..